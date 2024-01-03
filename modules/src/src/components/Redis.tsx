import { ISettings } from "@/interfaces/ISettings";
import { PlayArrow, Settings, Stop } from "@mui/icons-material";
import { Box, Button, CircularProgress, Menu, MenuItem, Typography } from "@mui/material";
import { useEffect, useState } from "react";

export default function Redis()
{
    const [status, setStatus] = useState("stopped");
    const [listeningPorts, setListeningPorts] = useState<string[]>([]);
    const [pids, setPids] = useState<string[]>([]);

    const [redisSettingsAnchorEl, setRedisSettingsAnchorEl] = useState(null);
    const redisSettingsOpen = Boolean(redisSettingsAnchorEl);

    const startRedis = () => {
        window.ipcRenderer.send("redis", "start");
    }

    const stopRedis = () => {
        window.ipcRenderer.send("redis", "stop");
    }

    const openRedisSettings = (e: any) => {
        setRedisSettingsAnchorEl(e.currentTarget);
    }

    const onRedisSettingsClose = (option: string|null = null, action: string|null = null) => {
        if(option !== null && action !== null){
            window.ipcRenderer.send(option, action);
        }
        setRedisSettingsAnchorEl(null);
    }

    useEffect(() => {
        window.ipcRenderer.on("localhost-init", (e: any, settings: ISettings) => {
            window.ipcRenderer.send("redis-boot", settings.autostart.redis);
        });

        window.ipcRenderer.on("redis-status", (e: any, status: string) => {
            setStatus(status);
        });
        window.ipcRenderer.on("redis-ports", (e: any, ports: string[]) => {
            setListeningPorts(ports);
        });
        window.ipcRenderer.on("redis-pids", (e: any, pids: string[]) => {
            setPids(pids);
        });
    }, []);

    return (
        <>
            <Box sx={{ width: "100%" }}>
                <Typography variant="h5" sx={{ marginBottom: "1rem" }}>Redis In-Memory Database Server</Typography>
                <Box sx={{ width: "100%", marginBottom: "1rem" }}>
                    { status == "stopped" && (
                        <Button onClick={startRedis} variant="contained" color="success">
                            <PlayArrow sx={{ marginRight: ".5rem" }} />
                            Start Redis Server
                        </Button>
                    ) }
                    { (status == "starting" || status == "stopping") && (
                        <CircularProgress />
                    ) }
                    { status == "running" && (
                        <>
                            <Button onClick={stopRedis} variant="contained" color="error" sx={{ marginRight: "1rem" }}>
                                <Stop sx={{ marginRight: ".5rem" }} />
                                Stop Redis Server
                            </Button>
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
                        <Button variant="contained" color="primary" onClick={openRedisSettings}>
                            <Settings sx={{ marginRight: ".5rem" }} />
                            Redis Settings
                        </Button>
                        <Menu id="redis-settings-menu" open={redisSettingsOpen} anchorEl={redisSettingsAnchorEl} onClose={() => onRedisSettingsClose()}>
                            <MenuItem onClick={() => onRedisSettingsClose("redis-config", "")}>Redis config &lt;redis.cnf&gt;</MenuItem>
                            <MenuItem onClick={() => onRedisSettingsClose("redis-dir", "")}>Open Redis directory</MenuItem>
                        </Menu>
                    </Box>
                </Box>
            </Box>
        </>
    );
}
