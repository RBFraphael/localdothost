const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("ipcRenderer", {
    on: (e, a) => {
        ipcRenderer.on(e, a);
    },
    send: (e, a) => {
        ipcRenderer.send(e, a);
    }
});
