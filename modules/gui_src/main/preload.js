import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {
    send: (module, action) => {
        ipcRenderer.send(module, action);
    },
    
    handleApacheStatusChange: (callback) => ipcRenderer.on("apache-status-changed", callback),
    handleApacheListeningPorts: (callback) => ipcRenderer.on("apache-listening-ports", callback),

    handleMariaDbStatusChange: (callback) => ipcRenderer.on("mariadb-status-changed", callback),
    handleMariaDbListeningPorts: (callback) => ipcRenderer.on("mariadb-listening-ports", callback),
});