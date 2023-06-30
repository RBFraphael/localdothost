import { exec } from "child_process";
import { ipcMain, shell } from "electron";
import EventEmitter from "events";
import { existsSync, readdirSync, rmSync } from "fs";
import { join } from "path";
import { getPath, getVar, removeVar, setPath, setVar } from "../helpers/envvars";
import axios from "axios";
var modulesDir = process.env.NODE_ENV === "production" ?
              join(__dirname, "../../../../") : 
              join(__dirname, "../../");

var nvmDir = join(modulesDir, "/nvm/1.1.11");
var nvmStatus = new EventEmitter();
var nvmSymlinkDir = join(modulesDir, "nodejs");

const nvm = (action) => {
    switch(action){
        case "install":
            nvmStatus.emit("changed", "installing");

            setVar("NVM_HOME", nvmDir, (out) => {
                setVar("NVM_SYMLINK", nvmSymlinkDir, (out) => {
                    getPath((pathArray) => {
                        pathArray.push(nvmDir);
                        pathArray.push(nvmSymlinkDir);

                        setPath(pathArray, () => {
                            setTimeout(() => {
                                getNvmStatus();
                            }, 1000);
                        });
                    });
                });
            });
            break;
        case "uninstall":
            nvmStatus.emit("changed", "uninstalling");
            removeVar("NVM_HOME", () => {
                removeVar("NVM_SYMLINK", () => {
                    if(existsSync(nvmSymlinkDir)){
                        rmSync(nvmSymlinkDir, {
                            recursive: true,
                            force: true
                        });
                    }

                    getPath((pathArray) => {
                        pathArray = pathArray.filter((segment) => (
                            segment !== nvmDir && segment !== nvmSymlinkDir
                        ));

                        setPath(pathArray, () => {
                            setTimeout(() => {
                                getNvmStatus();
                            }, 1000);
                        });
                    });
                });
            });
            break;
        case "status":
            getNvmStatus();
            break;
    }
};

const getNvmStatus = () => {
    getPath((pathArray) => {
        let inPath = pathArray.indexOf(nvmDir) > -1 && pathArray.indexOf(nvmSymlinkDir) > -1;
        getVar("NVM_HOME", (nvmHomeEnv) => {
            getVar("NVM_SYMLINK", (nvmSymlinkEnv) => {
                if(inPath && nvmHomeEnv !== false && nvmSymlinkEnv !== false){
                    nvmStatus.emit("changed", "installed");
                    checkVersions();
                } else {
                    nvmStatus.emit("changed", "uninstalled");
                }
            });
        });
    });
};

const openNvmConfig = (config) => {
    switch(config){
        case "settings":
            shell.openExternal(join(nvmDir, "settings.txt"));
            break;
    }
};

const openNvmDir = (dir) => {
    switch(dir){
        case "nvm":
            shell.openPath(nvmDir);
            break;
        case "node":
            shell.openPath(nvmSymlinkDir);
            break;
    }
}

const getAvailableVersions = () => {
    axios.get("https://nodejs.org/dist/index.json", {
        headers: {
            'Accept': "application/json"
        }
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
    let directories = readdirSync(nvmDir, { withFileTypes: true }).filter((dirent) => dirent.isDirectory());
    let versions = directories.map((dirent) => dirent.name.replace(/[^\d.]/, ""));
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

const installVersion = (version) => {
    exec(`nvm install ${version}`, (err, stdOut, stdErr) => {
        checkVersions();
    });
};

const uninstallVersion = (version) => {
    exec(`nvm uninstall ${version}`, (err, stdOut, stdErr) => {
        checkVersions();
    });
};

const useVersion = (version) => {
    exec(`nvm use ${version}`, (err, stdOut, stdErr) => {
        checkVersions();
    });
};

const checkVersions = () => {
    getAvailableVersions();
    getInstalledVersions();
    getCurrentVersion();
};

export const declareNvmIpcEvents = () => {
    ipcMain.on("nvm", (e, action) => {
        nvm(action);
    });

    ipcMain.on("nvm-config", (e, config) => {
        openNvmConfig(config);
    });

    ipcMain.on("nvm-dir", (e, dir) => {
        openNvmDir(dir);
    });

    ipcMain.on("nvm-status", (e) => {
        getNvmStatus();
        checkVersions();
    });

    ipcMain.on("nvm-versions", (e) => {
        checkVersions();
    });

    ipcMain.on("nvm-install-version", (e, version) => {
        installVersion(version);
    });
    
    ipcMain.on("nvm-uninstall-version", (e, version) => {
        uninstallVersion(version);
    });

    ipcMain.on("nvm-use-version", (e, version) => {
        useVersion(version);
    });
};

export const declareNvmCallbackEvents = (window) => {
    nvmStatus.on("changed", (newStatus) => {
        window.webContents.send("nvm-status-changed", newStatus);
    });

    nvmStatus.on("available-versions", (versions) => {
        window.webContents.send("nvm-available-versions", versions);
    });

    nvmStatus.on("installed-versions", (versions) => {
        window.webContents.send("nvm-installed-versions", versions);
    });

    nvmStatus.on("current-version", (version) => {
        window.webContents.send("nvm-current-version", version);
    });
};
