import { exec } from "child_process";
import { ipcMain, shell } from "electron";
import EventEmitter from "events";
import { join } from "path";
import { kill, lookup } from "../helpers/processes";
import { existsSync } from "fs";

var modulesDir = process.env.NODE_ENV === "production" ?
              join(__dirname, "../../../../") : 
              join(__dirname, "../../");

var mongoDbProcess = null;
var mongoDbDir = join(modulesDir, "/mongodb/6.0.6");
var compassDir = join(modulesDir, "/compass/1.37.0");
var mongoDbStatus = new EventEmitter();

var listeningPorts = [];

const getMongoDbListeningPorts = () => {
    lookup("mongod", (results) => {
        results.forEach((process) => {
            exec(`netstat -aon | findstr "${process.pid}"`, (err, stdout) => {
                let outputArray = stdout.trim().replace(/[\n\r]/g, "").split(" ").filter((v) => v.trim() !== "");
                listeningPorts = [];

                outputArray.forEach((data, index) => {
                    if(data.toUpperCase() == "TCP" && outputArray[index + 4] == process.pid){
                        let address = outputArray[index + 1];
                        let port = address.split(":").pop();
                        if(listeningPorts.indexOf(port.trim()) == -1){
                            listeningPorts.push(port.trim());
                        }
                    }
                });

                if(listeningPorts.length > 0){
                    mongoDbStatus.emit("listening", listeningPorts);
                }
            });
        });
    });
};

const startMongoaDb = () => {
    mongoDbStatus.emit("changed", "starting");

    let command = `${join(mongoDbDir, "/bin/mongod.exe")} -f ${join(mongoDbDir, "/bin/mongod.conf")}`;
    mongoDbProcess = exec(command);
    mongoDbProcess.on("spawn", () => {
        let interval = setInterval(() => {
            if(listeningPorts.length == 0){
                getMongoDbListeningPorts();
            } else {
                getMongoDbStatus();
                clearInterval(interval);
            }
        }, 500);
    });
};

const stopMongoDb = () => {
    mongoDbStatus.emit("changed", "stopping");

    lookup("mongod", (results) => {
        results.forEach((process) => {
            kill(process.pid, () => {
                let interval = setInterval(() => {
                    lookup("mongod", (results) => {
                        if(results.length == 0){
                            clearInterval(interval);
                            getMongoDbStatus();
                        }
                    });
                }, 500);
            });
        });
    });
};

const openMongoDb = () => {
    shell.openPath(join(compassDir, "/MongoDBCompass.exe"));
};

const openMongoDbConfig = (configFile) => {
    switch(configFile){
        case "mongod":
            shell.openPath(join(mongoDbDir, "/bin/mongod.conf"));
            break;
    }
};

const openMongoDbDir = (dir) => {
    switch(dir){
        case "mongodb":
            shell.openPath(mongoDbDir);
            break;
        case "logs":
            shell.openPath(join(mongoDbDir, "logs"));
            break;
    }
};

const mongoDbBoot = (autostart = false) => {
    if(autostart){
        lookup("mongod", (results) => {
            if(results.length == 0){
                startMongoaDb();
            } else {
                getMongoDbStatus();
            }
        });
    } else {
        getMongoDbStatus();
    }
}

const getMongoDbStatus = () => {
    lookup("mongod", (results) => {
        if(results.length == 0){
            mongoDbStatus.emit("changed", "stopped");
            listeningPorts = [];
            mongoDbStatus.emit("listening", []);
            mongoDbStatus.emit("pid", []);
        } else {
            mongoDbStatus.emit("changed", "running");
            getMongoDbListeningPorts();

            let pid = [];
            results.forEach((process) => pid.push(process.pid));
            mongoDbStatus.emit("pid", pid);
        }
    });
}

export const declareMongoDbIpcEvents = () => {
    ipcMain.on("mongodb-service", (e, action) => {
        switch(action){
            case "start":        startMongoaDb(); break;
            case "stop":         stopMongoDb(); break;
            case "open":         openMongoDb(); break;
        }
    });

    ipcMain.on("mongodb-boot", (e, autostart = false) => {
        mongoDbBoot(autostart);
    });

    ipcMain.on("mongodb-config", (e, action) => {
        openMongoDbConfig(action);
    });

    ipcMain.on("mongodb-dir", (e, action) => {
        openMongoDbDir(action);
    });

    ipcMain.on("mongodb-status", (e) => {
        getMongoDbStatus();
    });
};

export const declareMongoDbCallbackEvents = (window) => {
    mongoDbStatus.on("changed", (newStatus) => {
        window.webContents.send("mongodb-status-changed", newStatus);
    });
    
    mongoDbStatus.on("listening", (ports) => {
        window.webContents.send("mongodb-listening-ports", ports);
    });

    mongoDbStatus.on("pid", (pid) => {
        window.webContents.send("mongodb-pid", pid);
    });
};
