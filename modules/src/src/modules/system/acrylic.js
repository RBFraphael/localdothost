const path = require("path");
const { getModulesDir } = require("../../helpers/paths");
const EventEmitter = require("events");
const { shell, ipcMain } = require("electron");
const { lookup, listeningPorts } = require("../../helpers/process");
const { exec } = require("child_process");

const acrylicDir = path.join(getModulesDir(), "acrylic");
const acrylicExe = path.join(acrylicDir, "AcrylicUI.exe");
const acrylicStatus = new EventEmitter();
const dnsCli = path.join(getModulesDir(), "tools/dns.exe");

var serverInterval = null;
var serviceInterval = null;

const server = (action) => {
    switch(action){
        case "start":
            acrylicStatus.emit("server-status", "starting");
            exec(`${acrylicExe} StartAcrylicService`, (err, stdout, stderr) => {
                serverInterval = setInterval(getServerStatus, 1000);
            });
            break;
        case "stop":
            acrylicStatus.emit("server-status", "stopping");
            exec(`${acrylicExe} StopAcrylicService`, (err, stdout, stderr) => {
                clearInterval(serverInterval);
                getServerStatus();
            });
            break;
        case "restart":
            acrylicStatus.emit("server-status", "restarting");
            exec(`${acrylicExe} RestartAcrylicService`, (err, stdout, stderr) => {
                clearInterval(serverInterval);
                serverInterval = setInterval(getServerStatus, 1000);
            });
            break;
        case "cache":
            acrylicStatus.emit("cleaning-cache");
            exec(`${acrylicExe} PurgeAcrylicCacheData`, (err, stdout, stderr) => { acrylicStatus.emit("cache-clear"); });
            break;
        case "status":
            getServerStatus();
            break;
    }
};

const service = (action) => {
    switch(action){
        case "install":
            acrylicStatus.emit("service-status", "installing");
            exec(`${acrylicExe} InstallAcrylicService`, (err, stdout, stderr) => {
                serviceInterval = setInterval(getServiceStatus, 1000);
            });
            break;
        case "uninstall":
            acrylicStatus.emit("service-status", "uninstalling");
            exec(`${acrylicExe} UninstallAcrylicService`, (err, stdout, stderr) => {
                clearInterval(serviceInterval);
                getServiceStatus();
            });
            break;
        case "status":
            getServiceStatus();
            break;
    }
};

const openConfig = (config) => {
    switch(config){
        case "acrylic":
            exec(`${acrylicExe} OpenAcrylicConfigurationFile`);
            break;
        case "hosts":
            exec(`${acrylicExe} OpenAcrylicHostsFile`);
            break;
        case "networks":
            exec("ncpa.cpl");
            break;
    }
};

const openDir = () => {
    shell.openPath(acrylicDir);
};

const getServiceStatus = () => {
    exec("sc queryex type=service | findstr AcrylicDNS", (err, stdout, stderr) => {
        let outData = stdout.trim().replace(/[\n\r]/g, "");
        if(outData.indexOf("AcrylicDNSProxySvc") > -1){
            acrylicStatus.emit("service-status", "installed");
        } else {
            acrylicStatus.emit("service-status", "uninstalled");
        }
    });
};

const getServerStatus = () => {
    lookup("AcrylicService", (results) => {
        if(results.length == 0){
            acrylicStatus.emit("server-status", "stopped");
            acrylicStatus.emit("ports", []);
            acrylicStatus.emit("pids", []);
        } else {
            acrylicStatus.emit("server-status", "running");
            getPids(results, true);
        }
    });
};

const getPorts = (pids) => {
    listeningPorts(pids, (ports) => {
        acrylicStatus.emit("ports", ports);
    });
};

const getPids = (processes, checkPorts = false) => {
    let pids = [];
    processes.forEach((process) => pids.push(process.pid));
    acrylicStatus.emit("pids", pids);

    if(checkPorts){ getPorts(pids); }
}

const setSystemDns = () => {
    exec(`${dnsCli} c 127.0.0.1`, (err, stdout, stderr) => {
        if(err){
            acrylicStatus.emit("dns", "set-error");
        } else {
            acrylicStatus.emit("dns", "set");
        }
    });
};

const resetSystemDns = () => {
    exec(`${dnsCli} r`, (err, stdout, stderr) => {
        if(err){
            acrylicStatus.emit("dns", "reset-error");
        } else {
            acrylicStatus.emit("dns", "reset");
        }
    });
};

const init = (appWindow) => {
    ipcMain.on("acrylic-server", (e, action) => server(action) );
    ipcMain.on("acrylic-service", (e, action) => service(action) );
    ipcMain.on("acrylic-config", (e, config) => openConfig(config) );
    ipcMain.on("acrylic-dir", (e) => openDir() );
    ipcMain.on("acrylic-server-status", (e) => getServerStatus() );
    ipcMain.on("acrylic-service-status", (e) => getServiceStatus() );
    ipcMain.on("acrylic-dns-set", (e) => setSystemDns() );
    ipcMain.on("acrylic-dns-reset", (e) => resetSystemDns() );

    acrylicStatus.on("server-status", (status) => {
        appWindow.webContents.send("acrylic-server-status", status);
    });
    acrylicStatus.on("service-status", (status) => {
        appWindow.webContents.send("acrylic-service-status", status);
    });
    acrylicStatus.on("cleaning-cache", () => {
        appWindow.webContents.send("acrylic-cleaning-cache");
    });
    acrylicStatus.on("cache-clear", () => {
        appWindow.webContents.send("acrylic-cache-clear");
    });
    acrylicStatus.on("pids", (pids) => {
        appWindow.webContents.send("acrylic-pids", pids);
    });
    acrylicStatus.on("ports", (ports) => {
        appWindow.webContents.send("acrylic-ports", ports);
    });
    acrylicStatus.on("dns", (status) => {
        appWindow.webContents.send("acrylic-dns", status);
    });
};

const finish = () => {
    clearInterval(serverInterval);
    clearInterval(serviceInterval);
}

module.exports = {
    init,
    finish
};