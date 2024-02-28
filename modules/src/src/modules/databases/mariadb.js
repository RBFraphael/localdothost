const EventEmitter = require("events");
const { getModulesDir } = require("../../helpers/paths");
const { spawn } = require("child_process");
const { lookup, kill, listeningPorts } = require("../../helpers/process");
const path = require("path");
const { hostname } = require("os");
const { existsSync, rmSync } = require("fs");
const { shell, ipcMain } = require("electron");
const { loadSettings } = require("../localdothost/localhost");

const mariadbDir = path.join(getModulesDir(), "mariadb");
const mariadbExe = path.join(mariadbDir, "/bin/mariadbd.exe");
const mariadbInstallerExe = path.join(mariadbDir, "/bin/mariadb-install-db.exe");
const mariadbStatus = new EventEmitter();
const mariadbPidFile = path.join(mariadbDir, `/data/${hostname()}.pid`);
const mariadbDataDir = path.join(mariadbDir, `/data`);
var process = null;

var mariadbInterval = null;

const boot = (autostart = false) => {
    if(autostart){
        mariadb("start");
    } else {
        mariadb("status");
    }
};

const mariadb = (action) => {
    const start = () => {
        process = spawn(mariadbExe, {detached: true});

        process.on("spawn", () => {
            if(process.connected){ process.disconnect(); }
            process.unref();
            mariadbInterval = setInterval(getStatus, 1000 * 1);
        });

        process.on("exit", () => {
            clearInterval(mariadbInterval);
            if(existsSync(mariadbPidFile)){ rmSync(mariadbPidFile); }
            setTimeout(getStatus, 1000 * 1);
        });
    };

    switch(action){
        case "start":
            mariadbStatus.emit("status", "starting");
            if(existsSync(mariadbDataDir)){
                start();
            } else {
                spawn(mariadbInstallerExe, {detached: true}).on("exit", () => {
                    start();
                });
            }
            break;
        case "stop":
            mariadbStatus.emit("status", "stopping");

            if(process){
                if(!process.killed){
                    process.kill();
                }
            } else {
                lookup("mariadbd", (results) => {
                    results.forEach((p) => {
                        kill(p.pid, () => {
                            if(existsSync(mariadbPidFile)){ rmSync(mariadbPidFile); }
                            getStatus();
                        });
                    });
                });
            }
            break;
        case "status":
            getStatus();
            break;
        case "open":
            shell.openExternal("http://localhost/phpmyadmin");
            break;
    }
};

const getStatus = () => {
    if(process){
        if(process.killed == false){
            mariadbStatus.emit("status", "running");
            mariadbStatus.emit("pids", [process.pid]);
            listeningPorts(process.pid, (ports) => {
                mariadbStatus.emit("ports", ports);
            });
        } else {
            mariadbStatus.emit("status", "stopped");
            mariadbStatus.emit("pids", []);
            mariadbStatus.emit("ports", []);
        }
    } else {
        lookup("mariadbd", (results) => {
            if(results.length > 0){
                mariadbStatus.emit("status", "running");
                getPids(results, true);
            } else {
                mariadbStatus.emit("status", "stopped");
                mariadbStatus.emit("pids", []);
                mariadbStatus.emit("ports", []);
            }
        });
    }
};

const getPids = (processes, checkPorts = false) => {
    let pids = [];
    processes.forEach((process) => pids.push(process.pid));
    mariadbStatus.emit("pids", pids);

    if(checkPorts){ getPorts(pids); }
};

const getPorts = (pids) => {
    listeningPorts(pids, (ports) => {
        mariadbStatus.emit("ports", ports);
    });
};

const openConfig = (config) => {
    switch(config){
        case "mariadb":
            shell.openPath(path.join(mariadbDir, "/data/my.ini"));
            break;
        case "phpmyadmin":
            shell.openPath(path.join(getModulesDir(), "/phpmyadmin/config.inc.php"));
            break;
    }
};

const openDir = (dir) => {
    switch(dir){
        case "mariadb":
            shell.openPath(mariadbDir);
            break;
        case "phpmyadmin":
            shell.openPath(path.join(getModulesDir(), "/phpmyadmin"));
            break;
    }
};

const init = (appWindow) => {
    ipcMain.on("mariadb", (e, action) => mariadb(action) );
    ipcMain.on("mariadb-boot", (e, autostart) => boot(autostart) );
    ipcMain.on("mariadb-status", (e) => getStatus() );
    ipcMain.on("mariadb-config", (e, config) => openConfig(config) );
    ipcMain.on("mariadb-dir", (e, dir) => openDir(dir) );

    mariadbStatus.on("status", (status) => {
        appWindow.webContents.send("mariadb-status", status);
    });
    mariadbStatus.on("pids", (pids) => {
        appWindow.webContents.send("mariadb-pids", pids);
    });
    mariadbStatus.on("ports", (ports) => {
        appWindow.webContents.send("mariadb-ports", ports);
    });

    let settings = loadSettings();
    boot(settings.autostart.mariadb);
};

const finish = () => {
    clearInterval(mariadbInterval);
}

module.exports = {
    init,
    finish
};