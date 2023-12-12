import { Box, Button, CircularProgress, Menu, MenuItem, Typography } from "@mui/material";
import { useEffect, useState } from "react";

export default function Database()
{
    const [status, setStatus] = useState("stopped");
    const [listeningPorts, setListeningPorts] = useState<string[]>([]);
    const [pids, setPids] = useState<string[]>([]);

    const [mariadbSettingsAnchorEl, setMariadbSettingsAnchorEl] = useState(null);
    const mariadbSettingsOpen = Boolean(mariadbSettingsAnchorEl);

    const [pmaSettingsAnchorEl, setPmaSettingsAnchorEl] = useState(null);
    const pmaSettingsOpen = Boolean(pmaSettingsAnchorEl);

    const startDbServer = () => {
        window.ipcRenderer.send("mariadb", "start");
    }

    const stopDbServer = () => {
        window.ipcRenderer.send("mariadb", "stop");
    }

    const openDbServer = () => {
        window.ipcRenderer.send("mariadb", "open");
    }

    const openMariadbSettings = (e: any) => {
        setMariadbSettingsAnchorEl(e.currentTarget);
    }

    const openPmaSettings = (e: any) => {
        setPmaSettingsAnchorEl(e.currentTarget);
    }

    const onMariadbSettingsClose = (option: string|null = null, action: string|null = null) => {
        if(option !== null && action !== null){
            window.ipcRenderer.send(option, action);
        }
        setMariadbSettingsAnchorEl(null);
    }

    const onPmaSettingsClose = (option: string|null = null, action: string|null = null) => {
        if(option !== null && action !== null){
            window.ipcRenderer.send(option, action);
        }
        setPmaSettingsAnchorEl(null);
    }

    const openHeidiSql = () => {
        window.ipcRenderer.send("heidisql");
    }

    useEffect(() => {
        let autostart = false;
        let appSettingsJson = localStorage.getItem("settings");
        if(appSettingsJson){
            let appSettings = JSON.parse(appSettingsJson);
            autostart = appSettings.autostart?.mariadb ?? false;
        }

        window.ipcRenderer.send("mariadb-boot", autostart);

        window.ipcRenderer.on("mariadb-status", (e: any, status: string) => {
            setStatus(status);
        });
        window.ipcRenderer.on("mariadb-ports", (e: any, ports: string[]) => {
            setListeningPorts(ports);
        });
        window.ipcRenderer.on("mariadb-pids", (e: any, pids: string[]) => {
            setPids(pids);
        });
    }, []);

    return (
        <>
            <Box sx={{ width: "100%" }}>
                <Typography variant="h5" sx={{ marginBottom: "1rem" }}>Database</Typography>
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
                            <Button onClick={openDbServer} variant="contained" color="secondary" sx={{ marginRight: "1rem" }}>Browse</Button>
                            <Button onClick={() => openHeidiSql()} variant="contained" color="secondary">Open Heidi SQL</Button>
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
                            <MenuItem onClick={() => onMariadbSettingsClose("mariadb-config", "mariadb")}>MariaDB config &lt;my.cnf&gt;</MenuItem>
                            <MenuItem onClick={() => onMariadbSettingsClose("mariadb-dir", "mariadb")}>Open MariaDB directory</MenuItem>
                        </Menu>
                    </Box>
                    <Box>
                        <Button variant="contained" color="primary" onClick={openPmaSettings}>Web Manager Settings</Button>
                        <Menu id="pma-settings-menu" open={pmaSettingsOpen} anchorEl={pmaSettingsAnchorEl} onClose={() => onPmaSettingsClose()}>
                            <MenuItem onClick={() => onPmaSettingsClose("mariadb-config", "phpmyadmin")}>phpMyAdmin &lt;config.inc.php&gt;</MenuItem>
                            <MenuItem onClick={() => onPmaSettingsClose("mariadb-dir", "phpmyadmin")}>Open phpMyAdmin directory</MenuItem>
                        </Menu>
                    </Box>
                </Box>
            </Box>
        </>
    );
}
