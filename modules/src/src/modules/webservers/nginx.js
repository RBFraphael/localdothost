const EventEmitter = require("events");
const { getModulesDir } = require("../../helpers/paths");
const path = require("path");
const fs = require("fs");
const { spawn, exec } = require("child_process");
const { lookup, kill, listeningPorts } = require("../../helpers/process");
const { existsSync, rmSync } = require("fs");
const { ipcMain, shell } = require("electron");
const { loadSettings } = require("../localdothost/localhost");

const nginxDir = path.join(getModulesDir(), "nginx");
const nginxExe = path.join(nginxDir, "/nginx.exe");
const nginxStatus = new EventEmitter();
var process = null;
var websites = [];

const phpDir = path.join(getModulesDir(), "php");
const phpCgiInitializer = path.join(phpDir, "cgi.cmd");
const docRoot = path.join(getModulesDir(), "../www");

var nginxInterval = null;

const boot = (autostart = false) => {
    if(autostart){
        nginx("start");
    } else {
        nginx("status");
    }
};

const nginx = (action) => {
    switch(action){
        case "start":
            nginxStatus.emit("status", "starting");

            let phpProcess = exec(phpCgiInitializer);
            phpProcess.on("spawn", () => {
                process = spawn(nginxExe, ["-p", nginxDir], { detached: true });
                    
                process.on("spawn", () => {
                    if(process.connected){ process.disconnect(); }
                    process.unref();

                    setTimeout(() => {
                        nginxInterval = setInterval(getStatus, 1000 * 1);
                    }, 1000);
                });

                process.on("exit", () => {
                    clearInterval(nginxInterval);
                    setTimeout(getStatus, 1000 * 1);
                });
            });
            break;
        case "stop":
            nginxStatus.emit("status", "stopping");

            lookup("nginx", (results) => {
                results.forEach((p) => {
                    kill(p.pid, () => {
                        getStatus();
                    });
                });
            });

            lookup("php-cgi", (results) => {
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
    lookup("nginx", (results) => {
        if(results.length >= 2){
            nginxStatus.emit("status", "running");
            getPids(results, true);
            listWebsites();
            nginxStatus.emit("websites");
        } else {
            nginxStatus.emit("status", "stopped");
            nginxStatus.emit("pids", []);
            nginxStatus.emit("ports", []);
        }
    });
};

const getPids = (processes, checkPorts = false) => {
    let pids = [];
    processes.forEach((process) => pids.push(process.pid));
    nginxStatus.emit("pids", pids);

    if(checkPorts){ getPorts(pids); }
};

const getPorts = (pids) => {
    listeningPorts(pids, (ports) => {
        nginxStatus.emit("ports", ports);
    });
};

const openConfig = (config) => {
    let configFiles = {
        'nginx': path.join(nginxDir, "conf/nginx.conf"),
        'nginx-localhost': path.join(nginxDir, "conf/localdothost.conf"),
        'nginx-php': path.join(nginxDir, "conf/php.conf"),
        'php56': path.join(phpDir, "5.6/php.ini"),
        'php70': path.join(phpDir, "7.0/php.ini"),
        'php72': path.join(phpDir, "7.2/php.ini"),
        'php74': path.join(phpDir, "7.4/php.ini"),
        'php80': path.join(phpDir, "8.0/php.ini"),
        'php82': path.join(phpDir, "8.2/php.ini"),
        'php83': path.join(phpDir, "8.3/php.ini"),
    };

    if(configFiles.hasOwnProperty(config)){
        shell.openPath(configFiles[config]);
    }
};

const openDir = (dir) => {
    let dirPaths = {
        'nginx': nginxDir,
        'docroot': docRoot,
        'php': phpDir
    };

    if(dirPaths.hasOwnProperty(dir)){
        shell.openPath(dirPaths[dir]);
    }
};

const listWebsites = (dir = null, depth = 0) => {
    if (depth > 3) { return; }

    if (dir == null) {
        websites = [];
        dir = docRoot;
    }
    
    let subdirs = [];

    let dirFiles = fs.readdirSync(dir);
    let dirHasIndex = false;

    dirFiles.forEach((file) => {
        let filePath = path.join(dir, file);
        let fileStats = fs.statSync(filePath);

        if (fileStats.isFile()) {
            let fileExtension = path.extname(filePath);
            let fileName = path.basename(filePath, fileExtension);

            if (fileName == "index" && [".php", ".html", ".htm"].includes(fileExtension)) {
                if (depth == 0) {
                    websites.push("local.host");
                } else {
                    dirHasIndex = true;
                
                    let subdomain = [];
                    let filePathSegments = path.dirname(filePath).split(path.sep);
                    for (let i = 0; i < depth; i++) {
                        subdomain.push(filePathSegments.pop());
                    }
                    
                    websites.push(`${subdomain.join(".")}.local.host`);
                }
            }
        } else if(fileStats.isDirectory()) {
            subdirs.push(file);
        }
    });

    if (!dirHasIndex) {
        subdirs.forEach((subdir) => {
            let subdirPath = path.join(dir, subdir);
            listWebsites(subdirPath, depth + 1);
        });
    }
}

const openSite = (website) => {
    shell.openExternal(`http://${website}`);
}

const init = (appWindow) => {
    ipcMain.on("nginx", (e, action) => nginx(action) );
    ipcMain.on("nginx-boot", (e, autostart) => boot(autostart) );
    ipcMain.on("nginx-status", (e) => getStatus() );
    ipcMain.on("nginx-config", (e, config) => openConfig(config) );
    ipcMain.on("nginx-dir", (e, dir) => openDir(dir));
    ipcMain.on("nginx-websites", (e) => {
        listWebsites();
        nginxStatus.emit("websites");
    });
    ipcMain.on("nginx-open-website", (e, site) => openSite(site));

    nginxStatus.on("status", (status) => {
        appWindow.webContents.send("nginx-status", status);
    });
    nginxStatus.on("pids", (pids) => {
        appWindow.webContents.send("nginx-pids", pids);
    });
    nginxStatus.on("ports", (ports) => {
        appWindow.webContents.send("nginx-ports", ports);
    });
    nginxStatus.on("websites", () => {
        appWindow.webContents.send("nginx-websites", websites);
    });

    let settings = loadSettings();
    boot(settings.autostart.nginx);
};

const finish = () => {
    clearInterval(nginxInterval);
}

module.exports = {
    init,
    finish
};