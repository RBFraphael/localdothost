import { Box, Button, CircularProgress, FormControl, InputLabel, MenuItem, Select, Typography } from "@mui/material";
import Image from "next/image";
import { useEffect, useState } from "react";
import ComposerLogo from "../assets/composer.png";
import PhpLogo from "../assets/php.png";

export default function Extras()
{
    const [status, setStatus] = useState("uninstalled");
    const [currentCliPhpVersion, setCurrentCliPhpVersion] = useState("");

    const phpVersions = ["5.6", "7.0", "7.2", "7.4", "8.0", "8.2", "8.3"];

    useEffect(() => {
        window.ipcRenderer.send("extras-status");
        window.ipcRenderer.send("php-cli");

        window.ipcRenderer.on("php-cli-version", (e: any, version: string) => {
            setCurrentCliPhpVersion(version);
        });

        window.ipcRenderer.on("extras-status", (e: any, status: string) => {
            setStatus(status);
        });
    }, []);

    const extras = (action: string) => {
        window.ipcRenderer.send("extras", action);
    };

    const onChangeCliPhpVersion = (version: string) => {
        window.ipcRenderer.send("set-php-cli", version);
    };

    return (
        <>
            <Box sx={{ width: "100%" }}>
                <Typography variant="h5" sx={{ marginBottom: "1rem" }}>Commandline Tools</Typography>

                <Box sx={{ display: "flex", gap: ".5rem" }}>
                    <Box sx={{ flexBasis: "50%" }}>
                        <Typography variant="h6" sx={{ marginBottom: "0.5rem" }}>PHP and Composer</Typography>
                        
                        <Box sx={{width: "100%", marginBottom: "1rem"}}>
                            <Image src={PhpLogo} alt="PHP Logo" width={128} height={128} />
                            <Image src={ComposerLogo} alt="Composer Logo" width={128} height={128} />
                        </Box>

                        <Typography variant="body1" sx={{ marginBottom: "0.5rem" }}>
                            <strong>Status:</strong> { status }
                        </Typography>

                        { status == "uninstalled" && (
                            <Button onClick={() => extras("install")} variant="contained" color="success">Install</Button>
                        ) }
                        { (status == "installing" || status == "uninstalling") && (
                            <CircularProgress />
                        ) }
                        { status == "installed" && (
                            <Button onClick={() => extras("uninstall")} variant="contained" color="error">Uninstall</Button>
                        )}
                    </Box>
                    <Box sx={{ flexBasis: "30%" }}>
                        <FormControl fullWidth>
                            <InputLabel id="php-cli-version-label">PHP CLI version</InputLabel>
                            <Select labelId="php-cli-version-label" id="php-cli-version" value={currentCliPhpVersion} label="Active version" onChange={(e) => onChangeCliPhpVersion(e.target.value)}>
                                { phpVersions.map((version, index) => (
                                    <MenuItem key={index} value={version}>{version}</MenuItem>
                                )) }
                            </Select>
                        </FormControl>
                    </Box>
                </Box>
            </Box>
        </>
    );
}
