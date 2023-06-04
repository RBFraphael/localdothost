import { Box, Typography } from "@mui/material";
import Image from "next/image";
import Logo from "../assets/logo.png";

export default function AppAbout()
{
    return (
        <Box sx={{ width: "100%" }}>
            <Typography variant="h5" sx={{ marginBottom: "1rem" }}>Local.Host About</Typography>

            <Box sx={{ width: "100%", marginBottom: "1rem" }}>
                <Image src={Logo} width={150} height={150} style={{ marginLeft: "auto", marginRight: "auto", marginBottom: "1rem" }} />
                <Typography variant="body1">
                    <strong>Developed by:</strong> RBFraphael &lt;rbfraphael@gmail.com&gt;
                </Typography>
                <Typography variant="body1">
                    <strong>Github URL:</strong> https://github.com/rbfraphael
                </Typography>
                <Typography variant="body1">
                    <strong>Version:</strong> 1.0.0
                </Typography>
                <Typography variant="body1">
                    <strong>Apache:</strong> 2.4.57
                </Typography>
                <Typography variant="body1">
                    <strong>PHP:</strong> 5.6 / 7.0 / 7.2 / 7.4 / 8.0 / 8.2
                </Typography>
                <Typography variant="body1">
                    <strong>MariaDB:</strong> 10.11.3
                </Typography>
                <Typography variant="body1">
                    <strong>Acrylic DNS:</strong> 2.1.1
                </Typography>
            </Box>
        </Box>
    );
}