import { Box, Button, CircularProgress, Menu, MenuItem, Typography } from "@mui/material";
import { useEffect, useState } from "react";

export default function MongoDb()
{
    const [status, setStatus] = useState("stopped");
    const [listeningPorts, setListeningPorts] = useState<string[]>([]);
    const [pids, setPids] = useState<string[]>([]);

    const [mongoDbSettingsAnchorEl, setMongoDbSettingsAnchorEl] = useState(null);
    const mongoDbSettingsOpen = Boolean(mongoDbSettingsAnchorEl);

    const startDbServer = () => {
        window.ipcRenderer.send("mongodb", "start");
    }

    const stopDbServer = () => {
        window.ipcRenderer.send("mongodb", "stop");
    }

    const openDbServer = () => {
        window.ipcRenderer.send("mongodb", "open");
    }

    const openMongoDbSettings = (e: any) => {
        setMongoDbSettingsAnchorEl(e.currentTarget);
    }

    const onMongoDbSettingsClose = (option: string|null = null, action: string|null = null) => {
        if(option !== null && action !== null){
            window.ipcRenderer.send(option, action);
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

        window.ipcRenderer.send("mongodb-boot", autostart);

        window.ipcRenderer.on("mongodb-status", (e: any, status: string) => {
            setStatus(status);
        });
        window.ipcRenderer.on("mongodb-ports", (e: any, ports: string[]) => {
            setListeningPorts(ports);
        });
        window.ipcRenderer.on("mongodb-pids", (e: any, pids: string[]) => {
            setPids(pids);
        });
    }, []);

    return (
        <>
            <Box sx={{ width: "100%" }}>
                <Typography variant="h5" sx={{ marginBottom: "1rem" }}>MongoDB</Typography>
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
