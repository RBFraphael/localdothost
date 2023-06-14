import { exec } from "child_process";
import { ipcMain, shell } from "electron";
import EventEmitter from "events";
import { existsSync, rmSync } from "fs";
import { join } from "path";
import { getPath, getVar, removeVar, setPath, setVar } from "../helpers/envvars";

var modulesDir = process.env.NODE_ENV === "production" ?
              join(__dirname, "../../../../") : 
              join(__dirname, "../../");

var heidiSqlPath = join(modulesDir, "/heidisql/12.5");
var binDir = join(modulesDir, "/bin");
var binStatus = new EventEmitter();

const openHeidiSql = () => {
    shell.openExternal(join(heidiSqlPath, "heidisql.exe"));
};

const bin = (action) => {
    switch(action){
        case "install":
            binStatus.emit("changed", "installing");
            getPath((pathArray) => {
                pathArray.push(binDir);

                setPath(pathArray, () => {
                    setTimeout(() => {
                        getBinStatus();
                    }, 1000);
                });
            });
            break;
        case "uninstall":
            binStatus.emit("changed", "uninstalling");
            getPath((pathArray) => {
                pathArray = pathArray.filter((segment) => (
                    segment !== binDir
                ));

                setPath(pathArray, () => {
                    setTimeout(() => {
                        getBinStatus();
                    }, 1000);
                });
            });
            break;
        case "status":
            getBinStatus();
            break;
    }
};

const getBinStatus = () => {
    getPath((pathArray) => {
        let inPath = pathArray.indexOf(binDir) > -1;
        binStatus.emit("changed", inPath ? "installed" : "uninstalled");
    });
};

export const declareExtrasIpcEvents = () => {
    ipcMain.on("bin", (e, action) => {
        bin(action);
    });

    ipcMain.on("bin-status", (e) => {
        getBinStatus();
    });

    ipcMain.on("heidisql", (e) => {
        openHeidiSql();
    });
}

export const declareExtrasCallbackEvents = (window) => {
    binStatus.on("changed", (newStatus) => {
        window.webContents.send("bin-status-changed", newStatus);
    });
}
