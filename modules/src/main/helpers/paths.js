const { app } = require("electron");
const path = require("path");

const appDir = app.isPackaged ? path.join(app.getPath("exe"), "../") : path.join(__dirname, "../../");
const modulesDir = path.join(appDir, "../");

console.log("APPDIR", appDir);
console.log("MODULESDIR", modulesDir);

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