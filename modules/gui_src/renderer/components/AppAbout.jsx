import { Box, Typography } from "@mui/material";
import Image from "next/image";
import Logo from "../assets/logo.png";

export default function AppAbout()
{
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
                            <strong>Version:</strong> 1.2.0
                        </Typography>
                        <Typography variant="body1">
                            <strong>Apache:</strong> 2.4.57
                        </Typography>
                        <Typography variant="body1">
                            <strong>PHP:</strong> 5.6.40 / 7.0.33 / 7.2.34 / 7.4.33 / 8.0.29 / 8.2.7
                        </Typography>
                        <Typography variant="body1">
                            <strong>Composer:</strong> 2.5.8
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant="body1">
                            <strong>MariaDB:</strong> 11.0.2
                        </Typography>
                        <Typography variant="body1">
                            <strong>HeidiSQL:</strong> 12.5
                        </Typography>
                        <Typography variant="body1">
                            <strong>Acrylic DNS:</strong> 2.1.1
                        </Typography>
                        <Typography variant="body1">
                            <strong>MongoDB:</strong> 6.0.7
                        </Typography>
                        <Typography variant="body1">
                            <strong>MongoDB Compass:</strong> 1.38.0
                        </Typography>
                        <Typography variant="body1">
                            <strong>NVM:</strong> 1.1.11
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}