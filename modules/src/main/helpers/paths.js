const { app } = require("electron");
const path = require("path");

const appDir = app.isPackaged ? path.join(app.getPath("exe"), "../") : path.join(__dirname, "../../");
const modulesDir = path.join(appDir, "../");

const getAppDir = () => {
    return appDir;
};
const getModulesDir = () => {
    return modulesDir;
};

module.exports = {
    getAppDir,
    getModulesDir
};