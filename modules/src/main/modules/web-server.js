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

const phpDir = path.join(getModulesDir(), "php");
const docRoot = path.join(getModulesDir(), "../www");

var apacheInterval = null;

const apache = (action) => {
    switch(action){
        case "start":
            apacheStatus.emit("status", "starting");
            let apache = spawn(apacheExe, { detached: true });

            apache.stderr.on("data", (chunk) => {
                console.log(chunk.toString());
            });

            apache.on("spawn", () => {
                if(apache.connected){ apache.disconnect(); }
                apache.unref();

                setTimeout(() => {
                    apacheInterval = setInterval(getStatus, 1000);
                }, 1000);
            });

            apache.on("exit", () => {
                clearInterval(apacheInterval);
                if(existsSync(apachePidFile)){ rmSync(apachePidFile); }
                getStatus();
            });
            break;
        case "stop":
            apacheStatus.emit("status", "stopping");
            
            lookup("php-cgi", (results) => {
                results.forEach((process) => { kill(process.pid) });
            });

            lookup("httpd", (results) => {
                results.forEach((process) => {
                    kill(process.pid);
                });
            });
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
};

const getPids = (processes, checkPorts = false) => {
    let pids = [];
    processes.forEach((process) => pids.push(process.pid));
    apacheStatus.emit("pids", pids);

    if(checkPorts){ getPorts(pids); }
};

const getPorts = (pids) => {
    listeningPorts(pids, (ports) => {
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
    console.log("Web Server init()");

    ipcMain.on("apache", (e, action) => apache(action) );
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