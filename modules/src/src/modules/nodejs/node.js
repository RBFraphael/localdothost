const { EventEmitter } = require("events");
const { getVar, setVar, removeVar, getPath, setPath } = require("../../helpers/envvars");
const { getModulesDir } = require("../../helpers/paths");
const { exec } = require("child_process");
const { existsSync, readdirSync, rmSync } = require("fs");
const path = require("path");
const { shell, ipcMain } = require("electron");
const axios = require("axios");

const nvmDir = path.join(getModulesDir(), "/nvm");
const nvmExe = path.join(nvmDir, "nvm.exe");
const nvmSymlinkDir = path.join(getModulesDir(), "nodejs");
const nvmStatus = new EventEmitter();

const nvm = (action) => {
    switch(action){
        case "install":
            nvmStatus.emit("status", "installing");

            setVar("NVM_HOME", nvmDir, (out) => {
                setVar("NVM_SYMLINK", nvmSymlinkDir, (out) => {
                    getPath((pathArray) => {
                        pathArray.push(nvmDir);
                        pathArray.push(nvmSymlinkDir);

                        setPath(pathArray, () => {
                            setTimeout(getStatus, 1000);
                        });
                    });
                });
            });
            break;
        case "uninstall":
            nvmStatus.emit("status", "uninstalling");

            removeVar("NVM_HOME", () => {
                removeVar("NVM_SYMLINK", () => {
                    if(existsSync(nvmSymlinkDir)){
                        rmSync(nvmSymlinkDir, { recursive: true, force: true });
                    }

                    getPath((pathArray) => {
                        pathArray = pathArray.filter((segment) => (
                            segment !== nvmDir && segment !== nvmSymlinkDir
                        ));

                        setPath(pathArray, () => {
                            setTimeout(getStatus, 1000);
                        });
                    });
                });
            });
            break;
        case "status":
            getStatus();
            break;
    }
};

const getStatus = () => {
    getPath((pathArray) => {
        let inPath = pathArray.indexOf(nvmDir) > -1 && pathArray.indexOf(nvmSymlinkDir) > -1;
        getVar("NVM_HOME", (nvmHomeEnv) => {
            getVar("NVM_SYMLINK", (nvmSymlinkEnv) => {
                if(inPath && nvmHomeEnv !== false && nvmSymlinkEnv !== false){
                    nvmStatus.emit("status", "installed");
                    getVersions();
                } else {
                    nvmStatus.emit("status", "uninstalled");
                }
            });
        });
    });
};

const getVersions = () => {
    getAvailableVersions();
    getInstalledVersions();
    getCurrentVersion();
};

const openConfig = () => {
    shell.openExternal(path.join(nvmDir, "settings.txt"));
};

const openDir = (dir) => {
    switch(dir){
        case "nvm":
            shell.openPath(nvmDir);
            break;
        case "node":
            shell.openPath(nvmSymlinkDir);
            break;
    }
};

const getAvailableVersions = () => {
    axios.get("https://nodejs.org/dist/index.json", {
        headers: { 'Accept': "application/json" }
    }).then((res) => {
        let data = res.data;
        let versions = {};

        data.forEach((version) => {
            let major = version.version.split(".")[0];
            if(major !== "v0"){
                if(versions.hasOwnProperty(major)){
                    let releases = [ ...versions[major].releases, version ];
                    versions[major].releases = releases;
                } else {
                    versions = {
                        ...versions, 
                        [major]: {
                            version: major,
                            lts: version.lts,
                            releases: [version]
                        }
                    };
                }
            }
        });

        nvmStatus.emit("available-versions", versions);
    }).catch((err) => {
        nvmStatus.emit("available-versions", null);
    });
};

const getInstalledVersions = () => {
    let directories = readdirSync(nvmDir, { withFileTypes: true }).filter((item) => item.isDirectory());
    let versions = directories.map((dir) => dir.name.replace(/[^\d.]/, ""));
    nvmStatus.emit("installed-versions", versions);
};

const getCurrentVersion = () => {
    if(existsSync(nvmSymlinkDir)){
        exec("node -v", (error, stdOut, stdErr) => {
            let version = stdOut.trim().replace(/[^\d.]/, "");
            nvmStatus.emit("current-version", version);
        });
    } else {
        nvmStatus.emit("current-version", null);
    }
};

const install = (version) => {
    exec(`${nvmExe} install ${version}`, (err, stdOut, stdErr) => {
        getVersions();
    });
};

const uninstall = (version) => {
    exec(`${nvmExe} uninstall ${version}`, (err, stdOut, stdErr) => {
        getVersions();
    });
};

const setVersion = (version) => {
    exec(`${nvmExe} use ${version}`, (err, stdOut, stdErr) => {
        setTimeout(() => {
            getVersions();
        }, 1000);
    });
};

const init = (appWindow) => {
    ipcMain.on("nvm", (e, action) => { nvm(action); });
    ipcMain.on("nvm-config", (e) => { openConfig(); });
    ipcMain.on("nvm-dir", (e, dir) => { openDir(dir); });
    ipcMain.on("nvm-status", (e) => { getStatus(); });
    ipcMain.on("nvm-versions", (e) => { getVersions(); });
    ipcMain.on("nvm-install", (e, version) => { install(version); });
    ipcMain.on("nvm-uninstall", (e, version) => { uninstall(version); });
    ipcMain.on("nvm-use", (e, version) => { setVersion(version); });

    nvmStatus.on("status", (newStatus) => {
        appWindow.webContents.send("nvm-status", newStatus);
    });

    nvmStatus.on("available-versions", (versions) => {
        appWindow.webContents.send("nvm-available", versions);
    });

    nvmStatus.on("installed-versions", (versions) => {
        appWindow.webContents.send("nvm-installed", versions);
    });

    nvmStatus.on("current-version", (version) => {
        appWindow.webContents.send("nvm-current", version);
    });
};

const finish = () => { };

module.exports = {
    init,
    finish
};