import { Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Typography } from "@mui/material";
import Logo from "../assets/logo.png";
import Image from "next/image";
import { useEffect, useState } from "react";
import { IVersions } from "@/interfaces/IVersions";
import { Download, GitHub, Help, InstallDesktop, Update } from "@mui/icons-material";

export default function About()
{
    const [versions, setVersions] = useState<IVersions>({
        gui: "", apache: "", php: {}, composer: "", mariadb: "",
        heidisql: "", acrylic: "", mongodb: "", compass: "", nvm: "", redis: ""
    });
    const [phpVersions, setPhpVersions] = useState<string[]>([]);
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

    const githubRepository = () => {
        window.ipcRenderer.send("localhost-repository");
    };

    useEffect(() => {
        window.ipcRenderer.send("localhost-versions", true);

        window.ipcRenderer.on("localhost-versions", (e: any, versions: IVersions) => {
            setVersions(versions);
            setPhpVersions(Object.values(versions.php));
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

                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "1rem" }}>
                        <Box>
                            <Image src={Logo} alt="Logo" width={100} height={100} />
                        </Box>
                        <Box sx={{ textAlign: "center" }}>
                            <Typography variant="h4" sx={{fontSize:"1.8rem"}}>Local.Host { versions.gui }</Typography>
                            <Typography variant="body1">by RBFraphael &lt;rbfraphael@gmail.com&gt;</Typography>
                        </Box>
                    </Box>

                    <Box sx={{ display: "flex", gap: "1rem", justifyContent: "center", marginBottom: "1rem" }}>
                        <Box>
                            { (updateCheckStatus == "available" || updateCheckStatus == "downloading") && (
                                <Button variant="contained" onClick={() => downloadLatestVersion()} size="small" disabled={updateCheckStatus == "downloading"}>
                                    { updateCheckStatus == "downloading" ? (
                                        <CircularProgress color="secondary" size={13} sx={{ marginRight: ".5rem" }} />
                                    ) : (
                                        <Download sx={{ marginRight: ".5rem" }} fontSize="small" />
                                    ) }
                                    Download version { latestVersion }
                                </Button>
                            ) }

                            { (updateCheckStatus == "" || updateCheckStatus == "updated" || updateCheckStatus == "error" || updateCheckStatus == "checking") && (
                                <Button variant="contained" onClick={() => checkForUpdates()} size="small" disabled={updateCheckStatus == "checking"}>
                                    { updateCheckStatus == "checking" ? (
                                        <CircularProgress size={13} sx={{ marginRight: ".5rem" }} />
                                    ) : (
                                        <Update sx={{ marginRight: ".5rem" }} fontSize="small" />
                                    ) }
                                    Check for updates
                                </Button>
                            ) }
                            
                            { updateCheckStatus == "ready" && (
                                <Button variant="contained" onClick={() => updateDialog()} size="small">
                                    <InstallDesktop sx={{ marginRight: ".5rem" }} fontSize="small" />
                                    Install version { latestVersion }
                                </Button>
                            ) }
                        </Box>

                        <Box>
                            <Button variant="contained" onClick={() => onlineHelp()} size="small">
                                <Help sx={{ marginRight: ".5rem" }} fontSize="small" />
                                Online Help
                            </Button>
                        </Box>

                        <Box>
                            <Button variant="contained" onClick={() => githubRepository()} size="small">
                                <GitHub sx={{ marginRight: ".5rem" }} fontSize="small" />
                                GitHub Repository
                            </Button>
                        </Box>
                    </Box>
                    
                    <Box sx={{ width: "100%", display: "flex", flexDirection: "row", justifyContent: "center" }}>
                        <Box sx={{ flexBasis: "30%" }}>
                            <Typography variant="body1">
                                <strong>Apache:</strong> { versions.apache ? <Chip label={versions.apache} size="small" /> : null }
                            </Typography>
                            <Typography variant="body1">
                                <strong>PHP:</strong>
                                { phpVersions.slice(0, phpVersions.length/2).map((version) => ( <Chip key={version} label={version} size="small" /> )) }
                                <br />
                                { phpVersions.slice(phpVersions.length/2).map((version) => ( <Chip key={version} label={version} size="small" /> )) }
                            </Typography>
                            <Typography variant="body1">
                                <strong>Composer:</strong> { versions.composer ? <Chip label={versions.composer} size="small" /> : null }
                            </Typography>
                            <Typography variant="body1">
                                <strong>MariaDB:</strong> { versions.mariadb ? <Chip label={versions.mariadb} size="small" /> : null }
                            </Typography>
                            <Typography variant="body1">
                                <strong>HeidiSQL:</strong> { versions.heidisql ? <Chip label={versions.heidisql} size="small" /> : null }
                            </Typography>
                        </Box>
                        <Box sx={{ flexBasis: "30%" }}>
                            <Typography variant="body1">
                                <strong>Redis:</strong> { versions.redis ? <Chip label={versions.redis} size="small" /> : null }
                            </Typography>
                            <Typography variant="body1">
                                <strong>Acrylic DNS:</strong> { versions.acrylic ? <Chip label={versions.acrylic} size="small" /> : null }
                            </Typography>
                            <Typography variant="body1">
                                <strong>MongoDB:</strong> { versions.mongodb ? <Chip label={versions.mongodb} size="small" /> : null }
                            </Typography>
                            <Typography variant="body1">
                                <strong>MongoDB Compass:</strong> { versions.compass ? <Chip label={versions.compass} size="small" /> : null }
                            </Typography>
                            <Typography variant="body1">
                                <strong>NVM:</strong> { versions.nvm ? <Chip label={versions.nvm} size="small" /> : null }
                            </Typography>
                        </Box>
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
