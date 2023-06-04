import { exec } from "child_process";

export const lookup = (processName, callback) => {
    tasklist((results) => {
        let processes = results.filter((process) => {
            return process.imageName.indexOf(processName) > -1
        });
    
        callback(processes);
    });
};

export const kill = (processId, callback) => {
    exec(`taskkill /f /pid ${processId}`, (err, stdout, stderr) => {
        if(callback){
            callback();
        }
    });
};

const tasklist = (callback) => {
    exec("tasklist /fo csv", (err, stdout, stderr) => {
        let processes = [];
        let data = stdout.split(/\r?\n/);
        
        data.forEach((processData, index) => {
            if(index > 0){
                processData = processData.split(",");
                if(processData && processData.length >= 4){
                    let process = {
                        imageName: processData[0].replace(/['"]+/g, "").trim(),
                        pid: processData[1].replace(/['"]+/g, "").trim(),
                        sessionName: processData[2].replace(/['"]+/g, "").trim(),
                        session: processData[3].replace(/['"]+/g, "").trim(),
                    };
                    processes.push(process);
                }
            }
        });

        callback(processes);
    });
}