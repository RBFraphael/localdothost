const EventEmitter = require("events");
const { getModulesDir } = require("../helpers/paths");
const path = require("path");
const { spawn } = require("child_process");
const { lookup, kill, listeningPorts } = require("../helpers/process");
const { existsSync, rmSync } = require("fs");
const { ipcMain, shell } = require("electron");

const apacheDir = path.join(getModulesDir(), "apache");
const apacheExe = path.join(apacheDir, "/bin/httpd.exe");
const apachePidFile = path.join(apacheDir, "/logs/httpd.pid");
const apacheStatus = new EventEmitter();
var process = null;

const phpDir = path.join(getModulesDir(), "php");
const docRoot = path.join(getModulesDir(), "../www");

var apacheInterval = null;

const boot = (autostart = false) => {
    if(autostart){
        apache("start");
    } else {
        apache("status");
    }
};

const apache = (action) => {
    switch(action){
        case "start":
            apacheStatus.emit("status", "starting");
            process = spawn(apacheExe, { detached: true });
                
            process.on("spawn", () => {
                if(process.connected){ process.disconnect(); }
                process.unref();

                setTimeout(() => {
                    apacheInterval = setInterval(getStatus, 1000 * 1);
                }, 1000);
            });

            process.on("exit", () => {
                clearInterval(apacheInterval);
                if(existsSync(apachePidFile)){ rmSync(apachePidFile); }
                setTimeout(getStatus, 1000 * 1);
            });
            break;
        case "stop":
            apacheStatus.emit("status", "stopping");

            if(process){
                if(!process.killed){
                    process.kill();
                }
            } else {
                lookup("php-cgi", (results) => {
                    results.forEach((process) => { kill(process.pid) });
                });

                lookup("httpd", (results) => {
                    results.forEach((process) => {
                        kill(process.pid, () => {
                            if(existsSync(apachePidFile)){ rmSync(apachePidFile); }
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
            shell.openExternal("http://localhost");
            break;
    }
};

const getStatus = () => {
    if(process){
        if(process.killed == false){
            apacheStatus.emit("status", "running");
            apacheStatus.emit("pids", [process.pid]);
            listeningPorts(process.pid, (ports) => {
                apacheStatus.emit("ports", ports);
            });
        } else {
            apacheStatus.emit("status", "stopped");
            apacheStatus.emit("pids", []);
            apacheStatus.emit("ports", []);
        }
    } else {
        lookup("httpd", (results) => {
            if(results.length >= 2){
                apacheStatus.emit("status", "running");
                getPids(results, true);
            } else {
                apacheStatus.emit("status", "stopped");
                apacheStatus.emit("pids", []);
                apacheStatus.emit("ports", []);
            }
        });
    }
};

const getPids = (processes, checkPorts = false) => {
    let pids = [];
    processes.forEach((process) => pids.push(process.pid));
    apacheStatus.emit("pids", pids);

    if(checkPorts){ getPorts(pids); }
};

const getPorts = (pids) => {
    listeningPorts(pids, (ports) => {
        console.log(ports);
        apacheStatus.emit("ports", ports);
    });
};

const openConfig = (config) => {
    let configFiles = {
        'apache': path.join(apacheDir, "conf/httpd.conf"),
        'apache-ssl': path.join(apacheDir, "conf/extra/httpd-ssl.conf"),
        'apache-vhosts': path.join(apacheDir, "conf/extra/httpd-vhosts.conf"),
        'apache-localhost': path.join(apacheDir, "conf/extra/httpd-local.host.conf"),
        'php56': path.join(phpDir, "5.6/php.ini"),
        'php70': path.join(phpDir, "7.0/php.ini"),
        'php72': path.join(phpDir, "7.2/php.ini"),
        'php74': path.join(phpDir, "7.4/php.ini"),
        'php80': path.join(phpDir, "8.0/php.ini"),
        'php82': path.join(phpDir, "8.2/php.ini")
    };

    if(configFiles.hasOwnProperty(config)){
        shell.openPath(configFiles[config]);
    }
};

const openDir = (dir) => {
    let dirPaths = {
        'apache': apacheDir,
        'docroot': docRoot,
        'php': phpDir
    };

    if(dirPaths.hasOwnProperty(dir)){
        shell.openPath(dirPaths[dir]);
    }
};

const init = (appWindow) => {
    ipcMain.on("apache", (e, action) => apache(action) );
    ipcMain.on("apache-boot", (e, autostart) => boot(autostart) );
    ipcMain.on("apache-status", (e) => getStatus() );
    ipcMain.on("apache-config", (e, config) => openConfig(config) );
    ipcMain.on("apache-dir", (e, dir) => openDir(dir) );

    apacheStatus.on("status", (status) => {
        appWindow.webContents.send("apache-status", status);
    });
    apacheStatus.on("pids", (pids) => {
        appWindow.webContents.send("apache-pids", pids);
    });
    apacheStatus.on("ports", (ports) => {
        appWindow.webContents.send("apache-ports", ports);
    });
};

const finish = () => {
    clearInterval(apacheInterval);
}

module.exports = {
    init,
    finish
};