import electron from "electron";
import { Box, Button, CircularProgress, Menu, MenuItem, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import Image from "next/image";
import HeidiSqlLogo from "../assets/heidisql.png";
import ComposerLogo from "../assets/composer.png";
import PhpLogo from "../assets/php.png";

const ipcRenderer = electron.ipcRenderer || false;

export default function ExtrasSettings()
{
    const [status, setStatus] = useState("uninstalled");

    useEffect(() => {
        ipcRenderer.send("bin-status");

        ipcRenderer.on("bin-status-changed", (e, status) => {
            setStatus(status);
        });
    }, []);

    const bin = (action) => {
        ipcRenderer.send("bin", action);
    };

    const openHeidiSql = (e) => {
        ipcRenderer.send("heidisql");
    }

    return (
        <>
            <Box sx={{ width: "100%" }}>
                <Typography variant="h5" sx={{ marginBottom: "1rem" }}>Extras</Typography>

                <Box sx={{width: "100%", marginBottom: "3rem"}}>
                    <Typography variant="h6" sx={{ marginBottom: "0.5rem" }}>PHP Binaries</Typography>
                    
                    <Box sx={{width: "100%", marginBottom: "1rem"}}>
                        <Image src={PhpLogo} alt="PHP Logo" width={128} height={128} />
                        <Image src={ComposerLogo} alt="Composer Logo" width={128} height={128} />
                    </Box>

                    <Typography variant="p" sx={{ marginBottom: "0.5rem" }}>You can use PHP command line (php5.6, php7.0, php7.2, php7.4, php8.0 and php8.2 cli applications) and Composer anywhere on your system.</Typography>

                    <Typography variant="body1" sx={{ marginBottom: "0.5rem" }}>
                        <strong>Status:</strong> { status }
                    </Typography>

                    { status == "uninstalled" && (
                        <Button onClick={() => bin("install")} variant="contained" color="success">Install</Button>
                    ) }
                    { (status == "installing" || status == "uninstalling") && (
                        <CircularProgress />
                    ) }
                    { status == "installed" && (
                        <Button onClick={() => bin("uninstall")} variant="contained" color="error">Uninstall</Button>
                    )}
                </Box>

                <Box sx={{width: "100%", marginBottom: "1rem"}}>
                    <Typography variant="h6" sx={{ marginBottom: "0.5rem" }}>Heidi SQL</Typography>
                    
                    <Box sx={{width: "100%", marginBottom: "1rem"}}>
                        <Image src={HeidiSqlLogo} alt="Heidi SQL Logo" width={128} height={128} />
                    </Box>

                    <Box sx={{width: "100%", marginBottom: "1rem"}}>
                        <Typography variant="p">A lightweight database client that acceps MySQL, MariaDB, PostgreSQL, Microsoft SQL and SQLite</Typography>
                    </Box>

                    <Button onClick={() => openHeidiSql()} variant="contained" color="secondary">Open Heidi SQL</Button>
                </Box>
            </Box>
        </>
    );
}