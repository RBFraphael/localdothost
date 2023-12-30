const { Tray, Menu, app } = require("electron");
const path = require("path");

var tray;

const init = (appWindow) => {
    appWindow.hide();

    if(!tray){
        tray = new Tray(path.join(__dirname, "../../build/icon.ico"));

        const contextMenu = Menu.buildFromTemplate([
            {
                label: 'Show', click: function () {
                    appWindow.show();
                }
            },
            {
                label: 'Exit', click: function () {
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