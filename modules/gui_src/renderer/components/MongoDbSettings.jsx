import electron from "electron";
import { Box, Button, CircularProgress, Menu, MenuItem, Typography } from "@mui/material";
import { useEffect, useState } from "react";

const ipcRenderer = electron.ipcRenderer || false;

export default function MongoDbSettings()
{
    const [status, setStatus] = useState("stopped");
    const [listeningPorts, setListeningPorts] = useState([]);
    const [pids, setPids] = useState([]);

    const [mongoDbSettingsAnchorEl, setMongoDbSettingsAnchorEl] = useState(null);
    const mongoDbSettingsOpen = Boolean(mongoDbSettingsAnchorEl);

    const startDbServer = () => {
        ipcRenderer.send("mongodb-service", "start");
    }

    const stopDbServer = () => {
        ipcRenderer.send("mongodb-service", "stop");
    }

    const openDbServer = () => {
        ipcRenderer.send("mongodb-service", "open");
    }

    const openMongoDbSettings = (e) => {
        setMongoDbSettingsAnchorEl(e.currentTarget);
    }

    const onMongoDbSettingsClose = (option = null, action = null) => {
        if(option !== null && action !== null){
            ipcRenderer.send(option, action);
        }
        setMongoDbSettingsAnchorEl(null);
    }

    useEffect(() => {
        let autostart = false;
        let appSettingsJson = localStorage.getItem("settings");
        if(appSettingsJson){
            let appSettings = JSON.parse(appSettingsJson);
            autostart = appSettings.autostart?.mongodb ?? false;
        }

        ipcRenderer.send("mongodb-boot", autostart);

        ipcRenderer.on("mongodb-status-changed", (e, status) => {
            setStatus(status);
        });
        ipcRenderer.on("mongodb-listening-ports", (e, ports) => {
            setListeningPorts(ports);
        });
        ipcRenderer.on("mongodb-pid", (e, pids) => {
            setPids(pids);
        });
    }, []);

    return (
        <>
            <Box sx={{ width: "100%" }}>
                <Typography variant="h5" sx={{ marginBottom: "1rem" }}>MongoDB Database Server Management</Typography>
                <Box sx={{ width: "100%", marginBottom: "1rem" }}>
                    { status == "stopped" && (
                        <Button onClick={startDbServer} variant="contained" color="success">Start Database Server</Button>
                    ) }
                    { (status == "starting" || status == "stopping") && (
                        <CircularProgress />
                    ) }
                    { status == "running" && (
                        <>
                            <Button onClick={stopDbServer} variant="contained" color="error" sx={{ marginRight: "1rem" }}>Stop Database Server</Button>
                            <Button onClick={openDbServer} variant="contained" color="secondary">Browse</Button>
                        </>
                    ) }
                </Box>

                <Box sx={{ marginBottom: "1rem" }}>
                    <Typography variant="body1">
                        <strong>Status:</strong> { status }
                    </Typography>
                    <Typography variant="body1">
                        <strong>Listening ports:</strong> { listeningPorts.join(", ") }
                    </Typography>
                    <Typography variant="body1">
                        <strong>PID:</strong> { pids.join(", ") }
                    </Typography>
                </Box>

                <Box sx={{ marginBottom: "1rem", display: "flex", flexDirection: "row", flexWrap: "wrap", columnGap: "1rem", rowGap: "1rem" }}>
                    <Box>
                        <Button variant="contained" color="primary" onClick={openMongoDbSettings}>Database Settings</Button>
                        <Menu id="mongodb-settings-menu" open={mongoDbSettingsOpen} anchorEl={mongoDbSettingsAnchorEl} onClose={() => onMongoDbSettingsClose()}>
                            <MenuItem onClick={() => onMongoDbSettingsClose("mongodb-config", "mongod")}>MongoDB config &lt;mongod.cnf&gt;</MenuItem>
                            <MenuItem onClick={() => onMongoDbSettingsClose("mongodb-dir", "mongodb")}>Open MongoDB directory</MenuItem>
                            <MenuItem onClick={() => onMongoDbSettingsClose("mongodb-dir", "logs")}>Open Logs directory</MenuItem>
                        </Menu>
                    </Box>
                </Box>
            </Box>
        </>
    );
}