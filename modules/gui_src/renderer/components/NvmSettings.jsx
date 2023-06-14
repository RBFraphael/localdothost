import electron from "electron";
import { Box, Button, CircularProgress, Menu, MenuItem, Typography } from "@mui/material";
import { useEffect, useState } from "react";

const ipcRenderer = electron.ipcRenderer || false;

export default function NvmSettings()
{
    const [status, setStatus] = useState("uninstalled");

    const [nvmSettingsAnchorEl, setNvmSettingsAnchorEl] = useState(null);
    const nvmSettingsOpen = Boolean(nvmSettingsAnchorEl);

    useEffect(() => {
        ipcRenderer.send("nvm-status");

        ipcRenderer.on("nvm-status-changed", (e, status) => {
            setStatus(status);
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

                <Box sx={{ marginBottom: "1rem", display: "flex", flexDirection: "row", flexWrap: "wrap", columnGap: "1rem", rowGap: "1rem" }}>
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
            </Box>
        </>
    );
}