import electron from "electron";
import { Box, Button, CircularProgress, FormControl, IconButton, InputLabel, List, ListItem, ListItemText, ListSubheader, Menu, MenuItem, Paper, Select, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import DownloadIcon from "@mui/icons-material/Download";
import ClearIcon from "@mui/icons-material/Clear";

const ipcRenderer = electron.ipcRenderer || false;

export default function NvmSettings()
{
    const [status, setStatus] = useState("uninstalled");

    const [nvmSettingsAnchorEl, setNvmSettingsAnchorEl] = useState(null);
    const nvmSettingsOpen = Boolean(nvmSettingsAnchorEl);

    const [installingVersion, setInstallingVersion] = useState(null);
    const [uninstallingVersion, setUninstallingVersion] = useState(null);

    const [availableVersions, setAvailableVersions] = useState([]);
    const [installedVersions, setInstalledVersions] = useState([]);
    const [currentVersion, setCurrentVersion] = useState("");

    useEffect(() => {
        ipcRenderer.send("nvm-status");

        ipcRenderer.on("nvm-status-changed", (e, status) => {
            setStatus(status);
        });

        ipcRenderer.on("nvm-available-versions", (e, versions) => {
            setAvailableVersions(versions ?? []);
            setInstallingVersion(null);
        });

        ipcRenderer.on("nvm-installed-versions", (e, versions) => {
            setInstalledVersions(versions ?? []);
            setUninstallingVersion(null);
        });

        ipcRenderer.on("nvm-current-version", (e, version) => {
            version = version ? version.replace(/[^\d.]/, "") : null;
            setCurrentVersion(version);
        });
    }, []);

    const filterInstalledVersions = (release) => {
        let normalizedVersion = release.version.replace(/[^\d.]/, "");
        return installedVersions.indexOf(normalizedVersion) == -1;
    };

    const nvm = (action) => {
        ipcRenderer.send("nvm", action);
    };

    const openNvmSettings = (e) => {
        setNvmSettingsAnchorEl(e.currentTarget);
    };

    const onNvmSettingsClose = (option = null, action = null) => {
        if(option !== null && action !== null){
            ipcRenderer.send(option, action);
        }
        setNvmSettingsAnchorEl(null);
    };

    const onInstallVersion = (version) => {
        version = version.replace(/[^\d.]/, "");
        setInstallingVersion(version);
        ipcRenderer.send("nvm-install-version", version);
    };

    const onUninstallVersion = (version) => {
        version = version.replace(/[^\d.]/, "");
        setUninstallingVersion(version);
        ipcRenderer.send("nvm-uninstall-version", version);
    };

    const onUseVersion = (version) => {
        version = version.replace(/[^\d.]/, "");
        ipcRenderer.send("nvm-use-version", version);
    };

    const isInstallingVersion = (version) => {
        if(installingVersion !== null){
            version = version.replace(/[^\d.]/, "");
            let workingVersion = installingVersion.replace(/[^\d.]/, "");
            return version == workingVersion;
        }

        return false;
    };

    const isUninstallingVersion = (version) => {
        if(uninstallingVersion !== null){
            version = version.replace(/[^\d.]/, "");
            let workingVersion = uninstallingVersion.replace(/[^\d.]/, "");
            return version == workingVersion;
        }

        return false;
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
                        <Box sx={{ width: "35%" }}>
                            <Paper>
                                <Typography sx={{ p: "0.5rem" }}>Available versions:</Typography>
                                <List sx={{ width: "100%", height: 220, overflow: "auto", '& ul': { padding: 0 } }} subheader={<li />} dense={true}>
                                    { Object.entries(availableVersions).map((entry, index) => {
                                        let version = entry[1];
                                        return (
                                        <li key={index}>
                                            <ul>
                                                <ListSubheader>{ `${version.version}${version.lts ? ` - LTS ("${version.lts}")` : ""}` }</ListSubheader>
                                                { version.releases.filter(filterInstalledVersions).slice(0, 5).map((release) => (
                                                    <ListItem key={`nodejs-${release.version}`} secondaryAction={
                                                        <>
                                                            { isInstallingVersion(release.version) ? (
                                                                <CircularProgress size={20} />
                                                            ) : (
                                                                <IconButton disabled={installingVersion !== null} edge="end" aria-label="install" onClick={() => onInstallVersion(release.version)}>
                                                                    <DownloadIcon />
                                                                </IconButton>
                                                            ) }
                                                        </>
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
                        <Box sx={{ width: "35%" }}>
                            <Paper>
                                <Typography sx={{ p: "0.5rem" }}>Installed versions:</Typography>
                                <List sx={{ width: "100%", height: 220, overflow: "auto", '& ul': { padding: 0 } }} subheader={<li />} dense={true}>
                                    { installedVersions.map((version, index) => (
                                        <ListItem key={index} secondaryAction={
                                            <>
                                                { isUninstallingVersion(version) ? (
                                                    <CircularProgress size={20} />
                                                ) : (
                                                    <IconButton disabled={uninstallingVersion !== null} edge="end" aria-label="uninstall" onClick={() => onUninstallVersion(version)}>
                                                        <ClearIcon />
                                                    </IconButton>
                                                ) }
                                            </>
                                        }>
                                            <ListItemText primary={`v${version}`} />
                                        </ListItem>
                                        )
                                    ) }
                                </List>
                            </Paper>
                        </Box>
                        <Box sx={{ width: "30%" }}>
                            <FormControl fullWidth>
                                <InputLabel id="nvm-active-version-label">Active version</InputLabel>
                                <Select labelId="nvm-active-version-label" id="nvm-active-version" value={currentVersion} label="Active version" onChange={(e) => onUseVersion(e.target.value)}>
                                    { installedVersions.map((version, index) => (
                                        <MenuItem key={index} value={version}>v{version}</MenuItem>
                                    )) }
                                </Select>
                            </FormControl>
                        </Box>
                    </Box>
                ) }
            </Box>
        </>
    );
}