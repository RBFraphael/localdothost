import { Box, Checkbox, FormControlLabel, FormGroup, Typography } from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import { ColorModeContext } from "../contexts/ColorModeContext";
import { ISettings } from "@/interfaces/ISettings";

export default function Settings()
{
    const {colorMode, setColorMode} = useContext(ColorModeContext);

    const [autostartApache, setAutostartApache] = useState<boolean>(false);
    const [autostartMariaDb, setAutostartMariaDb] = useState<boolean>(false);
    const [autostartMongoDb, setAutostartMongoDb] = useState<boolean>(false);
    const [init, setInit] = useState<boolean>(true);

    useEffect(() => {
        window.ipcRenderer.send("localhost-boot");

        window.ipcRenderer.on("localhost-init", (e: any, settings: ISettings) => {
            setAutostartApache(settings.autostart.apache);
            setAutostartMariaDb(settings.autostart.mariadb);
            setAutostartMongoDb(settings.autostart.mongodb);
            setColorMode(settings.theme);
            setInit(false);
        });

        window.ipcRenderer.on("localhost-settings", (e: any, settings: ISettings) => {
            setAutostartApache(settings.autostart.apache);
            setAutostartMariaDb(settings.autostart.mariadb);
            setAutostartMongoDb(settings.autostart.mongodb);
            setColorMode(settings.theme);
        });
    }, []);

    useEffect(() => {
        if(!init){
            let appSettings = {
                autostart: {
                    apache: autostartApache,
                    mariadb: autostartMariaDb,
                    mongodb: autostartMongoDb,
                },
                theme: colorMode
            };
            
            window.ipcRenderer.send("localhost-settings", appSettings);
        }
    }, [autostartApache, autostartMariaDb, autostartMongoDb, colorMode]);

    return (
        <Box sx={{ width: "100%" }}>
            <Typography variant="h5" sx={{ marginBottom: "1rem" }}>Settings</Typography>
            
            <Box sx={{ width: "100%", marginBottom: "1rem" }}>
                <Typography variant="body1">Service Autostart</Typography>
                <FormGroup>
                    <FormControlLabel control={
                        <Checkbox onChange={(e) => setAutostartApache(e.target.checked)} checked={autostartApache} />
                    } label="Autostart Web Server" />
                    <FormControlLabel control={
                        <Checkbox onChange={(e) => setAutostartMariaDb(e.target.checked)} checked={autostartMariaDb} />
                    } label="Autostart SQL Database Server" />
                    <FormControlLabel control={
                        <Checkbox onChange={(e) => setAutostartMongoDb(e.target.checked)} checked={autostartMongoDb} />
                    } label="Autostart noSQL Database Server" />
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
