import { exec } from "child_process";
import { ipcMain, shell } from "electron";
import EventEmitter from "events";
import { existsSync, rmSync } from "fs";
import { join } from "path";
import { getPath, getVar, removeVar, setPath, setVar } from "../helpers/envvars";

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
    });
};

export const declareNvmCallbackEvents = (window) => {
    nvmStatus.on("changed", (newStatus) => {
        window.webContents.send("nvm-status-changed", newStatus);
    });
};