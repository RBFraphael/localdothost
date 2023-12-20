const { spawn } = require("child_process");

const lookup = (process, callback) => {
    tasklist((result) => {
        let processes = result.filter((p) => p.imageName.indexOf(process) > -1);
        callback(processes);
    });
};

const kill = (processId, callback) => {
    let taskkill = spawn("taskkill", `/f /pid ${processId}`.split(" "));
    taskkill.on("exit", () => {
        if(callback){ callback(); }
    });
};

const listeningPorts = (pids, callback) => {
    let check = spawn("netstat", ["-aon"], { detached: true });
    let chunks = [];
    
    check.stdout.on("data", (chunk) => { chunks.push(chunk); });

    check.on("exit", () => {
        let stdout = Buffer.concat(chunks).toString();
        let lines = stdout.split(/\r?\n|\r|\n/g).filter((v) => v.length > 0);
        let ports = [];
    
        lines.forEach((line) => {
            let data = line.split(" ").filter((v) => v.length > 0);
            let pid = data.pop();
    
            if(Array.isArray(pids)){
                if(pids.indexOf(pid) > -1){
                    let port = data[1].split(":").pop();
                    if(ports.indexOf(port) == -1){
                        ports.push(port);
                    }
                }
            } else {
                if(pids == pid){
                    let port = data[1].split(":").pop();
                    if(ports.indexOf(port) == -1){
                        ports.push(port);
                    }
                }
            }
        });
    
        if(callback){
            callback(ports);
        }
    });
}

const tasklist = (callback) => {
    let tasklist = spawn("tasklist", "/fo csv".split(" "), { detached: true });
    let chunks = [];

    tasklist.stdout.on("data", (chunk) => {
        chunks.push(chunk);
    });

    tasklist.on("exit", () => {
        let stdout = Buffer.concat(chunks).toString().trim();
        let processes = [];
        let data = stdout.split(/\r?\n/);

        data.forEach((process, i) => {
            process = process.split(",");
            if(process && process.length >= 4){
                processes.push({
                    imageName: process[0].replace(/['"]+/g, "").trim(),
                    pid: process[1].replace(/['"]+/g, "").trim(),
                    sessionName: process[2].replace(/['"]+/g, "").trim(),
                    session: process[3].replace(/['"]+/g, "").trim(),
                });
            }
        });

        callback(processes);
    });
};

module.exports = {
    lookup,
    kill,
    listeningPorts
};
