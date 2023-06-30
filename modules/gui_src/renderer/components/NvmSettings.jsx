import electron from "electron";
import { Box, Button, CircularProgress, IconButton, List, ListItem, ListItemText, ListSubheader, Menu, MenuItem, Paper, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import DownloadIcon from "@mui/icons-material/Download";

const ipcRenderer = electron.ipcRenderer || false;

export default function NvmSettings()
{
    const [status, setStatus] = useState("uninstalled");

    const [nvmSettingsAnchorEl, setNvmSettingsAnchorEl] = useState(null);
    const nvmSettingsOpen = Boolean(nvmSettingsAnchorEl);

    const [availableVersions, setAvailableVersions] = useState([]);
    const [installedVersions, setInstalledVersions] = useState([]);
    const [currentVersion, setCurrentVersion] = useState("");

    useEffect(() => {
        ipcRenderer.send("nvm-status");

        ipcRenderer.on("nvm-status-changed", (e, status) => {
            setStatus(status);
        });

        ipcRenderer.on("nvm-available-versions", (e, versions) => {
            setAvailableVersions(versions);
        });

        ipcRenderer.on("nvm-installed-versions", (e, versions) => {
            console.log("nvm-installed-versions", versions);
            setInstalledVersions(versions);
        });

        ipcRenderer.on("nvm-current-version", (e, version) => {
            console.log("nvm-current-version", version);
            setCurrentVersion(version);
        });
    }, []);

    const nvm = (action) => {
        ipcRenderer.send("nvm", action);
    };

    const openNvmSettings = (e) => {
        setNvmSettingsAnchorEl(e.currentTarget);
    }

    const onNvmSettingsClose = (option = null, action = null) => {
        if(option !== null && action !== null){
            ipcRenderer.send(option, action);
        }
        setNvmSettingsAnchorEl(null);
    }

    return (
        <>
            <Box sx={{ width: "100%" }}>
                <Typography variant="h5" sx={{ marginBottom: "1rem" }}>NodeJS Version Manager (NVM)</Typography>

                <Box sx={{width: "100%", marginBottom: "1rem"}}>
                    <Typography variant="h6" sx={{ marginBottom: "0.5rem" }}>Installation</Typography>

                    <Typography variant="body1" sx={{ marginBottom: "0.5rem" }}>
                        <strong>Status:</strong> { status }
                    </Typography>
                </Box>

                <Box sx={{ marginBottom: "1rem", display: "flex", flexDirection: "row", columnGap: "1rem" }}>
                    <Box>
                        { status == "uninstalled" && (
                            <Button onClick={() => nvm("install")} variant="contained" color="success">Install</Button>
                        ) }
                        { (status == "installing" || status == "uninstalling") && (
                            <CircularProgress />
                        ) }
                        { status == "installed" && (
                            <Button onClick={() => nvm("uninstall")} variant="contained" color="error">Uninstall</Button>
                        )}
                    </Box>
                    <Box>
                        <Button variant="contained" color="primary" onClick={openNvmSettings}>NVM Settings</Button>
                        <Menu id="nvm-settings-menu" open={nvmSettingsOpen} anchorEl={nvmSettingsAnchorEl} onClose={() => onNvmSettingsClose()}>
                            <MenuItem onClick={() => onNvmSettingsClose("nvm-config", "settings")}>Open NVM config. file</MenuItem>
                            <MenuItem onClick={() => onNvmSettingsClose("nvm-dir", "nvm")}>Open NVM directory</MenuItem>
                            { status == "installed" && (
                                <MenuItem onClick={() => onNvmSettingsClose("nvm-dir", "node")}>Open current NodeJS directory</MenuItem>
                            ) }
                        </Menu>
                    </Box>
                </Box>

                { status == "installed" && (
                    <Box sx={{ display: "flex", flexDirection: "row", columnGap: "1rem" }}>
                        <Box sx={{ width: "30%" }}>
                            <Paper>
                                <Typography sx={{ p: "0.5rem" }}>Available versions:</Typography>
                                <List sx={{ width: "100%", height: 220, overflow: "auto", '& ul': { padding: 0 } }} subheader={<li />} dense={true}>
                                    { Object.entries(availableVersions).map((entry, index) => {
                                        let version = entry[1];
                                        return (
                                        <li key={index}>
                                            <ul>
                                                <ListSubheader>{ `${version.version}${version.lts ? ` - LTS ("${version.lts}")` : ""}` }</ListSubheader>
                                                { version.releases.slice(0, 5).map((release) => (
                                                    <ListItem key={`nodejs-${release.version}`} secondaryAction={
                                                        <IconButton edge="end" aria-label="install">
                                                            <DownloadIcon />
                                                        </IconButton>
                                                    }>
                                                        <ListItemText primary={release.version} />
                                                    </ListItem>
                                                )) }
                                            </ul>
                                        </li>
                                        )
                                    }) }
                                </List>
                            </Paper>
                        </Box>
                        <Box sx={{ width: "30%" }}>
                        </Box>
                        <Box sx={{ width: "40%" }}>
                        </Box>
                    </Box>
                ) }
            </Box>
        </>
    );
}