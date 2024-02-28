const path = require("path");
const { getModulesDir } = require("../../helpers/paths");
const { getPath, setPath } = require("../../helpers/envvars");
const EventEmitter = require("events");
const { ipcMain } = require("electron");
const regedit = require("regedit").promisified;
const elevate = require("windows-elevate");

const gitDir = path.join(getModulesDir(), "/git");
const pathPaths = [
    path.join(gitDir, "/mingw64/bin"),
    path.join(gitDir, "/usr/local/bin"),
    path.join(gitDir, "/usr/bin"),
    path.join(gitDir, "/cmd"),
    path.join(gitDir, "/usr/bin/vendor_perl"),
    path.join(gitDir, "/usr/bin/core_perl"),
];
const registryPath = path.join(gitDir, "registry");
const gitStatus = new EventEmitter();

const git = (action) => {
    switch(action){
        case "install":
            gitStatus.emit("status", "installing");

            getPath((pathArray) => {
                pathPaths.forEach((path) => {
                    if(pathArray.indexOf(path) === -1){
                        pathArray.push(path);
                    }
                });

                setPath(pathArray, () => {
                    setTimeout(getStatus, 1000);
                });
            });
            break;
        case "uninstall":
            gitStatus.emit("status", "uninstalling");

            getPath((pathArray) => {
                pathArray = pathArray.filter((dir) => !pathPaths.includes(dir));

                setPath(pathArray, () => {
                    setTimeout(getStatus, 1000);
                });
            });
            break;
        case "status":
            getStatus();
            break;
        case "add-terminal-profile":
            //
            break;
        case "add-context-menu":
            addContextMenuOptions();
            break;
        case "remove-context-menu":
            removeContextMenuOptions();
            break;
    }
};

const getStatus = () => {
    getPath((pathArray) => {
        let inPath = pathPaths.every((path) => pathArray.indexOf(path) > -1);
        gitStatus.emit("status", inPath ? "installed" : "uninstalled");
    });

    checkContextMenu();
};

const addContextMenuOptions = async () => {
    gitStatus.emit("context-menu", "adding");

    elevate.exec("regedit", ["/S", path.join(gitDir, "registry/add_context_menu.reg")], (err, stdout, stderr) => {
        if(err){
            gitStatus.emit("context-menu", "removed");
        } else {
            gitStatus.emit("context-menu", "added");
        }
    });
};

const removeContextMenuOptions = async () => {
    gitStatus.emit("context-menu", "removing");

    elevate.exec("regedit", ["/S", path.join(gitDir, "registry/remove_context_menu.reg")], (err, stdout, stderr) => {
        if(err){
            gitStatus.emit("context-menu", "added");
        } else {
            gitStatus.emit("context-menu", "removed");
        }
    });
};

const checkContextMenu = async () => {
    let shellKeys = await regedit.list("HKCR\\Directory\\shell");
    let inShell = false;
    if(shellKeys){
        let keys = shellKeys['HKCR\\Directory\\shell'].keys;
        inShell = keys.indexOf("git_gui") > -1 && keys.indexOf("git_shell") > -1;
    }

    let backgroundKeys = await regedit.list("HKCR\\Directory\\Background\\shell");
    let inBackground = false;
    if(backgroundKeys){
        let keys = backgroundKeys['HKCR\\Directory\\Background\\shell'].keys;
        inBackground = keys.indexOf("git_gui") > -1 && keys.indexOf("git_shell") > -1;
    }

    gitStatus.emit("context-menu", (inShell && inBackground) ? "added" : "removed");
}

const init = (appWindow) => {
    ipcMain.on("git", (e, action) => { git(action); });
    ipcMain.on("git-status", (e) => { getStatus(); });
    ipcMain.on("git-context-menu", (e, action) => { action === "add" ? addContextMenuOptions() : removeContextMenuOptions(); });

    gitStatus.on("status", (status) => {
        appWindow.webContents.send("git-status", status);
    });

    gitStatus.on("context-menu", (status) => {
        appWindow.webContents.send("git-context-menu", status);
    });
};

const finish = () => { };

module.exports = {
    init,
    finish
};