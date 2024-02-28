const { app, BrowserWindow, Menu } = require("electron");
const serve = require("electron-serve");
const path = require("path");

const apache = require("./modules/webservers/apache");
const nginx = require("./modules/webservers/nginx");

const mariadb = require("./modules/databases/mariadb");
const mongodb = require("./modules/databases/mongodb");
const postgres = require("./modules/databases/postgresql");
const redis = require("./modules/databases/redis");

const acrylic = require("./modules/system/acrylic");
const cli = require("./modules/system/cli");
const git = require("./modules/system/git");

const node = require("./modules/nodejs/node");

const localhost = require("./modules/localdothost/localhost");
const tray = require("./modules/localdothost/tray");

const appServe = app.isPackaged ? serve({
    directory: path.join(__dirname, "../out")
}) : null;

const createWindow = () => {
    let settings = localhost.loadSettings();

    const win = new BrowserWindow({
        width: 870,
        height: 580,
        title: "Local.Host Admin Panel",
        webPreferences: {
            preload: path.join(__dirname, "preload.js")
        },
        resizable: false,
        show: !settings.startMinimized,
    });

    if(settings.startMinimized){
        tray.init(win);
    }

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

    app.on("second-instance", (e, args, dir) => {
        if(!win.isVisible()){ win.show(); }
        win.focus();
    });

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
            // tray.init(win);
            win.minimize();
            return false;
        } else {
            app.quit();
        }
    });

    return win;
}

app.on("ready", () => {
    let mainInstance = app.requestSingleInstanceLock();
    if(!mainInstance){
        app.quit();
        return;
    }

    let appWindow = createWindow();

    apache.init(appWindow);
    nginx.init(appWindow);

    mariadb.init(appWindow);
    mongodb.init(appWindow);
    postgres.init(appWindow);
    redis.init(appWindow);

    acrylic.init(appWindow);
    cli.init(appWindow);
    git.init(appWindow);
    
    node.init(appWindow);

    localhost.init(appWindow);
});

app.on("before-quit", () => {
    apache.finish();
    nginx.finish();

    mariadb.finish();
    mongodb.finish();
    postgres.finish();
    redis.finish();

    acrylic.finish();
    cli.finish();
    git.finish();

    node.finish();
    
    localhost.finish();
});
