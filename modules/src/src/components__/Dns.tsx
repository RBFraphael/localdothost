import { InstallDesktop, PlayArrow, RemoveFromQueue, Replay, Settings, Stop } from "@mui/icons-material";
import { Box, Button, CircularProgress, Menu, MenuItem, Typography } from "@mui/material";
import { useEffect, useState } from "react";

export default function Dns()
{
    const [serverStatus, setServerStatus] = useState("stopped");
    const [serviceStatus, setServiceStatus] = useState("uninstalled");
    const [cacheStatus, setCacheStatus] = useState("");
    const [listeningPorts, setListeningPorts] = useState<string[]>([]);
    const [pids, setPids] = useState<string[]>([]);

    const [acrylicSettingsAnchorEl, setAcrylicSettingsAnchorEl] = useState(null);
    const acrylicSettingsOpen = Boolean(acrylicSettingsAnchorEl);

    useEffect(() => {
        window.ipcRenderer.send("acrylic-service-status");

        window.ipcRenderer.on("acrylic-server-status", (e: any, status: string) => {
            setServerStatus(status);
        });

        window.ipcRenderer.on("acrylic-service-status", (e: any, status: string) => {
            setServiceStatus(status);
            if(status == "installed"){
                window.ipcRenderer.send("acrylic-server-status");
            }
        });

        window.ipcRenderer.on("acrylic-ports", (e: any, ports: string[]) => {
            setListeningPorts(ports);
        });

        window.ipcRenderer.on("acrylic-pids", (e: any, pids: string[]) => {
            setPids(pids);
        });

        window.ipcRenderer.on("acrylic-cache-clear", () => {
            setCacheStatus("cleared");
            setTimeout(() => {
                setCacheStatus("");
            }, 4000);
        });
    }, []);

    const acrylicService = (action: string) => {
        window.ipcRenderer.send("acrylic-service", action);
    };

    const acrylicServer = (action: string) => {
        window.ipcRenderer.send("acrylic-server", action);
    };

    const openAcrylicSettings = (e: any) => {
        setAcrylicSettingsAnchorEl(e.currentTarget);
    }

    const onAcrylicSettingsClose = (option: string|null = null, action: string|null = null) => {
        if(option !== null){
            window.ipcRenderer.send(option, action);
        }
        setAcrylicSettingsAnchorEl(null);
    }
    
    return (
        <>
            <Box sx={{ width: "100%" }}>
                <Typography variant="h5" sx={{ marginBottom: "1rem" }}>DNS Service</Typography>

                <Box sx={{width: "100%", marginBottom: "1rem"}}>
                    <Typography variant="body1" sx={{ marginBottom: "0.5rem" }}>
                        <strong>Status:</strong> { serviceStatus }
                    </Typography>

                    { serviceStatus == "uninstalled" && (
                        <Button onClick={() => acrylicService("install")} variant="contained" color="success">
                            <InstallDesktop sx={{ marginRight: ".5rem" }} />
                            Install
                        </Button>
                    ) }
                    { (serviceStatus == "installing" || serviceStatus == "uninstalling") && (
                        <CircularProgress />
                    ) }
                    { serviceStatus == "installed" && (
                        <Button onClick={() => acrylicService("uninstall")} variant="contained" color="error">
                            <RemoveFromQueue sx={{ marginRight: ".5rem" }} />
                            Uninstall
                        </Button>
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
                            <Button onClick={() => acrylicServer("start")} variant="contained" color="success">
                                <PlayArrow sx={{ marginRight: ".5rem" }} />
                                Start DNS Proxy Server
                            </Button>
                        ) }
                        { (serverStatus == "starting" || serverStatus == "stopping" || serverStatus == "restarting") && (
                            <CircularProgress />
                        ) }
                        { serverStatus == "running" && (
                            <>
                                <Button onClick={() => acrylicServer("stop")} variant="contained" color="error" sx={{ marginRight: "1rem" }}>
                                    <Stop sx={{ marginRight: ".5rem" }} />
                                    Stop DNS Proxy Server
                                </Button>
                                <Button onClick={() => acrylicServer("restart")} variant="contained" color="secondary" sx={{ marginRight: "1rem" }}>
                                    <Replay sx={{ marginRight: ".5rem" }} />
                                    Restart DNS Proxy Server
                                </Button>
                            </>
                        ) }
                    </Box>
                ) }

                <Box sx={{ marginBottom: "1rem", display: "flex", flexDirection: "row", flexWrap: "wrap", columnGap: "1rem", rowGap: "1rem" }}>
                    <Box>
                        <Button variant="contained" color="primary" onClick={openAcrylicSettings}>
                            <Settings sx={{ marginRight: ".5rem" }} />
                            Acrylic Settings
                        </Button>
                        <Menu id="acrylic-settings-menu" open={acrylicSettingsOpen} anchorEl={acrylicSettingsAnchorEl} onClose={() => onAcrylicSettingsClose()}>
                            <MenuItem onClick={() => onAcrylicSettingsClose("acrylic-server", "cache")}>Clean DNS cache</MenuItem>
                            <MenuItem onClick={() => onAcrylicSettingsClose("acrylic-config", "acrylic")}>Open Acrylic config. File</MenuItem>
                            <MenuItem onClick={() => onAcrylicSettingsClose("acrylic-config", "hosts")}>Open Acrylic hosts File</MenuItem>
                            <MenuItem onClick={() => onAcrylicSettingsClose("acrylic-config", "networks")}>Open Network Connections</MenuItem>
                            <MenuItem onClick={() => onAcrylicSettingsClose("acrylic-dir")}>Open Acrylic directory</MenuItem>
                        </Menu>
                    </Box>
                </Box>
            </Box>
        </>
    );
}
