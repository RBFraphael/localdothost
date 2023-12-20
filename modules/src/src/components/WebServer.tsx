import electron from "electron";
import { Box, Button, CircularProgress, IconButton, List, ListItem, ListItemText, Menu, MenuItem, Paper, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import LinkIcon from "@mui/icons-material/Launch";
import { ISettings } from "@/interfaces/ISettings";

export default function WebServer()
{
    const [status, setStatus] = useState("stopped");
    const [listeningPorts, setListeningPorts] = useState<string[]>([]);
    const [pids, setPids] = useState<string[]>([]);

    const [apacheWebsites, setApacheWebsites] = useState([]);

    const [apacheSettingsAnchorEl, setApacheSettingsAnchorEl] = useState(null);
    const apacheSettingsOpen = Boolean(apacheSettingsAnchorEl);

    const [phpSettingsAnchorEl, setPhpSettingsAnchorEl] = useState(null);
    const phpSettingsOpen = Boolean(phpSettingsAnchorEl);

    const startWebServer = () => {
        window.ipcRenderer.send("apache", "start");
    }

    const stopWebServer = () => {
        window.ipcRenderer.send("apache", "stop");
    }

    const openWebServer = () => {
        window.ipcRenderer.send("apache", "open");
    }

    const openApacheSettings = (e: any) => {
        setApacheSettingsAnchorEl(e.currentTarget);
    }

    const openPhpSettings = (e: any) => {
        setPhpSettingsAnchorEl(e.currentTarget);
    }

    const onApacheSettingsClose = (option: string|null = null, action: string|null = null) => {
        if(option !== null && action !== null){
            window.ipcRenderer.send(option, action);
        }
        setApacheSettingsAnchorEl(null);
    }

    const onPhpSettingsClose = (option: string|null = null, action: string|null = null) => {
        if(option !== null && action !== null){
            window.ipcRenderer.send(option, action);
        }
        setPhpSettingsAnchorEl(null);
    }

    useEffect(() => {
        window.ipcRenderer.on("localhost-init", (e: any, settings: ISettings) => {
            window.ipcRenderer.send("apache-boot", settings.autostart.apache);
        });

        window.ipcRenderer.on("apache-status", (e: any, status: string) => {
            setStatus(status);
        });

        window.ipcRenderer.on("apache-ports", (e: any, ports: string[]) => {
            setListeningPorts(ports);
        });

        window.ipcRenderer.on("apache-pids", (e: any, pids: string[]) => {
            setPids(pids);
        });
    }, []);

    return (
        <>
            <Box sx={{ width: "100%" }}>
                <Typography variant="h5" sx={{ marginBottom: "1rem" }}>Web Server</Typography>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Box sx={{ width: "49%" }}>
                        <Box sx={{ width: "100%", marginBottom: "1rem" }}>
                            { status == "stopped" && (
                                <Button onClick={startWebServer} variant="contained" color="success">Start Web Server</Button>
                            ) }
                            { (status == "starting" || status == "stopping") && (
                                <CircularProgress />
                            ) }
                            { status == "running" && (
                                <>
                                    <Button onClick={stopWebServer} variant="contained" color="error" sx={{ marginRight: "1rem" }}>Stop Web Server</Button>
                                    <Button onClick={openWebServer} variant="contained" color="secondary">Browse</Button>
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

                        <Box sx={{ marginBottom:"1rem", display: "flex", flexDirection: "row", flexWrap: "wrap", columnGap: "1rem", rowGap: "1rem" }}>
                            <Box>
                                <Button variant="contained" color="primary" onClick={openApacheSettings}>Apache Settings</Button>
                                <Menu id="apache-settings-menu" open={apacheSettingsOpen} anchorEl={apacheSettingsAnchorEl} onClose={() => onApacheSettingsClose()}>
                                    <MenuItem onClick={() => onApacheSettingsClose("apache-config", "apache")}>Apache config &lt;httpd.conf&gt;</MenuItem>
                                    <MenuItem onClick={() => onApacheSettingsClose("apache-config", "apache-ssl")}>Apache SSL config &lt;httpd-ssl.conf&gt;</MenuItem>
                                    <MenuItem onClick={() => onApacheSettingsClose("apache-config", "apache-vhosts")}>Virtual Hosts config &lt;httpd-vhosts.conf&gt;</MenuItem>
                                    <MenuItem onClick={() => onApacheSettingsClose("apache-config", "apache-localhost")}>Dynamic hosts config &lt;httpd-local.host.conf&gt;</MenuItem>
                                    <MenuItem onClick={() => onApacheSettingsClose("apache-dir", "apache")}>Open Apache directory</MenuItem>
                                    <MenuItem onClick={() => onApacheSettingsClose("apache-dir", "docroot")}>Open Document Root directory</MenuItem>
                                </Menu>
                            </Box>
                            <Box>
                                <Button variant="contained" color="primary" onClick={openPhpSettings}>PHP Settings</Button>
                                <Menu id="php-settings-menu" open={phpSettingsOpen} anchorEl={phpSettingsAnchorEl} onClose={() => onPhpSettingsClose()}>
                                    <MenuItem onClick={() => onPhpSettingsClose("apache-config", "php56")}>PHP 5.6 &lt;php.ini&gt;</MenuItem>
                                    <MenuItem onClick={() => onPhpSettingsClose("apache-config", "php70")}>PHP 7.0 &lt;php.ini&gt;</MenuItem>
                                    <MenuItem onClick={() => onPhpSettingsClose("apache-config", "php72")}>PHP 7.2 &lt;php.ini&gt;</MenuItem>
                                    <MenuItem onClick={() => onPhpSettingsClose("apache-config", "php74")}>PHP 7.4 &lt;php.ini&gt;</MenuItem>
                                    <MenuItem onClick={() => onPhpSettingsClose("apache-config", "php80")}>PHP 8.0 &lt;php.ini&gt;</MenuItem>
                                    <MenuItem onClick={() => onPhpSettingsClose("apache-config", "php82")}>PHP 8.2 &lt;php.ini&gt;</MenuItem>
                                    <MenuItem onClick={() => onPhpSettingsClose("apache-dir", "php")}>Open PHP directory</MenuItem>
                                </Menu>
                            </Box>
                        </Box>
                    </Box>
                    {/* <Box sx={{ width: "49%" }}>
                        { status == "running" && (
                            <Paper>
                                <Typography sx={{ p: "0.5rem" }}>Websites:</Typography>
                                <List sx={{ width: "100%", height: 220, overflow: "auto", '& ul': { padding: 0 } }} subheader={<li />} dense={true}>
                                    { apacheWebsites.sort().map((site, i) => (
                                        <ListItem sx={{ ':not(:last-child)': { paddingTop: ".5rem", paddingBottom: ".5rem" } }} key={`site-${i}`} secondaryAction={
                                            <>
                                                <Button variant="outlined" size="small" aria-label="open" onClick={() => window.ipcRenderer.send("apache-open-site", `http://${site}`)}>
                                                    Open <LinkIcon />
                                                </Button>
                                            </>
                                        }>
                                            <ListItemText primary={`http://${site}`}></ListItemText>
                                        </ListItem>
                                    )) }
                                </List>
                            </Paper>
                        ) }
                    </Box> */}
                </Box>
            </Box>
        </>
    );
}