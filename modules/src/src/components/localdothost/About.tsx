import { IVersions } from "@/interfaces/IVersions";
import Image from "next/image";
import { useEffect, useState } from "react";
import Logo from "@/assets/logo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faQuestionCircle, faRotateRight } from "@fortawesome/free-solid-svg-icons";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { Modal } from "react-bootstrap";
import { stat } from "fs";

export default function About()
{
    const [versions, setVersions] = useState<IVersions>({
        gui: "", apache: "", php: {}, composer: "", mariadb: "", nginx: "",
        heidisql: "", acrylic: "", mongodb: "", compass: "", nvm: "", redis: "",
        postgresql: "", phpmyadmin: "", git: "", redisgui: ""
    });
    const [phpVersions, setPhpVersions] = useState<string[]>([]);
    const [latestVersion, setLatestVersion] = useState("");
    const [updateCheckStatus, setUpdateCheckStatus] = useState("");
    const [userUpdateCheck, setUserUpdateCheck] = useState(false);
    const [isDownloadingUpdate, setIsDownloadingUpdate] = useState(false);
    const [downloadPercentage, setDownloadPercentage] = useState(0);
    const [releasePage, setReleasePage] = useState("");

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

        window.ipcRenderer.on("localhost-status", (e: any, status: string, percentage: number = 0) => {
            setUpdateCheckStatus(status);
            if(status == "downloading"){
                setDownloadPercentage(percentage ?? 0);
            }
        });

        window.ipcRenderer.on("localhost-available", (e: any, version: string, url: string = "") => {
            setLatestVersion(version);
            setReleasePage(url);
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
                setShowDialog(true);
            }
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

    const openReleasePage = () => {
        window.ipcRenderer.send("localhost-open-release-page", releasePage);
    };
    
    return (
        <>
            <div className="container-fluid">
                <div className="row mb-3">
                    <div className="col-12">
                        <h2>About</h2>
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col-12 text-center">
                        <Image src={Logo} alt="Local.Host" width={100} height={100} className="img-fluid" />
                        <h3 className="mb-0">Local.Host { versions.gui }</h3>
                        <p>by RBFraphael &lt;rbfraphael@gmail.com&gt;</p>
                    </div>
                </div>

                <div className="row mb-4">
                    <div className="col-12 d-flex flex-row gap-2 align-items-center justify-content-center">
                        { (updateCheckStatus == "" || updateCheckStatus == "updated" || updateCheckStatus == "error" || updateCheckStatus == "checking") && (
                            <button className="btn btn-primary btn-sm px-5" onClick={() => checkForUpdates()} disabled={updateCheckStatus == "checking"}>
                                { updateCheckStatus == "checking" ? (
                                    <><span className="spinner-border spinner-border-sm"></span> Checking for updates...</>
                                ) : (
                                    <><FontAwesomeIcon icon={faRotateRight} fixedWidth /> Check for updates</>
                                ) }
                            </button>
                        ) }

                        { (updateCheckStatus == "available" || updateCheckStatus == "downloading") && (
                            <button className="btn btn-primary btn-sm px-5" onClick={() => downloadLatestVersion()} disabled={updateCheckStatus == "downloading"}>
                                { updateCheckStatus == "downloading" ? (
                                    <><span className="spinner-border spinner-border-sm"></span> Downloading... { downloadPercentage }%</>
                                ) : (
                                    <><FontAwesomeIcon icon={faDownload} fixedWidth /> Download version { latestVersion }</>
                                ) }
                            </button>
                        )}

                        { updateCheckStatus == "ready" && (
                            <button className="btn btn-primary btn-sm px-5" onClick={() => updateDialog()}>
                                <FontAwesomeIcon icon={faDownload} fixedWidth /> Install version { latestVersion }
                            </button>
                        ) }

                        <button className="btn btn-primary btn-sm px-5" onClick={onlineHelp}>
                            <FontAwesomeIcon icon={faQuestionCircle} fixedWidth /> Online help
                        </button>

                        <button className="btn btn-primary btn-sm px-5" onClick={githubRepository}>
                            <FontAwesomeIcon icon={faGithub} fixedWidth /> GitHub project
                        </button>
                    </div>
                </div>

                <div className="row mb-3 justify-content-center">
                    <div className="col-4">
                        <p className="m-0"><strong>Apache:</strong> <span className="badge text-bg-secondary rounded-pill">{ versions.apache }</span></p>
                        <p className="m-0"><strong>PHP:</strong> { phpVersions.map((v, i) => ( <span key={i} className="badge text-bg-secondary rounded-pill">{ v }</span> )) } </p>
                        <p className="m-0"><strong>NGINX:</strong> <span className="badge text-bg-secondary rounded-pill">{ versions.nginx }</span></p>
                        <p className="m-0"><strong>MariaDB:</strong> <span className="badge text-bg-secondary rounded-pill">{ versions.mariadb }</span></p>
                        <p className="m-0"><strong>MongoDB:</strong> <span className="badge text-bg-secondary rounded-pill">{ versions.mongodb }</span></p>
                    </div>
                    <div className="col-4">
                        <p className="m-0"><strong>PostgreSQL:</strong> <span className="badge text-bg-secondary rounded-pill">{ versions.postgresql }</span></p>
                        <p className="m-0"><strong>Redis:</strong> <span className="badge text-bg-secondary rounded-pill">{ versions.redis }</span></p>
                        <p className="m-0"><strong>Redis GUI:</strong> <span className="badge text-bg-secondary rounded-pill">{ versions.redisgui }</span></p>
                        <p className="m-0"><strong>HeidiSQL:</strong> <span className="badge text-bg-secondary rounded-pill">{ versions.heidisql }</span></p>
                        <p className="m-0"><strong>phpMyAdmin:</strong> <span className="badge text-bg-secondary rounded-pill">{ versions.phpmyadmin }</span></p>
                        <p className="m-0"><strong>MongoDB Compass:</strong> <span className="badge text-bg-secondary rounded-pill">{ versions.compass }</span></p>
                    </div>
                    <div className="col-3">
                        <p className="m-0"><strong>Acrylic DNS:</strong> <span className="badge text-bg-secondary rounded-pill">{ versions.acrylic }</span></p>
                        <p className="m-0"><strong>NVM:</strong> <span className="badge text-bg-secondary rounded-pill">{ versions.nvm }</span></p>
                        <p className="m-0"><strong>Git:</strong> <span className="badge text-bg-secondary rounded-pill">{ versions.git }</span></p>
                        <p className="m-0"><strong>Composer:</strong> <span className="badge text-bg-secondary rounded-pill">{ versions.composer }</span></p>
                    </div>
                </div>
            </div>

            <Modal show={showDialog} onHide={closeDialog} centered className="shadow border-0" backdrop="static" animation={true}>
                <Modal.Body>
                    <p>{ dialogText }</p>
                </Modal.Body>
                <Modal.Footer className="border-0">
                    { updateCheckStatus == "available" && (
                        <button className="btn btn-outline-light btn-sm border-0" onClick={openReleasePage}>View release info</button>
                    )}
                    <button className="btn btn-outline-light btn-sm border-0" onClick={closeDialog}>Ok</button>
                </Modal.Footer>
            </Modal>

            <Modal show={showUpdateDialog} onHide={installUpdate} centered className="shadow border-0" backdrop="static" animation={true}>
                <Modal.Body>
                    <p>Before installing the update, we recommend you to stop all running services. Also, if you have made some modifications on one or more files of Local.Host&apos;s modules, you need to backup them before applying the update, and re-applying your modified files after the update.</p>
                </Modal.Body>
                <Modal.Footer className="border-0">
                    <button className="btn btn-outline-light btn-sm border-0" onClick={installUpdate}>Ok, install {latestVersion}</button>
                </Modal.Footer>
            </Modal>
        </>
    );
}
