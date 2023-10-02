import electron from "electron";
import { Box, Typography } from "@mui/material";
import Image from "next/image";
import Logo from "../assets/logo.png";
import { useEffect, useState } from "react";

const ipcRenderer = electron.ipcRenderer || false;

export default function AppAbout()
{
    const [versions, setVersions] = useState({});

    useEffect(() => {
        ipcRenderer.send("localhost-versions");

        ipcRenderer.on("localhost-versions-load", (e, data) => {
            setVersions(data);
        });
    });

    return (
        <Box sx={{ width: "100%" }}>
            <Typography variant="h5" sx={{ marginBottom: "1rem" }}>Local.Host About</Typography>

            <Box sx={{ width: "100%", marginBottom: "1rem" }}>
                
                <Box sx={{ width: "100%", display: "flex", flexDirection: "row" }}>
                    <Box sx={{ marginRight: "3rem" }}>
                        <Image src={Logo} width={150} height={150} style={{ marginLeft: "auto", marginRight: "auto", marginBottom: "1rem" }} />
                    </Box>
                    <Box sx={{ marginRight: "3rem" }}>
                        <Typography variant="body1">
                            <strong>Developed by:</strong> RBFraphael &lt;rbfraphael@gmail.com&gt;
                        </Typography>
                        <Typography variant="body1">
                            <strong>Github URL:</strong> https://github.com/rbfraphael
                        </Typography>
                        <Typography variant="body1">
                            <strong>GUI Version:</strong> { versions.gui ?? "" }
                        </Typography>
                        <Typography variant="body1">
                            <strong>Apache:</strong> { versions.apache ?? "" }
                        </Typography>
                        <Typography variant="body1">
                            <strong>PHP:</strong> { versions.php ? Object.values(versions.php).join(" / ") : "" }
                        </Typography>
                        <Typography variant="body1">
                            <strong>Composer:</strong> { versions.composer ?? "" }
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant="body1">
                            <strong>MariaDB:</strong> { versions.mariadb ?? "" }
                        </Typography>
                        <Typography variant="body1">
                            <strong>HeidiSQL:</strong> { versions.heidisql ?? "" }
                        </Typography>
                        <Typography variant="body1">
                            <strong>Acrylic DNS:</strong> { versions.acrylic ?? "" }
                        </Typography>
                        <Typography variant="body1">
                            <strong>MongoDB:</strong> { versions.mongodb ?? "" }
                        </Typography>
                        <Typography variant="body1">
                            <strong>MongoDB Compass:</strong> { versions.compass ?? "" }
                        </Typography>
                        <Typography variant="body1">
                            <strong>NVM:</strong> { versions.nvm ?? "" }
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}