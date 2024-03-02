const EventEmitter = require("events");
const { getModulesDir } = require("../../helpers/paths");
const { spawn, execSync, exec } = require("child_process");
const { lookup, kill, listeningPorts } = require("../../helpers/process");
const path = require("path");
const { hostname } = require("os");
const { existsSync, rmSync } = require("fs");
const { shell, ipcMain } = require("electron");
const { loadSettings } = require("../localdothost/localhost");

const postgresDir = path.join(getModulesDir(), "postgresql");
const postgresExe = path.join(postgresDir, "/bin/pg_ctl.exe");
const postgresInstallerExe = path.join(postgresDir, "/bin/initdb.exe");
const postgresDataDir = path.join(postgresDir, `/data`);
const postgresStatus = new EventEmitter();

const pgAdminDir = path.join(postgresDir, "pgAdmin 4");
const pgAdminExe = path.join(pgAdminDir, "/runtime/pgAdmin4.exe");

var postgresInterval = null;

const boot = (autostart = false) => {
    if(autostart){
        postgres("start");
    } else {
        postgres("status");
    }
};

const postgres = (action) => {
    const start = () => {
        let startProcess = exec(`${postgresExe} start -D ${postgresDataDir}`);
        startProcess.on("spawn", () => {
            postgresInterval = setInterval(getStatus, 1000 * 1);
        });
    };

    const stop = () => {
        exec(`${postgresExe} stop -D ${postgresDataDir}`, (err, stdout, stderr) => {
            clearInterval(postgresInterval);
            getStatus();
        });
    };

    const install = () => {
        exec(`${postgresInstallerExe} -D ${postgresDataDir}`, (err, stdout, stderr) => {
            start();
        });
    }

    switch(action){
        case "start":
            postgresStatus.emit("status", "starting");
            if(!existsSync(postgresDataDir)){
                install();
            } else {
                start();
            }
            break;
        case "stop":
            postgresStatus.emit("status", "stopping");
            stop();
            break;
        case "status":
            getStatus();
            break;
        case "open":
            spawn(pgAdminExe, { detached: true });
            break;
    }
};

const getStatus = () => {
    lookup("postgres", (results) => {
        if(results.length > 0){
            postgresStatus.emit("status", "running");
            getPids(results, true);
        } else {
            postgresStatus.emit("status", "stopped");
            postgresStatus.emit("pids", []);
            postgresStatus.emit("ports", []);
        }
    });
};

const getPids = (processes, checkPorts = false) => {
    let pids = [];
    processes.forEach((process) => pids.push(process.pid));
    postgresStatus.emit("pids", pids);

    if(checkPorts){ getPorts(pids); }
};

const getPorts = (pids) => {
    listeningPorts(pids, (ports) => {
        postgresStatus.emit("ports", ports);
    });
};

const openConfig = (config) => {
    switch(config){
        case "postgres":
            shell.openPath(path.join(postgresDataDir, "/postgresql.conf"));
            break;
    }
};

const openDir = (dir) => {
    switch(dir){
        case "postgres":
            shell.openPath(postgresDir);
            break;
        case "pgadmin":
            shell.openPath(pgAdminDir);
            break;
    }
};

const init = (appWindow) => {
    ipcMain.on("postgres", (e, action) => postgres(action) );
    ipcMain.on("postgres-boot", (e, autostart) => boot(autostart) );
    ipcMain.on("postgres-status", (e) => getStatus() );
    ipcMain.on("postgres-config", (e, config) => openConfig(config) );
    ipcMain.on("postgres-dir", (e, dir) => openDir(dir) );

    postgresStatus.on("status", (status) => {
        appWindow.webContents.send("postgres-status", status);
    });
    postgresStatus.on("pids", (pids) => {
        appWindow.webContents.send("postgres-pids", pids);
    });
    postgresStatus.on("ports", (ports) => {
        appWindow.webContents.send("postgres-ports", ports);
    });

    let settings = loadSettings();
    boot(settings.autostart.postgres);
};

const finish = () => {
    clearInterval(postgresInterval);
}

module.exports = {
    init,
    finish
};