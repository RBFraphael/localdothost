import { app, ipcMain } from "electron"
import EventEmitter from "events";
import { join } from "path";
import fs from "fs";
import axios from "axios";
import child_process from "child_process";
import config from "../../config.json";

const githubToken = config.githubToken;

var modulesDir = process.env.NODE_ENV === "production" ?
              join(__dirname, "../../../../") : 
              join(__dirname, "../../");
var updatePackagePath = join(modulesDir, "../update.exe");
var handler = new EventEmitter();
var updateCheckStatus = new EventEmitter();
var updateProcess = null;
var versions = null;

const getThirdPartyAppsVersions = () => {
    let versionsFilePath = join(modulesDir, "versions.json");
    fs.readFile(versionsFilePath, (err, data) => {
        if(!err){
            versions = JSON.parse(data);
            handler.emit("versions-load");
        }
    });
};

const checkForUpdates = () => {
    if(fs.existsSync(updatePackagePath)){
        fs.unlinkSync(updatePackagePath);
    }
    
    if(versions == null){
        getThirdPartyAppsVersions();
    } else {
        updateCheckStatus.emit("checking");

        axios.get("https://api.github.com/repos/rbfraphael/localdothost/releases", {
            headers: {
                'Accept': "application/json",
                'Authorization': `Bearer ${githubToken}`
            }
        }).then((res) => {
            let latestRelease = res.data[0];
            
            let currentVersion = parseInt(versions.gui.replace(/\D/g, ""));
            let latestVersion = parseInt(latestRelease.name.replace(/\D/g, ""));

            if(latestVersion > currentVersion){
                updateCheckStatus.emit("available", latestRelease.name);
            } else {
                updateCheckStatus.emit("updated");
            }
        }).catch((err) => {
            updateCheckStatus.emit("error");
        });
    }
}

const downloadLatestRelease = async () => {
    updateCheckStatus.emit("checking");

    axios.get("https://api.github.com/repos/rbfraphael/localdothost/releases", {
        headers: {
            'Accept': "application/json",
            'Authorization': `Bearer ${githubToken}`
        }
    }).then((res) => {
        let latestRelease = res.data[0];
        let hasUpdatePackage = false;

        latestRelease.assets.forEach((asset) => {
            if(asset.name == "update.exe"){
                hasUpdatePackage = true;
                updateCheckStatus.emit("downloading");

                let updateFile = fs.createWriteStream(updatePackagePath);

                axios({
                    method: "GET",
                    url: asset.browser_download_url,
                    responseType: "stream"
                }).then((res) => {
                    return new Promise((resolve, reject) => {
                        res.data.pipe(updateFile);

                        let error = null;

                        updateFile.on('error', err => {
                            updateCheckStatus.emit("error");
                            error = err;
                            updateFile.close();
                            reject(err);
                        });

                        updateFile.on('close', () => {
                            if (!error) {
                                updateCheckStatus.emit("ready");
                                resolve(true);
                            }
                        });
                    });
                });
            }
        });

        if(!hasUpdatePackage){
            updateCheckStatus.emit("error");
        }
    }).catch((err) => {
        updateCheckStatus.emit("error");
    });
}

const applyUpdate = () => {
    updateProcess = child_process.spawn(updatePackagePath, {
        detached: true
    });

    updateProcess.on("spawn", () => {
        app.quit();
    });
}

export const declareLocalHostIpcEvents = () => {
    ipcMain.on("localhost-versions", (e) => {
        getThirdPartyAppsVersions();
    });

    ipcMain.on("check-for-updates", (e) => {
        checkForUpdates();
    });

    ipcMain.on("download-latest-release", (e) => {
        downloadLatestRelease();
    });

    ipcMain.on("apply-update", (e) => {
        applyUpdate();
    });
};

export const declareLocalHostCallbackEvents = (window) => {
    handler.on("versions-load", () => {
        window.webContents.send("localhost-versions-load", versions);
        checkForUpdates();
    });

    updateCheckStatus.on("checking", () => {
        window.webContents.send("update-check-status", "checking");
    });
    updateCheckStatus.on("available", (newVersion) => {
        window.webContents.send("update-check-status", "available", newVersion);
    });
    updateCheckStatus.on("updated", () => {
        window.webContents.send("update-check-status", "updated");
    });
    updateCheckStatus.on("error", () => {
        window.webContents.send("update-check-status", "error");
    });
    updateCheckStatus.on("downloading", () => {
        window.webContents.send("update-check-status", "downloading");
    });
    updateCheckStatus.on("ready", () => {
        window.webContents.send("update-check-status", "ready");
    });
};