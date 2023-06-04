import electron from "electron";
import { Box, Button, CircularProgress, Menu, MenuItem, Typography } from "@mui/material";
import { useEffect, useState } from "react";

const ipcRenderer = electron.ipcRenderer || false;

export default function MariaDbSettings()
{
    const [status, setStatus] = useState("stopped");
    const [listeningPorts, setListeningPorts] = useState([]);
    const [pids, setPids] = useState([]);

    const [mariadbSettingsAnchorEl, setMariadbSettingsAnchorEl] = useState(null);
    const mariadbSettingsOpen = Boolean(mariadbSettingsAnchorEl);

    const [pmaSettingsAnchorEl, setPmaSettingsAnchorEl] = useState(null);
    const pmaSettingsOpen = Boolean(pmaSettingsAnchorEl);

    const startDbServer = () => {
        ipcRenderer.send("mariadb-service", "start");
    }

    const stopDbServer = () => {
        ipcRenderer.send("mariadb-service", "stop");
    }

    const openDbServer = () => {
        ipcRenderer.send("mariadb-service", "open");
    }

    useEffect(() => {
        let autostart = false;
        let appSettingsJson = localStorage.getItem("settings");
        if(appSettingsJson){
            let appSettings = JSON.parse(appSettingsJson);
            autostart = appSettings.autostart?.mariadb ?? false;
        }

        ipcRenderer.send("mariadb-boot", autostart);

        ipcRenderer.on("mariadb-status-changed", (e, status) => {
            setStatus(status);
        });
        ipcRenderer.on("mariadb-listening-ports", (e, ports) => {
            setListeningPorts(ports);
        });
        ipcRenderer.on("mariadb-pid", (e, pids) => {
            setPids(pids);
        });
    }, []);

    const openMariadbSettings = (e) => {
        setMariadbSettingsAnchorEl(e.currentTarget);
    }

    const openPmaSettings = (e) => {
        setPmaSettingsAnchorEl(e.currentTarget);
    }

    const onMariadbSettingsClose = (option = null, action = null) => {
        if(option !== null && action !== null){
            ipcRenderer.send(option, action);
        }
        setMariadbSettingsAnchorEl(null);
    }

    const onPmaSettingsClose = (option = null, action = null) => {
        if(option !== null && action !== null){
            ipcRenderer.send(option, action);
        }
        setPmaSettingsAnchorEl(null);
    }

    return (
        <>
            <Box sx={{ width: "100%" }}>
                <Typography variant="h5" sx={{ marginBottom: "1rem" }}>MariaDB Database Server Management</Typography>
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
                        <Button variant="contained" color="primary" onClick={openMariadbSettings}>Database Settings</Button>
                        <Menu id="mariadb-settings-menu" open={mariadbSettingsOpen} anchorEl={mariadbSettingsAnchorEl} onClose={() => onMariadbSettingsClose()}>
                            <MenuItem onClick={() => onMariadbSettingsClose("mariadb-config", "my")}>MariaDB config &lt;my.cnf&gt;</MenuItem>
                            <MenuItem onClick={() => onMariadbSettingsClose("mariadb-dir", "mariadb")}>Open MariaDB directory</MenuItem>
                        </Menu>
                    </Box>
                    <Box>
                        <Button variant="contained" color="primary" onClick={openPmaSettings}>Web Manager Settings</Button>
                        <Menu id="pma-settings-menu" open={pmaSettingsOpen} anchorEl={pmaSettingsAnchorEl} onClose={() => onPmaSettingsClose()}>
                            <MenuItem onClick={() => onPmaSettingsClose("apache-config", "pma")}>phpMyAdmin &lt;config.inc.php&gt;</MenuItem>
                            <MenuItem onClick={() => onPmaSettingsClose("apache-dir", "pma")}>Open phpMyAdmin directory</MenuItem>
                        </Menu>
                    </Box>
                </Box>
            </Box>
        </>
    );
}