import electron from "electron";
import { Box, Button, CircularProgress, Menu, MenuItem, Typography } from "@mui/material";
import { useEffect, useState } from "react";

const ipcRenderer = electron.ipcRenderer || false;

export default function AcrylicSettings()
{
    const [serverStatus, setServerStatus] = useState("stopped");
    const [serviceStatus, setServiceStatus] = useState("uninstalled");
    const [cacheStatus, setCacheStatus] = useState("");
    const [listeningPorts, setListeningPorts] = useState([]);
    const [pids, setPids] = useState([]);

    const [acrylicSettingsAnchorEl, setAcrylicSettingsAnchorEl] = useState(null);
    const acrylicSettingsOpen = Boolean(acrylicSettingsAnchorEl);

    const acrylicService = (action) => {
        ipcRenderer.send("acrylic-service", action);
    };

    const acrylicServer = (action) => {
        ipcRenderer.send("acrylic-server", action);
    };

    useEffect(() => {
        ipcRenderer.send("acrylic-service-status");

        ipcRenderer.on("acrylic-server-status-changed", (e, status) => {
            setServerStatus(status);
        });

        ipcRenderer.on("acrylic-service-status-changed", (e, status) => {
            setServiceStatus(status);
            if(status == "installed"){
                ipcRenderer.send("acrylic-server-status");
            }
        });

        ipcRenderer.on("acrylic-listening-ports", (e, ports) => {
            setListeningPorts(ports);
        });

        ipcRenderer.on("acrylic-pid", (e, pids) => {
            setPids(pids);
        });

        ipcRenderer.on("cache-clean", () => {
            setCacheStatus("cleared");
            setTimeout(() => {
                setCacheStatus("");
            }, 4000);
        });
    }, []);

    const openAcrylicSettings = (e) => {
        setAcrylicSettingsAnchorEl(e.currentTarget);
    }

    const onAcrylicSettingsClose = (option = null, action = null) => {
        if(option !== null && action !== null){
            ipcRenderer.send(option, action);
        }
        setAcrylicSettingsAnchorEl(null);
    }

    return (
        <>
            <Box sx={{ width: "100%" }}>
                <Typography variant="h5" sx={{ marginBottom: "1rem" }}>Acrylic DNS Proxy Management</Typography>

                <Box sx={{width: "100%", marginBottom: "1rem"}}>
                    <Typography variant="h6" sx={{ marginBottom: "0.5rem" }}>Acrylic Service</Typography>

                    <Typography variant="body1" sx={{ marginBottom: "0.5rem" }}>
                        <strong>Status:</strong> { serviceStatus }
                    </Typography>

                    { serviceStatus == "uninstalled" && (
                        <Button onClick={() => acrylicService("install")} variant="contained" color="success">Install</Button>
                    ) }
                    { (serviceStatus == "installing" || serviceStatus == "uninstalling") && (
                        <CircularProgress />
                    ) }
                    { serviceStatus == "installed" && (
                        <Button onClick={() => acrylicService("uninstall")} variant="contained" color="error">Uninstall</Button>
                    )}
                </Box>

                { serviceStatus == "installed" && (
                    <Box sx={{width: "100%", marginBottom: "1rem"}}>
                        <Typography variant="h6" sx={{ marginBottom: "0.5rem" }}>Acrylic Server</Typography>

                        <Typography variant="body1">
                            <strong>Status:</strong> { serverStatus }
                        </Typography>
                        <Typography variant="body1">
                            <strong>Listening ports:</strong> { listeningPorts.join(", ") }
                        </Typography>
                        <Typography variant="body1" sx={{marginBottom: "0.5rem"}}>
                            <strong>PID:</strong> { pids.join(", ") }
                        </Typography>

                        { serverStatus == "stopped" && (
                            <Button onClick={() => acrylicServer("start")} variant="contained" color="success">Start DNS Proxy Server</Button>
                        ) }
                        { (serverStatus == "starting" || serverStatus == "stopping" || serverStatus == "restarting") && (
                            <CircularProgress />
                        ) }
                        { serverStatus == "running" && (
                            <>
                                <Button onClick={() => acrylicServer("stop")} variant="contained" color="error" sx={{ marginRight: "1rem" }}>Stop DNS Proxy Server</Button>
                                <Button onClick={() => acrylicServer("restart")} variant="contained" color="secondary" sx={{ marginRight: "1rem" }}>Restart DNS Proxy Server</Button>
                            </>
                        ) }
                    </Box>
                ) }

                <Box sx={{ marginBottom: "1rem", display: "flex", flexDirection: "row", flexWrap: "wrap", columnGap: "1rem", rowGap: "1rem" }}>
                    <Box>
                        <Button variant="contained" color="primary" onClick={openAcrylicSettings}>Acrylic Settings</Button>
                        <Menu id="acrylic-settings-menu" open={acrylicSettingsOpen} anchorEl={acrylicSettingsAnchorEl} onClose={() => onAcrylicSettingsClose()}>
                            <MenuItem onClick={() => onAcrylicSettingsClose("acrylic-server", "cache")}>Clean DNS cache</MenuItem>
                            <MenuItem onClick={() => onAcrylicSettingsClose("acrylic-config", "acrylic")}>Open Acrylic config. File</MenuItem>
                            <MenuItem onClick={() => onAcrylicSettingsClose("acrylic-config", "hosts")}>Open Acrylic hosts File</MenuItem>
                            <MenuItem onClick={() => onAcrylicSettingsClose("acrylic-config", "networks")}>Open Network Connections</MenuItem>
                            <MenuItem onClick={() => onAcrylicSettingsClose("acrylic-dir", "acrylic")}>Open Acrylic directory</MenuItem>
                        </Menu>
                    </Box>
                </Box>
            </Box>
        </>
    );
}