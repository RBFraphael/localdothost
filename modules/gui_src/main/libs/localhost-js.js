import { ipcMain } from "electron"
import EventEmitter from "events";
import { join } from "path";
import fs from "fs";

var modulesDir = process.env.NODE_ENV === "production" ?
              join(__dirname, "../../../../") : 
              join(__dirname, "../../");

var handler = new EventEmitter();

const getThirdPartyAppsVersions = () => {
    let versionsFilePath = join(modulesDir, "versions.json");
    fs.readFile(versionsFilePath, (err, data) => {
        if(!err){
            let versions = JSON.parse(data);
            handler.emit("versions-load", versions);
        }
    });
};

export const declareLocalHostIpcEvents = () => {
    ipcMain.on("localhost-versions", (e) => {
        getThirdPartyAppsVersions();
    });
};

export const declareLocalHostCallbackEvents = (window) => {
    handler.on("versions-load", (versions) => {
        window.webContents.send("localhost-versions-load", versions);
    });
};