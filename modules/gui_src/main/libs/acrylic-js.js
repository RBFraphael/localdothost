import { exec } from "child_process";
import { ipcMain, shell } from "electron";
import EventEmitter from "events";
import { join } from "path";
import { lookup } from "../helpers/processes";

var modulesDir = process.env.NODE_ENV === "production" ?
              join(__dirname, "../../../../") : 
              join(__dirname, "../../");

var acrylicDir = join(modulesDir, "/acrylic/2.1.1");
var acrylicStatus = new EventEmitter();

const getAcrylicListeningPorts = () => {
    lookup("AcrylicService", (results) => {
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
                    acrylicStatus.emit("listening", ports);
                }
            });
        });
    });
};

const acrylicServer = (action) => {
    switch(action){
        case "start":
            acrylicStatus.emit("server-changed", "starting");
            exec(`${join(acrylicDir, "AcrylicUI.exe")} StartAcrylicService`, (err, stdout, stderr) => {
                getAcrylicServerStatus();
            });
            break;
        case "stop":
            acrylicStatus.emit("server-changed", "stopping");
            exec(`${join(acrylicDir, "AcrylicUI.exe")} StopAcrylicService`, (err, stdout, stderr) => {
                getAcrylicServerStatus();
            });
            break;
        case "restart":
            acrylicStatus.emit("server-changed", "restarting");
            exec(`${join(acrylicDir, "AcrylicUI.exe")} RestartAcrylicService`, (err, stdout, stderr) => {
                getAcrylicServerStatus();
            });
            break;
        case "cache":
            acrylicStatus.emit("cleaning-cache");
            exec(`${join(acrylicDir, "AcrylicUI.exe")} PurgeAcrylicCacheData`, (err, stdout, stderr) => {
                acrylicStatus.emit("cache-clear");
            });
            break;
        case "status":
            getAcrylicServerStatus();
            break;
    }
};

const acrylicService = (action) => {
    switch(action){
        case "install":
            acrylicStatus.emit("service-changed", "installing");
            exec(`${join(acrylicDir, "AcrylicUI.exe")} InstallAcrylicService`, (err, stdout, stderr) => {
                getAcrylicServiceStatus();
            });
            break;
        case "uninstall":
            acrylicStatus.emit("service-changed", "uninstalling");
            exec(`${join(acrylicDir, "AcrylicUI.exe")} UninstallAcrylicService`, (err, stdout, stderr) => {
                getAcrylicServiceStatus();
            });
            break;
        case "status":
            getAcrylicServiceStatus();
            break;
    }
};

const openAcrylicConfig = (config) => {
    switch(config){
        case "acrylic":
            exec(`${join(acrylicDir, "AcrylicUI.exe")} OpenAcrylicConfigurationFile`);
            break;
        case "hosts":
            exec(`${join(acrylicDir, "AcrylicUI.exe")} OpenAcrylicHostsFile`);
            break;
        case "networks":
            exec(`ncpa.cpl`);
            break;
    }
};

const openAcrylicDir = (dir) => {
    switch(dir){
        case "acrylic":
            shell.openPath(acrylicDir);
            break;
    }
}

const getAcrylicServiceStatus = () => {
    exec("sc queryex type=service | findstr AcrylicDNS", (err, stdout, stderr) => {
        let outData = stdout.trim().replace(/[\n\r]/g, "");
        if(outData.indexOf("AcrylicDNSProxySvc") > -1){
            acrylicStatus.emit("service-changed", "installed");
        } else {
            acrylicStatus.emit("service-changed", "uninstalled");
        }
    });
};

const getAcrylicServerStatus = () => {
    lookup("AcrylicService", (results) => {
        if(results.length == 0){
            acrylicStatus.emit("server-changed", "stopped");
            acrylicStatus.emit("listening", []);
            acrylicStatus.emit("pid", []);
        } else {
            acrylicStatus.emit("server-changed", "running");
            getAcrylicListeningPorts();

            let pid = [];
            results.forEach((process) => pid.push(process.pid));
            acrylicStatus.emit("pid", pid);
        }
    });
};

export const declareAcrylicIpcEvents = () => {
    ipcMain.on("acrylic-server", (e, action) => {
        acrylicServer(action);
    });

    ipcMain.on("acrylic-service", (e, action) => {
        acrylicService(action);
    });

    ipcMain.on("acrylic-config", (e, config) => {
        openAcrylicConfig(config);
    });

    ipcMain.on("acrylic-dir", (e, dir) => {
        openAcrylicDir(dir);
    });

    ipcMain.on("acrylic-service-status", (e) => {
        getAcrylicServiceStatus();
    });

    ipcMain.on("acrylic-server-status", (e) => {
        getAcrylicServerStatus();
    });
};

export const declareAcrylicCallbackEvents = (window) => {
    acrylicStatus.on("cache-clean", () => {
        window.webContents.send("cache-clean");
    });

    acrylicStatus.on("service-changed", (newStatus) => {
        window.webContents.send("acrylic-service-status-changed", newStatus);
    });

    acrylicStatus.on("server-changed", (newStatus) => {
        window.webContents.send("acrylic-server-status-changed", newStatus);
    });

    acrylicStatus.on("listening", (ports) => {
        window.webContents.send("acrylic-listening-ports", ports);
    });

    acrylicStatus.on("pid", (pid) => {
        window.webContents.send("acrylic-pid", pid);
    });
}