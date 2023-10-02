import { exec } from "child_process";
import { ipcMain, shell } from "electron";
import EventEmitter from "events";
import { join } from "path";
import { existsSync, rmSync } from "fs";
import { kill, lookup } from "../helpers/processes";

var modulesDir = process.env.NODE_ENV === "production" ?
              join(__dirname, "../../../../") : 
              join(__dirname, "../../");

var apacheProcess = null;
var apacheDir = join(modulesDir, "/apache");
var apacheStatus = new EventEmitter();
var phpDir = join(modulesDir, "/php");

const getApacheListeningPorts = () => {

    lookup("httpd", (results) => {
        results.forEach((process) => {
            exec(`netstat -aon | findstr "${process.pid}"`, (err, stdout) => {
                let outputArray = stdout.trim().replace(/[\n\r]/g, "").split(" ").filter((v) => v.trim() !== "");
                let ports = [];

                outputArray.forEach((data, index) => {
                    if(data.toUpperCase() == "TCP" && outputArray[index + 4] == process.pid){
                        let address = outputArray[index + 1];
                        let port = address.split(":").pop();
                        if(ports.indexOf(port.trim()) == -1){
                            ports.push(port.trim());
                        }
                    }
                });

                if(ports.length > 0){
                    apacheStatus.emit("listening", ports);
                }
            });
        });
    });
};

var runningInterval = null;
const startApache = () => {
    apacheStatus.emit("changed", "starting");
    apacheProcess = exec(join(apacheDir, "/bin/httpd.exe"));

    apacheProcess.on("spawn", () => {
        runningInterval = setInterval(() => {
            lookup("httpd", (results) => {
                if(results.length == 2){
                    getApacheStatus();
                    clearInterval(runningInterval);
                }
            });
        }, 1000);
    });
};

const stopApache = () => {
    apacheStatus.emit("changed", "stopping");

    lookup("php-cgi", (results) => {
        results.forEach((process) => {
            kill(process.pid);
        });
    });

    lookup("httpd", (results) => {
        results.forEach((process) => {
            kill(process.pid, () => {
                let pidFile = join(apacheDir, "/logs/httpd.pid");
                if(existsSync(pidFile)){
                    rmSync(pidFile);
                }

                getApacheStatus();
            });
        });
    })
};

const openApacheWeb = () => {
    shell.openExternal("http://localhost");
};

const openApacheConfig = (configFile) => {
    switch(configFile){
        case "apache":
            shell.openPath(join(apacheDir, "conf/httpd.conf"));
            break;
        case "apache-ssl":
            shell.openPath(join(apacheDir, "conf/extra/httpd-ssl.conf"));
            break;
        case "apache-vhosts":
            shell.openPath(join(apacheDir, "conf/extra/httpd-vhosts.conf"));
            break;
        case "apache-local-host":
            shell.openPath(join(apacheDir, "conf/extra/httpd-local.host.conf"));
            break;
        case "php-5.6":
            shell.openPath(join(phpDir, "5.6/php.ini"));
            break;
        case "php-7.0":
            shell.openPath(join(phpDir, "7.0/php.ini"));
            break;
        case "php-7.2":
            shell.openPath(join(phpDir, "7.2/php.ini"));
            break;
        case "php-7.4":
            shell.openPath(join(phpDir, "7.4/php.ini"));
            break;
        case "php-8.0":
            shell.openPath(join(phpDir, "8.0/php.ini"));
            break;
        case "php-8.2":
            shell.openPath(join(phpDir, "8.2/php.ini"));
            break;
        case "pma":
            shell.openPath(join(modulesDir, "phpmyadmin/config.inc.php"));
            break;
    }
};

const openApacheDir = (dir) => {
    switch(dir){
        case "apache":
            shell.openPath(apacheDir);
            break;
        case "docroot":
            shell.openPath(join(modulesDir, "../www"));
            break;
        case "php":
            shell.openPath(phpDir);
            break;
        case "pma":
            shell.openPath(join(modulesDir, "phpmyadmin"));
            break;
    }
};

const getApacheStatus = () => {
    lookup("httpd", (results) => {
        if(results.length == 0){
            apacheStatus.emit("changed", "stopped");
            apacheStatus.emit("listening", []);
            apacheStatus.emit("pid", []);
        } else if(results.length == 2){
            apacheStatus.emit("changed", "running");
            getApacheListeningPorts();

            let pid = [];
            results.forEach((process) => pid.push(process.pid));
            apacheStatus.emit("pid", pid);
        }
    });
};

const apacheBoot = (autostart = false) => {
    if(autostart){
        lookup("httpd", (results) => {
            if(results.length == 0){
                startApache();
            } else {
                getApacheStatus();
            }
        });
    } else {
        getApacheStatus();
    }
}

export const declareApacheIpcEvents = () => {
    ipcMain.on("apache-service", (e, action) => {
        switch(action){
            case "start":        startApache(); break;
            case "stop":         stopApache(); break;
            case "open":         openApacheWeb(); break;
        }
    });

    ipcMain.on("apache-boot", (e, autostart = false) => {
        apacheBoot(autostart);
    });

    ipcMain.on("apache-config", (e, action) => {
        openApacheConfig(action);
    });

    ipcMain.on("apache-dir", (e, action) => {
        openApacheDir(action);
    });

    ipcMain.on("apache-status", (e) => {
        getApacheStatus();
    });
};

export const declareApacheCallbackEvents = (window) => {
    apacheStatus.on("changed", (newStatus) => {
        window.webContents.send("apache-status-changed", newStatus);
    });
    
    apacheStatus.on("listening", (ports) => {
        window.webContents.send("apache-listening-ports", ports);
    });
    
    apacheStatus.on("pid", (pid) => {
        window.webContents.send("apache-pid", pid);
    });
};
