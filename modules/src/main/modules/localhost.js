const path = require("path");
const fs = require("fs");
const { getModulesDir } = require("../helpers/paths");
const EventEmitter = require("events");
const axios = require("axios");
const config = require("../../config.json");
const { spawn } = require("child_process");
const { ipcMain, app, shell } = require("electron");

const updatePackage = path.join(getModulesDir(), "../update.exe");
const versionsFile = path.join(getModulesDir(), "versions.json");
const appSettings = path.join(app.getPath("appData"), "settings.json");
const localhostStatus = new EventEmitter();

var versions = null;
var repoVersions = null;

const localhost = (action) => {
    switch(action){
        case "versions":
            getVersions();
            break;
        case "check-for-updates":
            checkForUpdates();
            break;
    }
};

const getVersions = (checkUpdates = false) => {
    fs.readFile(versionsFile, (err, data) => {
        if(!err){
            versions = JSON.parse(data);
            localhostStatus.emit("versions", versions);
            if(checkUpdates){ checkForUpdates(); }
        }
    });
};

const checkForUpdates = (downloadLatest = false) => {
    if(versions == null){
        getVersions(true);
    } else {
        localhostStatus.emit("status", "checking");

        axios.get("https://api.github.com/repos/rbfraphael/localdothost/releases/latest", {
            headers: {
                'Accept': "application/json",
                'Authorization': `Bearer ${config.githubToken}`
            }
        }).then((res) => {
            let latestRelease = res.data;
            
            let currentVersion = parseInt(versions.gui.replace(/\D/g, ""));
            let latestVersion = parseInt(latestRelease.name.replace(/\D/g, ""));

            if(latestVersion > currentVersion){
                localhostStatus.emit("available", latestRelease.name);
                localhostStatus.emit("status", "available");
                
                if(downloadLatest){
                    downloadLatestRelease();
                }
            } else {
                localhostStatus.emit("status", "updated");
            }
        }).catch((err) => {
            localhostStatus.emit("status", "error");
        });
    }
};

const downloadLatestRelease = async () => {
    if(repoVersions == null){
        checkForUpdates(true);
    } else {
        let latestRelease = repoVersions[0];
        let hasUpdatePackage = false;

        latestRelease.assets.forEach((asset) => {
            if(asset.name == "update.exe"){
                if(fs.existsSync(updatePackage)){ fs.unlinkSync(updatePackage); }
                
                hasUpdatePackage = true;
                localhostStatus.emit("status", "downloading");

                let updateFile = fs.createWriteStream(updatePackage);

                axios({
                    method: "GET",
                    url: asset.browser_download_url,
                    responseType: "stream"
                }).then((res) => {
                    return new Promise((resolve, reject) => {
                        res.data.pipe(updateFile);

                        let error = null;

                        updateFile.on('error', err => {
                            localhostStatus.emit("status", "download-error");
                            error = err;
                            updateFile.close();

                            if(fs.existsSync(updatePackage)){
                                fs.unlinkSync(updatePackage);
                            }

                            reject(err);
                        });

                        updateFile.on('close', () => {
                            if (!error) {
                                localhostStatus.emit("status", "ready");
                                resolve(true);
                            }
                        });
                    });
                }).catch((err) => {
                    localhostStatus.emit("status", "download-error");
                });
            }
        });

        if(!hasUpdatePackage){
            localhostStatus.emit("status", "error");
        }
    }
};

const installUpdatePackage = (appWindow) => {
    let update = spawn(updatePackage, {detached: true});

    update.on("spawn", () => {
        appWindow.close();
    });
};

const saveSettings = (settings) => {
    fs.writeFileSync(appSettings, JSON.stringify(settings));
    loadSettings();
};

const loadSettings = (booting = false) => {
    let settings = {
        autostart: {
            apache: false,
            mariadb: false,
            mongodb: false,
            redis: false
        },
        theme: "light",
        closeToTray: false,
        minimizeToTray: false
    };

    if(fs.existsSync(appSettings)){
        let data = fs.readFileSync(appSettings);
        let loadedSettings = JSON.parse(data);

        settings = {
            ...settings,
            ...loadedSettings
        };
    }

    localhostStatus.emit(booting ? "init" : "settings", settings);
    return settings;
}

const onlineHelp = () => {
    shell.openExternal("https://github.com/RBFraphael/localdothost/wiki");
};

const init = (appWindow) => {
    ipcMain.on("localhost-boot", (e) => { loadSettings(true); });
    ipcMain.on("localhost-versions", (e, checkUpdates = false) => { getVersions(checkUpdates); });
    ipcMain.on("localhost-check-for-updates", (e) => { checkForUpdates(); });
    ipcMain.on("localhost-download-update", (e) => { downloadLatestRelease(); });
    ipcMain.on("localhost-apply-update", (e) => { installUpdatePackage(appWindow); });
    ipcMain.on("localhost-settings", (e, settings) => { saveSettings(settings); });
    ipcMain.on("localhost-help", (e) => { onlineHelp(); });

    localhostStatus.on("status", (status) => {
        appWindow.webContents.send("localhost-status", status);
    });

    localhostStatus.on("versions", (versions) => {
        appWindow.webContents.send("localhost-versions", versions);
    });

    localhostStatus.on("available", (available) => {
        appWindow.webContents.send("localhost-available", available);
    });

    localhostStatus.on("settings", (settings) => {
        appWindow.webContents.send("localhost-settings", settings);
    });

    localhostStatus.on("init", (settings) => {
        appWindow.webContents.send("localhost-init", settings);
    });
};

const finish = () => { };

module.exports = {
    init,
    finish,
    loadSettings
};