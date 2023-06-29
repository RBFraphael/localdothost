import { exec } from "child_process";
import { ipcMain, shell } from "electron";
import EventEmitter from "events";
import { join } from "path";
import { existsSync, rmSync } from "fs";
import { hostname } from "os";
import { kill, lookup } from "../helpers/processes";

var modulesDir = process.env.NODE_ENV === "production" ?
              join(__dirname, "../../../../") : 
              join(__dirname, "../../");

var mariaDbProcess = null;
var mariaDbDir = join(modulesDir, "/mariadb/11.0.2");
var mariaDbStatus = new EventEmitter();

const getMariaDbListeningPorts = () => {
    lookup("mariadbd", (results) => {
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
                    mariaDbStatus.emit("listening", ports);
                }
            });
        });
    });
};

const startMariaDb = () => {
    mariaDbStatus.emit("changed", "starting");

    let dataDir = join(mariaDbDir, "/data");
    if(!existsSync(dataDir)){
        exec(join(mariaDbDir, "/bin/mariadb-install-db.exe"), () => {
            mariaDbProcess = exec(join(mariaDbDir, "/bin/mariadbd.exe"));
            mariaDbProcess.on("spawn", () => {
                getMariaDbStatus();
            });
        });
    } else {
        mariaDbProcess = exec(join(mariaDbDir, "/bin/mariadbd.exe"));
        mariaDbProcess.on("spawn", () => {
            getMariaDbStatus();
        });
    }
};

const stopMariaDb = () => {
    mariaDbStatus.emit("changed", "stopping");

    lookup("mariadbd", (results) => {
        results.forEach((process) => {
            kill(process.pid, () => {
                getMariaDbStatus();

                let pidFile = join(mariaDbDir, `/data/${hostname()}.pid`);
                if(existsSync(pidFile)){
                    rmSync(pidFile);
                }
            });
        });
    });
};

const openMariaDbWeb = () => {
    shell.openExternal("http://localhost/phpmyadmin");
};

const openMariaDbConfig = (configFile) => {
    switch(configFile){
        case "my":
            shell.openPath(join(mariaDbDir, "/data/my.ini"));
            break;
    }
};

const openMariaDbDir = (dir) => {
    switch(dir){
        case "mariadb":
            shell.openPath(mariaDbDir);
            break;
    }
};

const getMariaDbStatus = () => {
    lookup("mariadbd", (results) => {
        if(results.length == 0){
            mariaDbStatus.emit("changed", "stopped");
            mariaDbStatus.emit("listening", []);
            mariaDbStatus.emit("pid", []);
        } else {
            mariaDbStatus.emit("changed", "running");
            getMariaDbListeningPorts();

            let pid = [];
            results.forEach((process) => pid.push(process.pid));
            mariaDbStatus.emit("pid", pid);
        }
    });
}

const mariaDbBoot = (autostart = false) => {
    if(autostart){
        lookup("mariadbd", (results) => {
            if(results.length == 0){
                startMariaDb();
            } else {
                getMariaDbStatus();
            }
        });
    } else {
        getMariaDbStatus();
    }
}

export const declareMariaDbIpcEvents = () => {
    ipcMain.on("mariadb-service", (e, action) => {
        switch(action){
            case "start":        startMariaDb(); break;
            case "stop":         stopMariaDb(); break;
            case "open":         openMariaDbWeb(); break;
        }
    });

    ipcMain.on("mariadb-boot", (e, autostart = false) => {
        mariaDbBoot(autostart);
    });

    ipcMain.on("mariadb-config", (e, action) => {
        openMariaDbConfig(action);
    });

    ipcMain.on("mariadb-dir", (e, action) => {
        openMariaDbDir(action);
    });

    ipcMain.on("mariadb-status", (e) => {
        getMariaDbStatus();
    });
};

export const declareMariaDbCallbackEvents = (window) => {
    mariaDbStatus.on("changed", (newStatus) => {
        window.webContents.send("mariadb-status-changed", newStatus);
    });
    
    mariaDbStatus.on("listening", (ports) => {
        window.webContents.send("mariadb-listening-ports", ports);
    });

    mariaDbStatus.on("pid", (pid) => {
        window.webContents.send("mariadb-pid", pid);
    });
};
