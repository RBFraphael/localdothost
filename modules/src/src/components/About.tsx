import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Typography } from "@mui/material";
import Logo from "../assets/logo.png";
import Image from "next/image";
import { useEffect, useState } from "react";
import { IVersions } from "@/interfaces/IVersions";

export default function About()
{
    const [versions, setVersions] = useState<IVersions>({
        gui: "", apache: "", php: {}, composer: "", mariadb: "",
        heidisql: "", acrylic: "", mongodb: "", compass: "", nvm: "",
    });
    const [latestVersion, setLatestVersion] = useState("");
    const [updateCheckStatus, setUpdateCheckStatus] = useState("");
    const [userUpdateCheck, setUserUpdateCheck] = useState(false);
    const [isDownloadingUpdate, setIsDownloadingUpdate] = useState(false);

    const [showDialog, setShowDialog] = useState(false);
    const [dialogText, setDialogText] = useState("");
    const [showUpdateDialog, setShowUpdateDialog] = useState(false);

    const checkForUpdates = () => {
        setUserUpdateCheck(true);
        window.ipcRenderer.send("localhost-check-for-updates");
    };

    const downloadLatestVersion = () => {
        setIsDownloadingUpdate(true);
        window.ipcRenderer.send("localhost-download-update");
    }

    const installUpdate = () => {
        setShowUpdateDialog(false);
        window.ipcRenderer.send("localhost-apply-update");
    }

    const updateDialog = () => {
        setShowUpdateDialog(true);
    };

    const closeDialog = () => {
        setShowDialog(false);
    };

    const onlineHelp = () => {
        window.ipcRenderer.send("localhost-help");
    };

    useEffect(() => {
        window.ipcRenderer.send("localhost-versions", true);

        window.ipcRenderer.on("localhost-versions", (e: any, versions: IVersions) => {
            setVersions(versions);
        });

        window.ipcRenderer.on("localhost-status", (e: any, status: string) => {
            setUpdateCheckStatus(status);
        });

        window.ipcRenderer.on("localhost-available", (e: any, version: string) => {
            setLatestVersion(version);
        });

    }, []);

    useEffect(() => {
        if(updateCheckStatus == "updated"){
            if(userUpdateCheck == true){
                setDialogText("You have the latest available version.");
                setShowDialog(true);
            };
        }
        
        if(updateCheckStatus == "available"){
            if(userUpdateCheck){
                setDialogText(`There's a new version available to download: ${latestVersion}`);
            } else {
                setDialogText(`There's a new version available to download: ${latestVersion}. Go to About tab to download and install this update.`);
            }
            setShowDialog(true);
        }

        if(updateCheckStatus == "ready"){
            setDialogText(`The update package for version ${latestVersion} was downloaded. Before installing the update, we recommend you to stop all running services.`);
            setShowDialog(true);
        }

        if(updateCheckStatus == "error"){
            if(userUpdateCheck == true || isDownloadingUpdate){
                setDialogText("An error has occurred when gathering update information. Try again later.");
                setShowDialog(true);
            };
        }
    }, [updateCheckStatus]);
    
    return (
        <>
            <Box sx={{ width: "100%" }}>
                <Typography variant="h5" sx={{ marginBottom: "1rem" }}>About</Typography>

                <Box sx={{ width: "100%", marginBottom: "1rem" }}>
                    
                    <Box sx={{ width: "100%", display: "flex", flexDirection: "row", gap: "1rem" }}>
                        <Box sx={{ flexBasis: "20%" }}>
                            <Image src={Logo} alt="Logo" width={150} height={150} style={{ marginLeft: "auto", marginRight: "auto", marginBottom: "1rem" }} />
                        </Box>
                        <Box sx={{ flexBasis: "40%" }}>
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
                                <strong>PHP:</strong> { versions.php ? Object.values(versions.php).join("; ") : "" }
                            </Typography>
                            <Typography variant="body1">
                                <strong>Composer:</strong> { versions.composer ?? "" }
                            </Typography>
                        </Box>
                        <Box sx={{ flexBasis: "40%" }}>
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

                <Box sx={{ display: "flex", gap: "1rem" }}>
                    <Box>
                        { updateCheckStatus == "checking" && (
                            <CircularProgress />
                        ) }
                        { updateCheckStatus == "available" && (
                            <Button variant="contained" onClick={() => downloadLatestVersion()}>Download version { latestVersion }</Button>
                        ) }
                        { (updateCheckStatus == "" || updateCheckStatus == "updated" || updateCheckStatus == "error") && (
                            <Button variant="contained" onClick={() => checkForUpdates()}>Check for updates</Button>
                        ) }
                        { updateCheckStatus == "downloading" && (
                            <CircularProgress color="secondary" />
                        ) }
                        { updateCheckStatus == "ready" && (
                            <Button variant="contained" onClick={() => updateDialog()}>Install version { latestVersion }</Button>
                        ) }
                    </Box>

                    <Box>
                        <Button variant="contained" onClick={() => onlineHelp()}>Online Help</Button>
                    </Box>
                </Box>
            </Box>

            <Dialog open={showDialog} onClose={closeDialog}>
                <DialogTitle></DialogTitle>
                <DialogContent>
                    <DialogContentText>{dialogText}</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog}>Ok</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={showUpdateDialog} onClose={installUpdate}>
                <DialogTitle></DialogTitle>
                <DialogContent>
                    <DialogContentText>Before installing the update, we recommend you to stop all running services. Also, if you have made some modifications on one or more files of Local.Host's modules, you need to backup then before applying the update, and re-applying your modified files after the update.</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={installUpdate}>Ok, install {latestVersion}</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
