const { exec } = require("child_process");

const appPath = process.env.PATH.split(";").filter((segment) => segment.trim().length > 0).filter((segment) => segment.indexOf("node_modules") > -1);

const getVar = (variable, callback) => {
    variable = variable.toUpperCase();

    exec(`echo %${variable}%`, (err, stdOut, stdErr) => {
        if(err == null){
            if(callback){
                callback(stdOut);
            }
        }
    });
};

const setVar = (variable, value, callback) => {
    variable = variable.toUpperCase();

    process.env = {
        ...process.env,
        [variable]: value
    };

    exec(`setx ${variable} "${value}"`, (err, stdOut, stdErr) => {
        if(err == null){
            if(callback){
                callback(stdOut);
            }
        } else {
            if(callback){
                callback(false);
            }
        }
    });
}

const removeVar = (variable, callback) => {
    exec(`reg delete HKCU\\Environment /F /V ${variable}`, (err, stdOut, stdErr) => {
        if(err == null){
            if(callback){
                callback(stdOut);
            }
        }
    });
}

const getPath = (callback) => {
    exec(`echo %PATH%`, (err, stdOut, stdErr) => {
        let data = stdOut.trim();
        let pathArray = data.split(";").filter((segment) => segment.trim().length > 0);
        let uniquePathArray = [];

        pathArray.forEach((path) => {
            if(uniquePathArray.indexOf(path) == -1 && appPath.indexOf(path) == -1){
                uniquePathArray.push(path);
            }
        });

        if(callback){
            callback(uniquePathArray);
        }
    });
}

const setPath = (pathArray, callback) => {
    let systemPath = pathArray.join(";");
    let envPath = [...appPath, ...pathArray].join(";");

    process.env.PATH = envPath;

    exec(`setx PATH "${systemPath}"`, (err, stdOut, stdErr) => {
        if(err == null){
            if(callback){
                callback(stdOut);
            }
        }
    });
}

module.exports = {
    getVar,
    setVar,
    removeVar,
    getPath,
    setPath
};