import { Box, Checkbox, FormControlLabel, FormGroup, Typography } from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import { ColorModeContext } from "../contexts/ColorModeContext";

export default function AppSettings()
{
    const {colorMode, setColorMode} = useContext(ColorModeContext);

    const [autostartApache, setAutostartApache] = useState(false);
    const [autostartMariaDb, setAutostartMariaDb] = useState(false);

    useEffect(() => {
        let appSettingsJson = localStorage.getItem("settings");
        if(appSettingsJson){
            let appSettings = JSON.parse(appSettingsJson);
            setAutostartApache(appSettings.autostart?.apache ?? false);
            setAutostartMariaDb(appSettings.autostart?.mariadb ?? false);
            setColorMode(appSettings.theme ?? colorMode);
        }
    }, []);

    useEffect(() => {
        let appSettings = {
            autostart: {
                apache: autostartApache,
                mariadb: autostartMariaDb
            },
            theme: colorMode
        };
        localStorage.setItem("settings", JSON.stringify(appSettings));
    }, [autostartApache, autostartMariaDb, colorMode]);

    return (
        <Box sx={{ width: "100%" }}>
            <Typography variant="h5" sx={{ marginBottom: "1rem" }}>Local.Host Settings</Typography>
            
            {/* <Box sx={{ width: "100%", marginBottom: "1rem" }}>
                <Typography variant="body1">Initialization</Typography>
                <FormGroup>
                    <FormControlLabel control={<Checkbox />} label="Autostart on login" />
                    <FormControlLabel control={<Checkbox />} label="Start minimized" />
                </FormGroup>
            </Box> */}
            
            <Box sx={{ width: "100%", marginBottom: "1rem" }}>
                <Typography variant="body1">Service Autostart</Typography>
                <FormGroup>
                    <FormControlLabel control={
                        <Checkbox onChange={(e) => setAutostartApache(e.target.checked)} checked={autostartApache} />
                    } label="Autostart Web Server" />
                    <FormControlLabel control={
                        <Checkbox onChange={(e) => setAutostartMariaDb(e.target.checked)} checked={autostartMariaDb} />
                    } label="Autostart Database Server" />
                </FormGroup>
            </Box>

            <Box sx={{ width: "100%", marginBottom: "1rem" }}>
                <Typography variant="body1">Interface</Typography>
                <FormGroup>
                    <FormControlLabel control={
                        <Checkbox onChange={(e) => setColorMode(e.target.checked ? "dark" : "light")} checked={colorMode == "dark"} />
                    } label="Dark mode" />
                </FormGroup>
            </Box>
        </Box>
    );
}