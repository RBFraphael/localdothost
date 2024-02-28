const path = require("path");
const { getModulesDir } = require("../../helpers/paths");
const { spawn } = require("child_process");
const EventEmitter = require("events");
const { lookup, kill, listeningPorts } = require("../../helpers/process");
const { shell, ipcMain } = require("electron");
const { loadSettings } = require("../localdothost/localhost");

const mongodbDir = path.join(getModulesDir(), "/mongodb");
const mongodbExe = path.join(mongodbDir, "/bin/mongod.exe");
const mongodbConfig = path.join(mongodbDir, "/bin/mongod.conf");
const mongodbStatus = new EventEmitter();
var process = null;

const compassDir = path.join(getModulesDir(), "/compass");
const compassExe = path.join(compassDir, "/MongoDBCompass.exe");

var mongodbInterval = null;

const boot = (autostart = false) => {
    if(autostart){
        mongodb("start");
    } else {
        mongodb("status");
    }
};

const mongodb = (action) => {
    switch(action){
        case "start":
            mongodbStatus.emit("status", "starting");
            process = spawn(mongodbExe, ["-f", mongodbConfig], {detached: true});

            process.on("spawn", () => {
                if(process.connected){ process.disconnect(); }
                process.unref();

                setTimeout(() => {
                    mongodbInterval = setInterval(getStatus, 1000 * 1);
                }, 1000);
            });

            process.on("exit", () => {
                clearInterval(mongodbInterval);
                setTimeout(getStatus, 1000 * 1);
            });
            break;
        case "stop":
            mongodbStatus.emit("status", "stopping");
            if(process){
                if(!process.killed){
                    process.kill();
                }
            } else {
                lookup("mongod", (results) => {
                    results.forEach((p) => {
                        kill(p.pid, () => {
                            setTimeout(getStatus, 1000);
                        });
                    });
                });
            }
            break;
        case "status":
            getStatus();
            break;
        case "open":
            spawn(compassExe, { detached: true });
            break;
    }
};

const getStatus = () => {
    if(process){
        if(process.killed == false){
            mongodbStatus.emit("status", "running");
            mongodbStatus.emit("pids", [process.pid]);
            listeningPorts(process.pid, (ports) => {
                mongodbStatus.emit("ports", ports);
            });
        } else {
            mongodbStatus.emit("status", "stopped");
            mongodbStatus.emit("pids", []);
            mongodbStatus.emit("ports", []);
        }
    } else {
        lookup("mongod", (results) => {
            if(results.length > 0){
                mongodbStatus.emit("status", "running");
                getPids(results, true);
            } else {
                mongodbStatus.emit("status", "stopped");
                mongodbStatus.emit("pids", []);
                mongodbStatus.emit("ports", []);
            }
        });
    }
};

const getPids = (processes, checkPorts = false) => {
    let pids = [];
    processes.forEach((process) => pids.push(process.pid));
    mongodbStatus.emit("pids", pids);

    if(checkPorts){ getPorts(pids); }
};

const getPorts = (pids) => {
    listeningPorts(pids, (ports) => {
        mongodbStatus.emit("ports", ports);
    });
};

const openConfig = () => {
    shell.openPath(mongodbConfig);
};

const openDir = (dir) => {
    switch(dir){
        case "mongodb":
            shell.openPath(mongodbDir);
            break;
        case "logs":
            shell.openPath(path.join(mongodbDir, "logs"));
            break;
    }
};

const init = (appWindow) => {
    ipcMain.on("mongodb", (e, action) => mongodb(action) );
    ipcMain.on("mongodb-boot", (e, autostart) => boot(autostart) );
    ipcMain.on("mongodb-status", (e, action) => getStatus() );
    ipcMain.on("mongodb-config", (e, config) => openConfig(config) );
    ipcMain.on("mongodb-dir", (e, dir) => openDir(dir) );

    mongodbStatus.on("status", (status) => {
        appWindow.webContents.send("mongodb-status", status);
    });
    mongodbStatus.on("pids", (pids) => {
        appWindow.webContents.send("mongodb-pids", pids);
    });
    mongodbStatus.on("ports", (ports) => {
        appWindow.webContents.send("mongodb-ports", ports);
    });

    let settings = loadSettings();
    boot(settings.autostart.mongodb);
};

const finish = () => {
    clearInterval(mongodbInterval);
}

module.exports = {
    init,
    finish
};