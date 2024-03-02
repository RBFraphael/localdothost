const path = require("path");
const { getModulesDir } = require("../../helpers/paths");
const { spawn } = require("child_process");
const EventEmitter = require("events");
const { lookup, kill, listeningPorts } = require("../../helpers/process");
const { shell, ipcMain } = require("electron");
const { loadSettings } = require("../localdothost/localhost");

const redisDir = path.join(getModulesDir(), "/redis");
const redisExe = path.join(redisDir, "/redis-server.exe");
const redisConfig = path.join(redisDir, "/redis.conf");
const redisGuiDir = path.join(getModulesDir(), "/redis-gui");
const redisGuiExe = path.join(redisGuiDir, "/Redis GUI.exe");
const redisStatus = new EventEmitter();

var process = null;
var redisInterval = null;

const boot = (autostart = false) => {
    if(autostart){
        redis("start");
    } else {
        redis("status");
    }
};

const redis = (action) => {
    switch(action){
        case "start":
            redisStatus.emit("status", "starting");
            process = spawn(redisExe, {detached: true});

            process.on("spawn", () => {
                if(process.connected){ process.disconnect(); }
                process.unref();

                setTimeout(() => {
                    redisInterval = setInterval(getStatus, 1000 * 1);
                }, 1000);
            });

            process.on("exit", () => {
                clearInterval(redisInterval);
                setTimeout(getStatus, 1000 * 1);
            });
            break;
        case "stop":
            redisStatus.emit("status", "stopping");
            if(process){
                if(!process.killed){
                    process.kill();
                }
            } else {
                lookup("redis-server", (results) => {
                    results.forEach((p) => {
                        kill(p.pid, () => {
                            setTimeout(getStatus, 1000);
                        });
                    });
                });
            }
            break;
        case "open":
            spawn(redisGuiExe, {detached: true});
            break;
        case "status":
            getStatus();
            break;
    }
};

const getStatus = () => {
    if(process){
        if(process.killed == false){
            redisStatus.emit("status", "running");
            redisStatus.emit("pids", [process.pid]);
            listeningPorts(process.pid, (ports) => {
                redisStatus.emit("ports", ports);
            });
        } else {
            redisStatus.emit("status", "stopped");
            redisStatus.emit("pids", []);
            redisStatus.emit("ports", []);
        }
    } else {
        lookup("redis-server", (results) => {
            if(results.length > 0){
                redisStatus.emit("status", "running");
                getPids(results, true);
            } else {
                redisStatus.emit("status", "stopped");
                redisStatus.emit("pids", []);
                redisStatus.emit("ports", []);
            }
        });
    }
};

const getPids = (processes, checkPorts = false) => {
    let pids = [];
    processes.forEach((process) => pids.push(process.pid));
    redisStatus.emit("pids", pids);

    if(checkPorts){ getPorts(pids); }
};

const getPorts = (pids) => {
    listeningPorts(pids, (ports) => {
        redisStatus.emit("ports", ports);
    });
};

const openConfig = () => {
    shell.openPath(redisConfig);
};

const openDir = (dir) => {
    shell.openPath(redisDir);
};

const init = (appWindow) => {
    ipcMain.on("redis", (e, action) => redis(action) );
    ipcMain.on("redis-boot", (e, autostart) => boot(autostart) );
    ipcMain.on("redis-status", (e, action) => getStatus() );
    ipcMain.on("redis-config", (e) => openConfig() );
    ipcMain.on("redis-dir", (e) => openDir() );

    redisStatus.on("status", (status) => {
        appWindow.webContents.send("redis-status", status);
    });
    redisStatus.on("pids", (pids) => {
        appWindow.webContents.send("redis-pids", pids);
    });
    redisStatus.on("ports", (ports) => {
        appWindow.webContents.send("redis-ports", ports);
    });

    let settings = loadSettings();
    boot(settings.autostart.redis);
};

const finish = () => {
    clearInterval(redisInterval);
}

module.exports = {
    init,
    finish
};
