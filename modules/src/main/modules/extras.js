const { EventEmitter } = require("events");
const path = require("path");
const { getModulesDir } = require("../helpers/paths");
const { shell, ipcMain } = require("electron");
const { getPath, setPath } = require("../helpers/envvars");

const binDir = path.join(getModulesDir(), "/bin");
const heidiSqlDir = path.join(getModulesDir(), "/heidisql");
const heidiSqlExe = path.join(heidiSqlDir, "heidisql.exe");

const extrasStatus = new EventEmitter();

const extras = (action) => {
    switch(action){
        case "install":
            extrasStatus.emit("status", "installing");

            getPath((pathArray) => {
                pathArray.push(binDir);
                setPath(pathArray, () => {
                    setTimeout(getStatus, 1000);
                });
            });
            break;
        case "uninstall":
            extrasStatus.emit("status", "uninstalling");
            getPath((pathArray) => {
                pathArray = pathArray.filter((dir) => dir !== binDir);
                setPath(pathArray, () => {
                    setTimeout(getStatus, 1000);
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
        let inPath = pathArray.indexOf(binDir) > -1;
        extrasStatus.emit("status", inPath ? "installed" : "uninstalled");
    });
};

const openHeidiSql = () => {
    shell.openExternal(heidiSqlExe);
}

const init = (appWindow) => {
    console.log("Extras init()");

    ipcMain.on("extras", (e, action) => { extras(action); });
    ipcMain.on("extras-status", (e) => { getStatus; });
    ipcMain.on("heidisql", (e) => { openHeidiSql(); });

    extrasStatus.on("status", (status) => {
        appWindow.webContents.send("extras-status", status);
    });
};

const finish = () => { };

module.exports = {
    init,
    finish
};
