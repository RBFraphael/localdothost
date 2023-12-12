import { Box, Button, CircularProgress, Typography } from "@mui/material";
import Image from "next/image";
import { useEffect, useState } from "react";
import HeidiSqlLogo from "../assets/heidisql.png";
import ComposerLogo from "../assets/composer.png";
import PhpLogo from "../assets/php.png";

export default function Extras()
{
    const [status, setStatus] = useState("uninstalled");

    useEffect(() => {
        window.ipcRenderer.send("extras-status");

        window.ipcRenderer.on("extras-status", (e: any, status: string) => {
            setStatus(status);
        });
    }, []);

    const extras = (action: string) => {
        window.ipcRenderer.send("extras", action);
    };

    const openHeidiSql = () => {
        window.ipcRenderer.send("heidisql");
    }

    return (
        <>
            <Box sx={{ width: "100%" }}>
                <Typography variant="h5" sx={{ marginBottom: "1rem" }}>Commandline Tools</Typography>

                <Box sx={{ display: "flex", gap: ".5rem" }}>
                    <Box>
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
                </Box>
            </Box>
        </>
    );
}
