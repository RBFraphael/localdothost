const path = require("path");
const { getModulesDir } = require("../../helpers/paths");
const { getPath, setPath } = require("../../helpers/envvars");
const EventEmitter = require("events");
const { ipcMain } = require("electron");
const regedit = require("regedit").promisified;
const crypto = require("crypto");
const fs = require("fs");
const { exec } = require("child_process");

const gitDir = path.join(getModulesDir(), "/git");
const pathPaths = [
    path.join(gitDir, "/mingw64/bin"),
    path.join(gitDir, "/usr/local/bin"),
    path.join(gitDir, "/usr/bin"),
    path.join(gitDir, "/cmd"),
    path.join(gitDir, "/usr/bin/vendor_perl"),
    path.join(gitDir, "/usr/bin/core_perl"),
];
const gitStatus = new EventEmitter();
const contextMenuExe = path.join(getModulesDir(), "tools/context-menu.exe");

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
    checkTerminalProfile();
};

const addContextMenuOptions = async () => {
    gitStatus.emit("context-menu", "adding");

    exec(`${contextMenuExe} git add`, (err, stdout, stderr) => {
        if(err){
            gitStatus.emit("context-menu", "removed");
        } else {
            gitStatus.emit("context-menu", "added");
        }
    });
};

const removeContextMenuOptions = async () => {
    gitStatus.emit("context-menu", "removing");

    exec(`${contextMenuExe} git remove`, (err, stdout, stderr) => {
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

const terminalProfile = (action) => {
    switch(action){
        case "add":
            addWindowsTerminalProfile();
            break;
        case "remove":
            removeWindowsTerminalProfile();
            break;
        case "status":
            checkTerminalProfile();
            break;
    }
};

const addWindowsTerminalProfile = () => {
    let gitBashExecutable = path.join(gitDir, "bin/bash.exe");
    let gitBashIcon = path.join(gitDir, "mingw64/share/git/git-for-windows.ico");

    let profile = {
        commandline: gitBashExecutable,
        guid: `{${crypto.randomUUID()}}`,
        hidden: false,
        name: "Git Bash",
        icon: gitBashIcon
    };

    let packagesDir = path.join(process.env.LOCALAPPDATA, "Packages");
    let packagesDirContent = fs.readdirSync(packagesDir);

    let terminalDir = null;
    packagesDirContent.forEach((item) => {
        if (item.includes("Microsoft.WindowsTerminal")) {
            terminalDir = path.join(packagesDir, item, "LocalState");
        }
    });

    if (terminalDir) {
        let settingsFile = path.join(terminalDir, "settings.json");

        if(!fs.existsSync(settingsFile)){
            gitStatus.emit("terminal-profile", "not-found");
            return;
        }

        let rawSettings = fs.readFileSync(settingsFile);
        let settings = JSON.parse(rawSettings);

        let hasGitTerminal = false;
        let gitTerminalIndex = -1;
        settings.profiles.list.forEach((profileItem, index) => {
            if (profileItem.name.toLowerCase().includes("git bash")) {
                gitTerminalIndex = index;
                profile.guid = profileItem.guid;
                hasGitTerminal = true;
            }
        });

        if (hasGitTerminal) {
            settings.profiles.list[gitTerminalIndex] = profile;
        } else {
            settings.profiles.list.push(profile);
        }

        fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 4));

        if(hasGitTerminal){
            gitStatus.emit("terminal-profile", "updated");
        } else {
            gitStatus.emit("terminal-profile", "added");
        }
    } else {
        gitStatus.emit("terminal-profile", "not-found");
    }
};

const checkTerminalProfile = () => {
    let packagesDir = path.join(process.env.LOCALAPPDATA, "Packages");
    let packagesDirContent = fs.readdirSync(packagesDir);

    let terminalDir = null;
    packagesDirContent.forEach((item) => {
        if (item.includes("Microsoft.WindowsTerminal")) {
            terminalDir = path.join(packagesDir, item, "LocalState");
        }
    });

    if (terminalDir) {
        let settingsFile = path.join(terminalDir, "settings.json");

        if(!fs.existsSync(settingsFile)){
            gitStatus.emit("terminal-profile", "not-found");
            return;
        }

        let rawSettings = fs.readFileSync(settingsFile);
        let settings = JSON.parse(rawSettings);

        let hasGitTerminal = false;
        settings.profiles.list.forEach((profileItem) => {
            if (profileItem.name.toLowerCase().includes("git bash")) {
                hasGitTerminal = true;
            }
        });

        gitStatus.emit("terminal-profile", hasGitTerminal ? "added" : "removed");
    } else {
        gitStatus.emit("terminal-profile", "not-found");
    }
};

const removeWindowsTerminalProfile = () => {
    let packagesDir = path.join(process.env.LOCALAPPDATA, "Packages");
    let packagesDirContent = fs.readdirSync(packagesDir);

    let terminalDir = null;
    packagesDirContent.forEach((item) => {
        if (item.includes("Microsoft.WindowsTerminal")) {
            terminalDir = path.join(packagesDir, item, "LocalState");
        }
    });

    if (terminalDir) {
        let settingsFile = path.join(terminalDir, "settings.json");

        if(!fs.existsSync(settingsFile)){
            gitStatus.emit("terminal-profile", "not-found");
            return;
        }

        let rawSettings = fs.readFileSync(settingsFile);
        let settings = JSON.parse(rawSettings);

        let gitTerminalIndex = -1;
        settings.profiles.list.forEach((profileItem, index) => {
            if (profileItem.name.toLowerCase().includes("git bash")) {
                gitTerminalIndex = index;
            }
        });

        if (gitTerminalIndex > -1) {
            settings.profiles.list.splice(gitTerminalIndex, 1);
            fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 4));
        }
    }

    checkTerminalProfile();
};

const init = (appWindow) => {
    ipcMain.on("git", (e, action) => { git(action); });
    ipcMain.on("git-status", (e) => { getStatus(); });
    ipcMain.on("git-context-menu", (e, action) => { action === "add" ? addContextMenuOptions() : removeContextMenuOptions(); });
    ipcMain.on("git-terminal-profile", (e, action) => { terminalProfile(action); });

    gitStatus.on("status", (status) => {
        appWindow.webContents.send("git-status", status);
    });

    gitStatus.on("context-menu", (status) => {
        appWindow.webContents.send("git-context-menu", status);
    });

    gitStatus.on("terminal-profile", (status) => {
        appWindow.webContents.send("git-terminal-profile", status);
    });
};

const finish = () => { };

module.exports = {
    init,
    finish
};