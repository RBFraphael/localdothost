import { Box, Button, Chip, CircularProgress, FormControl, InputLabel, MenuItem, Select, Tooltip, Typography } from "@mui/material";
import { useEffect, useState } from "react";

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

                <Box sx={{ display: "flex", gap: "1rem" }}>
                    <Box sx={{ flexBasis: "50%" }}>
                        <Box sx={{width: "100%", marginBottom: "1rem"}}>
                            <Typography variant="h6" sx={{ marginBottom: "0.5rem" }}>This includes the following commands:</Typography>
                            <Chip label="composer" size="small" sx={{ fontFamily: "monospace" }} />
                            <Chip label="php" size="small" sx={{ fontFamily: "monospace" }} />
                            <Chip label="php5.6" size="small" sx={{ fontFamily: "monospace" }} />
                            <Chip label="php7.0" size="small" sx={{ fontFamily: "monospace" }} />
                            <Chip label="php7.2" size="small" sx={{ fontFamily: "monospace" }} />
                            <Chip label="php7.4" size="small" sx={{ fontFamily: "monospace" }} />
                            <Chip label="php8.0" size="small" sx={{ fontFamily: "monospace" }} />
                            <Chip label="php8.2" size="small" sx={{ fontFamily: "monospace" }} />
                            <Chip label="php8.3" size="small" sx={{ fontFamily: "monospace" }} />
                            <Chip label="mysql" size="small" sx={{ fontFamily: "monospace" }} />
                            <Chip label="mysqldump" size="small" sx={{ fontFamily: "monospace" }} />
                            <Chip label="redis" size="small" sx={{ fontFamily: "monospace" }} />
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
                    { status == "installed" ? (
                        <Box sx={{ flexBasis: "40%" }}>
                            <Tooltip title="The corresponding PHP version when running ´php´ command from terminal (CMD, PowerShell, Git Bash etc)" arrow>
                                <Typography variant="body1" sx={{ p: "0.5rem" }}>Default PHP version for Command-line</Typography>
                            </Tooltip>
                            <FormControl fullWidth>
                                {/* <InputLabel id="php-cli-version-label">PHP CLI version</InputLabel> */}
                                <Select labelId="php-cli-version-label" id="php-cli-version" value={currentCliPhpVersion} label="Active version" onChange={(e) => onChangeCliPhpVersion(e.target.value)}>
                                    { phpVersions.map((version, index) => (
                                        <MenuItem key={index} value={version}>{version}</MenuItem>
                                    )) }
                                </Select>
                            </FormControl>
                        </Box>
                    ) : null }
                </Box>
            </Box>
        </>
    );
}
