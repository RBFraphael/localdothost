import electron from "electron";
import { Box, Button, CircularProgress, FormControl, IconButton, InputLabel, List, ListItem, ListItemText, ListSubheader, Menu, MenuItem, Paper, Select, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import DownloadIcon from "@mui/icons-material/Download";
import ClearIcon from "@mui/icons-material/Clear";
import { INvmVersion } from "@/interfaces/INvmVersion";
import { InstallDesktop, RemoveFromQueue, Settings } from "@mui/icons-material";

export default function Nvm()
{
    const [status, setStatus] = useState("uninstalled");

    const [nvmSettingsAnchorEl, setNvmSettingsAnchorEl] = useState<HTMLElement|null>(null);
    const nvmSettingsOpen = Boolean(nvmSettingsAnchorEl);

    const [installingVersion, setInstallingVersion] = useState<string|null>(null);
    const [uninstallingVersion, setUninstallingVersion] = useState<string|null>(null);

    const [availableVersions, setAvailableVersions] = useState<string[]>([]);
    const [installedVersions, setInstalledVersions] = useState<string[]>([]);
    const [currentVersion, setCurrentVersion] = useState<string|null>(null);

    const filterInstalledVersions = (release: INvmVersion) => {
        let normalizedVersion = release.version.replace(/[^\d.]/, "");
        return installedVersions.indexOf(normalizedVersion) == -1;
    };

    const nvm = (action: string) => {
        window.ipcRenderer.send("nvm", action);
    };

    const openNvmSettings = (e: any) => {
        setNvmSettingsAnchorEl(e.currentTarget);
    };

    const onNvmSettingsClose = (option: string|null = null, action: string|null = null) => {
        if(option !== null){
            window.ipcRenderer.send(option, action);
        }
        setNvmSettingsAnchorEl(null);
    };

    const onInstallVersion = (version: string) => {
        version = version.replace(/[^\d.]/, "");
        setInstallingVersion(version);
        window.ipcRenderer.send("nvm-install", version);
    };

    const onUninstallVersion = (version: string) => {
        version = version.replace(/[^\d.]/, "");
        setUninstallingVersion(version);
        window.ipcRenderer.send("nvm-uninstall", version);
    };

    const onUseVersion = (version: string|null) => {
        version = version ? version.replace(/[^\d.]/, "") : null;
        window.ipcRenderer.send("nvm-use", version);
    };

    const isInstallingVersion = (version: string) => {
        if(installingVersion !== null){
            version = version.replace(/[^\d.]/, "");
            let workingVersion = installingVersion.replace(/[^\d.]/, "");
            return version == workingVersion;
        }

        return false;
    };

    const isUninstallingVersion = (version: string) => {
        if(uninstallingVersion !== null){
            version = version.replace(/[^\d.]/, "");
            let workingVersion = uninstallingVersion.replace(/[^\d.]/, "");
            return version == workingVersion;
        }

        return false;
    }

    useEffect(() => {
        window.ipcRenderer.send("nvm-status");

        window.ipcRenderer.on("nvm-status", (e: string, status: string) => {
            setStatus(status);
        });

        window.ipcRenderer.on("nvm-available", (e: string, versions: string[]) => {
            setAvailableVersions(versions ?? []);
            setInstallingVersion(null);
        });

        window.ipcRenderer.on("nvm-installed", (e: string, versions: string[]) => {
            setInstalledVersions(versions ?? []);
            setUninstallingVersion(null);
        });

        window.ipcRenderer.on("nvm-current", (e: string, version: string|null) => {
            version = version ? version.replace(/[^\d.]/, "") : null;
            setCurrentVersion(version);
        });
    }, []);

    return (
        <>
            <Box sx={{ width: "100%" }}>
                <Typography variant="h5" sx={{ marginBottom: "1rem" }}>NodeJS</Typography>

                <Box sx={{width: "100%", marginBottom: "1rem"}}>
                    <Typography variant="h6" sx={{ marginBottom: "0.5rem" }}>NVM Installation</Typography>

                    <Typography variant="body1" sx={{ marginBottom: "0.5rem" }}>
                        <strong>Status:</strong> { status }
                    </Typography>
                </Box>

                <Box sx={{ marginBottom: "1rem", display: "flex", flexDirection: "row", columnGap: "1rem" }}>
                    <Box>
                        { status == "uninstalled" && (
                            <Button onClick={() => nvm("install")} variant="contained" color="success">
                                <InstallDesktop sx={{ marginRight: ".5rem" }} />
                                Install
                            </Button>
                        ) }
                        { (status == "installing" || status == "uninstalling") && (
                            <CircularProgress />
                        ) }
                        { status == "installed" && (
                            <Button onClick={() => nvm("uninstall")} variant="contained" color="error">
                                <RemoveFromQueue sx={{ marginRight: ".5rem" }} />
                                Uninstall
                            </Button>
                        )}
                    </Box>
                    <Box>
                        <Button variant="contained" color="primary" onClick={openNvmSettings}>
                            <Settings sx={{ marginRight: ".5rem" }} />
                            NVM Settings
                        </Button>
                        <Menu id="nvm-settings-menu" open={nvmSettingsOpen} anchorEl={nvmSettingsAnchorEl} onClose={() => onNvmSettingsClose()}>
                            <MenuItem onClick={() => onNvmSettingsClose("nvm-config")}>Open NVM config. file</MenuItem>
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
                                    { Object.entries(availableVersions).map((entry: any, index) => {
                                        let version = entry[1];
                                        return (
                                        <li key={index}>
                                            <ul>
                                                <ListSubheader>{ `${version.version}${version.lts ? ` - LTS ("${version.lts}")` : ""}` }</ListSubheader>
                                                { version.releases.filter(filterInstalledVersions).slice(0, 5).map((release: any) => (
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
                        { installedVersions.length > 0 ? (
                        <Box sx={{ width: "30%" }}>
                            <Typography variant="body1" sx={{ p: "0.5rem" }}>Active version:</Typography>
                            <FormControl fullWidth>
                                {/* <InputLabel id="nvm-active-version-label">Active version</InputLabel> */}
                                <Select labelId="nvm-active-version-label" id="nvm-active-version" value={currentVersion} onChange={(e) => onUseVersion(e.target.value)}>
                                    { installedVersions.map((version, index) => (
                                        <MenuItem key={index} value={version}>v{version}</MenuItem>
                                    )) }
                                </Select>
                            </FormControl>
                        </Box>
                        ) : null }
                    </Box>
                ) }
            </Box>
        </>
    );
}
