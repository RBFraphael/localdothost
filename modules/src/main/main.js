const { app, BrowserWindow, Menu } = require("electron");
const serve = require("electron-serve");
const path = require("path");
const dns = require("./modules/dns");
const webServer = require("./modules/web-server");
const database = require("./modules/database");
const mongodb = require("./modules/mongodb");
const node = require("./modules/node");
const extras = require("./modules/extras");
const localhost = require("./modules/localhost");
const tray = require("./modules/tray");

const appServe = app.isPackaged ? serve({
    directory: path.join(__dirname, "../out")
}) : null;

const createWindow = () => {
    const win = new BrowserWindow({
        width: 780,
        height: 550,
        title: "Local.Host",
        webPreferences: {
            preload: path.join(__dirname, "preload.js")
        },
        resizable: false
    });

    Menu.setApplicationMenu(null);

    if (app.isPackaged && appServe){
        appServe(win).then(() => {
            win.loadURL("app://-");
        });
    } else {
        win.loadURL("http://localhost:3000");
        win.webContents.openDevTools();
        win.webContents.on("did-fail-load", (e, code, desc) => {
            win.webContents.reloadIgnoringCache();
        });
    }

    win.on("minimize", () => {
        let settings = localhost.loadSettings();
        if(settings.minimizeToTray){
            tray.init(win);
        }
    });

    win.on("restore", () => {
        let settings = localhost.loadSettings();
        if(settings.minimizeToTray){
            tray.destroy();
        }
    });

    win.on("close", (event) => {
        let settings = localhost.loadSettings();
        if(settings.closeToTray && !app.isQuiting){
            event.preventDefault();
            tray.init(win);
            return false;
        } else {
            app.quit();
        }
    });

    return win;
}

app.on("ready", () => {
    let appWindow = createWindow();

    dns.init(appWindow);
    webServer.init(appWindow);
    database.init(appWindow);
    mongodb.init(appWindow);
    node.init(appWindow);
    extras.init(appWindow);
    localhost.init(appWindow);
});

app.on("before-quit", () => {
    dns.finish();
    webServer.finish();
    database.finish();
    mongodb.finish();
    node.finish();
    extras.finish();
    localhost.finish();
});
