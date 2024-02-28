const { EventEmitter } = require("events");
const path = require("path");
const { getModulesDir } = require("../../helpers/paths");
const { shell, ipcMain } = require("electron");
const { getPath, setPath } = require("../../helpers/envvars");
const { readFileSync, existsSync, writeFileSync } = require("fs");

const binDir = path.join(getModulesDir(), "/bin");
const heidiSqlDir = path.join(getModulesDir(), "/heidisql");
const heidiSqlExe = path.join(heidiSqlDir, "heidisql.exe");

const cliStatus = new EventEmitter();

const phpCli = path.join(binDir, "php.cmd");
const phpVersions = {
    '5.6': path.join(getModulesDir(), "/modules/php/5.6/php.exe"),
    '7.0': path.join(getModulesDir(), "/modules/php/7.0/php.exe"),
    '7.2': path.join(getModulesDir(), "/modules/php/7.2/php.exe"),
    '7.4': path.join(getModulesDir(), "/modules/php/7.4/php.exe"),
    '8.0': path.join(getModulesDir(), "/modules/php/8.0/php.exe"),
    '8.2': path.join(getModulesDir(), "/modules/php/8.2/php.exe"),
    '8.3': path.join(getModulesDir(), "/modules/php/8.3/php.exe")
};

const extras = (action) => {
    switch(action){
        case "install":
            cliStatus.emit("status", "installing");

            getPath((pathArray) => {
                pathArray.push(binDir);
                setPath(pathArray, () => {
                    setTimeout(getStatus, 1000);
                });
            });
            break;
        case "uninstall":
            cliStatus.emit("status", "uninstalling");
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
        cliStatus.emit("status", inPath ? "installed" : "uninstalled");
    });
};

const openHeidiSql = () => {
    shell.openExternal(heidiSqlExe);
}

const getCliPhpVersion = () => {
    if(existsSync(phpCli)){
        let cliFile = readFileSync(phpCli).toString();
        for(const [version, path] of Object.entries(phpVersions)){
            if(cliFile.indexOf(version) > -1){
                cliStatus.emit("php-cli-version", version);
            }
        }
    }
};

const setCliPhpVersion = (newVersion) => {
    if(typeof newVersion == "number"){
        newVersion = newVersion.toFixed(1).toString();
    }

    if(existsSync(phpCli)){
        let cliFile = readFileSync(phpCli).toString();
        for(const [version, path] of Object.entries(phpVersions)){
            if(cliFile.indexOf(version) > -1){
                cliFile = cliFile.replace(version, newVersion);
                break;
            }
        }
        writeFileSync(phpCli, cliFile);
    }

    getCliPhpVersion();
};

const init = (appWindow) => {
    ipcMain.on("extras", (e, action) => { extras(action); });
    ipcMain.on("extras-status", (e) => { getStatus(); });
    ipcMain.on("heidisql", (e) => { openHeidiSql(); });
    ipcMain.on("php-cli", (e) => { getCliPhpVersion(); });
    ipcMain.on("set-php-cli", (e, version) => { setCliPhpVersion(version); });

    cliStatus.on("status", (status) => {
        appWindow.webContents.send("extras-status", status);
    });

    cliStatus.on("php-cli-version", (version) => {
        appWindow.webContents.send("php-cli-version", version);
    });
};

const finish = () => { };

module.exports = {
    init,
    finish
};
