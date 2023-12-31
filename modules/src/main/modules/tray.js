const { Tray, Menu, app } = require("electron");
const path = require("path");

var tray;

const init = (appWindow) => {
    appWindow.hide();

    if(!tray){
        tray = new Tray(path.join(__dirname, "../../icon.ico"));

        const contextMenu = Menu.buildFromTemplate([
            {
                label: "Web Server",
                click: () => { restoreOnTab(appWindow, "web"); }
            },
            {
                label: "Database",
                click: () => { restoreOnTab(appWindow, "database"); }
            },
            {
                label: "MongoDB",
                click: () => { restoreOnTab(appWindow, "mongodb"); }
            },
            {
                label: "DNS",
                click: () => { restoreOnTab(appWindow, "dns"); }
            },
            {
                label: "NodeJS",
                click: () => { restoreOnTab(appWindow, "node"); }
            },
            {
                type: "separator"
            },
            {
                label: 'Open Admin Panel',
                click: () => { appWindow.show(); }
            },
            {
                label: 'Local.Host Settings',
                click: () => { restoreOnTab(appWindow, "settings") }
            },
            {
                label: 'Exit Local.Host',
                click: () => {
                    app.isQuiting = true;
                    app.quit();
                }
            }
        ]);

        tray.on('double-click', function (event) {
            appWindow.show();
        });

        tray.setToolTip('Local.Host');
        tray.setContextMenu(contextMenu);
    }

    return tray;
};

const restoreOnTab = (appWindow, tab = null) => {
    appWindow.show();
    if(tab){
        appWindow.webContents.send("tab", tab);
    }
};

const destroy = () => {
    if(tray){
        tray.destroy();
        tray = null;
    }
};

module.exports = {
    init,
    destroy
};