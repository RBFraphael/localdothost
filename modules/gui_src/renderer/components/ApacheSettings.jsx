import electron from "electron";
import { Box, Button, CircularProgress, IconButton, List, ListItem, ListItemText, Menu, MenuItem, Paper, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import LinkIcon from "@mui/icons-material/Launch";

const ipcRenderer = electron.ipcRenderer || false;

export default function ApacheSettings()
{
    const [status, setStatus] = useState("stopped");
    const [listeningPorts, setListeningPorts] = useState([]);
    const [pids, setPids] = useState([]);

    const [apacheWebsites, setApacheWebsites] = useState([]);

    const [apacheSettingsAnchorEl, setApacheSettingsAnchorEl] = useState(null);
    const apacheSettingsOpen = Boolean(apacheSettingsAnchorEl);

    const [phpSettingsAnchorEl, setPhpSettingsAnchorEl] = useState(null);
    const phpSettingsOpen = Boolean(phpSettingsAnchorEl);

    const startWebServer = () => {
        ipcRenderer.send("apache-service", "start");
    }

    const stopWebServer = () => {
        ipcRenderer.send("apache-service", "stop");
    }

    const openWebServer = () => {
        ipcRenderer.send("apache-service", "open");
    }

    useEffect(() => {
        let autostart = false;
        let appSettingsJson = localStorage.getItem("settings");
        if(appSettingsJson){
            let appSettings = JSON.parse(appSettingsJson);
            autostart = appSettings.autostart?.apache ?? false;
        }

        ipcRenderer.send("apache-boot", autostart);

        ipcRenderer.on("apache-status-changed", (e, status) => {
            setStatus(status);
        });

        ipcRenderer.on("apache-listening-ports", (e, ports) => {
            setListeningPorts(ports);
        });

        ipcRenderer.on("apache-pid", (e, pids) => {
            setPids(pids);
        });

        ipcRenderer.on("apache-sites", (e, sites) => {
            setApacheWebsites(sites);
        });
    }, []);

    const openApacheSettings = (e) => {
        setApacheSettingsAnchorEl(e.currentTarget);
    }

    const openPhpSettings = (e) => {
        setPhpSettingsAnchorEl(e.currentTarget);
    }

    const onApacheSettingsClose = (option = null, action = null) => {
        if(option !== null && action !== null){
            ipcRenderer.send(option, action);
        }
        setApacheSettingsAnchorEl(null);
    }

    const onPhpSettingsClose = (option = null, action = null) => {
        if(option !== null && action !== null){
            ipcRenderer.send(option, action);
        }
        setPhpSettingsAnchorEl(null);
    }

    return (
        <>
            <Box sx={{ width: "100%" }}>
                <Typography variant="h5" sx={{ marginBottom: "1rem" }}>Apache Web Server Management</Typography>
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
                                    <MenuItem onClick={() => onApacheSettingsClose("apache-config", "apache-local-host")}>Dynamic hosts config &lt;httpd-local.host.conf&gt;</MenuItem>
                                    <MenuItem onClick={() => onApacheSettingsClose("apache-dir", "apache")}>Open Apache directory</MenuItem>
                                    <MenuItem onClick={() => onApacheSettingsClose("apache-dir", "docroot")}>Open Document Root directory</MenuItem>
                                </Menu>
                            </Box>
                            <Box>
                                <Button variant="contained" color="primary" onClick={openPhpSettings}>PHP Settings</Button>
                                <Menu id="php-settings-menu" open={phpSettingsOpen} anchorEl={phpSettingsAnchorEl} onClose={() => onPhpSettingsClose()}>
                                    <MenuItem onClick={() => onPhpSettingsClose("apache-config", "php-5.6")}>PHP 5.6 &lt;php.ini&gt;</MenuItem>
                                    <MenuItem onClick={() => onPhpSettingsClose("apache-config", "php-7.0")}>PHP 7.0 &lt;php.ini&gt;</MenuItem>
                                    <MenuItem onClick={() => onPhpSettingsClose("apache-config", "php-7.2")}>PHP 7.2 &lt;php.ini&gt;</MenuItem>
                                    <MenuItem onClick={() => onPhpSettingsClose("apache-config", "php-7.4")}>PHP 7.4 &lt;php.ini&gt;</MenuItem>
                                    <MenuItem onClick={() => onPhpSettingsClose("apache-config", "php-8.0")}>PHP 8.0 &lt;php.ini&gt;</MenuItem>
                                    <MenuItem onClick={() => onPhpSettingsClose("apache-config", "php-8.2")}>PHP 8.2 &lt;php.ini&gt;</MenuItem>
                                    <MenuItem onClick={() => onPhpSettingsClose("apache-dir", "php")}>Open PHP directory</MenuItem>
                                </Menu>
                            </Box>
                        </Box>
                    </Box>
                    <Box sx={{ width: "49%" }}>
                        { status == "running" && (
                            <Paper>
                                <Typography sx={{ p: "0.5rem" }}>Websites:</Typography>
                                <List sx={{ width: "100%", height: 220, overflow: "auto", '& ul': { padding: 0 } }} subheader={<li />} dense={true}>
                                    { apacheWebsites.sort().map((site, i) => (
                                        <ListItem sx={{ ':not(:last-child)': { paddingTop: ".5rem", paddingBottom: ".5rem" } }} key={`site-${i}`} secondaryAction={
                                            <>
                                                <Button variant="outlined" size="small" aria-label="open" onClick={() => ipcRenderer.send("apache-open-site", `http://${site}`)}>
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
                    </Box>
                </Box>
            </Box>
        </>
    );
}