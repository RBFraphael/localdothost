const { Tray, Menu, app } = require("electron");
const path = require("path");

var tray;

const init = (appWindow) => {
    appWindow.hide();

    if(!tray){
        tray = new Tray(path.join(__dirname, "../../../icon.ico"));

        const contextMenu = Menu.buildFromTemplate([
            {
                label: "Apache Web Server",
                click: () => { restoreOnTab(appWindow, "web.apache"); }
            },
            {
                label: "NGINX Web Server",
                click: () => { restoreOnTab(appWindow, "web.nginx"); }
            },
            { type: "separator" },
            {
                label: "MariaDB/MySQL Database",
                click: () => { restoreOnTab(appWindow, "database.mariadb"); }
            },
            {
                label: "MongoDB Database",
                click: () => { restoreOnTab(appWindow, "database.mongodb"); }
            },
            {
                label: "PostgreSQL Database",
                click: () => { restoreOnTab(appWindow, "database.postgresql"); }
            },
            {
                label: "Redis Database",
                click: () => { restoreOnTab(appWindow, "database.redis"); }
            },
            { type: "separator" },
            {
                label: "NodeJS",
                click: () => { restoreOnTab(appWindow, "nodejs"); }
            },
            {
                label: "CLI Tools",
                click: () => { restoreOnTab(appWindow, "system.cli"); }
            },
            {
                label: "DNS",
                click: () => { restoreOnTab(appWindow, "system.dns"); }
            },
            {
                label: "Git",
                click: () => { restoreOnTab(appWindow, "system.git"); }
            },
            {
                type: "separator"
            },
            {
                label: 'Open Admin Panel',
                click: () => { appWindow.show(); }
            },
            {
                label: "About",
                click: () => { restoreOnTab(appWindow, "localhost.about"); }
            },
            {
                label: "Autostart",
                click: () => { restoreOnTab(appWindow, "localhost.autostart"); }
            },
            {
                label: "Settings",
                click: () => { restoreOnTab(appWindow, "localhost.settings"); }
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