import { faAdd, faCircle, faDownload, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";

export default function Git()
{
    const [status, setStatus] = useState<string>("uninstalled");
    const [contextMenu, setContextMenu] = useState<string>("removed");
    
    const [showDialog, setShowDialog] = useState(false);
    const [dialogText, setDialogText] = useState("");
    const [terminalStatus, setTerminalStatus] = useState("removed");

    const install = () => {
        window.ipcRenderer.send("git", "install");
    }

    const uninstall = () => {
        window.ipcRenderer.send("git", "uninstall");
    }

    const addContextMenu = () => {
        window.ipcRenderer.send("git-context-menu", "add");
    }

    const removeContextMenu = () => {
        window.ipcRenderer.send("git-context-menu", "remove");
    }

    const addWindowsTerminalProfile = () => {
        window.ipcRenderer.send("git-terminal-profile", "add");
    }

    const removeWindowsTerminalProfile = () => {
        window.ipcRenderer.send("git-terminal-profile", "remove");
    }

    const closeDialog = () => {
        setShowDialog(false);
    };

    useEffect(() => {
        window.ipcRenderer.send("git-status");
        window.ipcRenderer.send("git-terminal-profile", "status");

        window.ipcRenderer.on("git-status", (e: any, status: string) => {
            setStatus(status);
        });

        window.ipcRenderer.on("git-context-menu", (e: any, status: string) => {
            setContextMenu(status);
        });

        window.ipcRenderer.on("git-terminal-profile", (e: any, status: string) => {
            setTerminalStatus(status);

            // let statusMessage = "";
            // switch(status) {
            //     case "added":
            //         statusMessage = "Windows Terminal profile added successfully.";
            //         break;
            //     case "removed":
            //         statusMessage = "Windows Terminal profile removed successfully.";
            //         break;
            //     case "not-found":
            //         statusMessage = "Windows Terminal profile not found. Please install Windows Terminal and open it at least one time before adding the profile.";
            //         break;
            // }

            // setDialogText(statusMessage);
            // setShowDialog(true);
        });
    }, []);

    return (
        <>
            <div className="container-fluid">
                <div className="row mb-3">
                    <div className="col-12">
                        <h2>Git</h2>
                    </div>
                </div>
                <div className="row mb-5">
                    <div className="col-12">
                        <h4>Command line</h4>
                        <p>
                            <strong>Status: </strong> &nbsp;
                            { status == "installed" && (
                                <><FontAwesomeIcon icon={faCircle} fixedWidth className="text-success" /> Installed</>
                            ) }
                            { status == "uninstalled" && (
                                <><FontAwesomeIcon icon={faCircle} fixedWidth className="text-danger" /> Uninstalled</>
                            )}
                            { (status == "installing" || status == "uninstalling") && (
                                <><FontAwesomeIcon icon={faCircle} fixedWidth className="text-light" /> Waiting</>
                            )}
                        </p>
                        { status == "installed" && (
                            <button className="btn btn-sm btn-danger px-5" onClick={uninstall}>
                                <FontAwesomeIcon icon={faTimes} fixedWidth /> Uninstall
                            </button>
                        ) }
                        { status == "uninstalled" && (
                            <button className="btn btn-sm btn-success px-5" onClick={install}>
                                <FontAwesomeIcon icon={faDownload} fixedWidth /> Install
                            </button>
                        )}
                        { (status == "installing" || status == "uninstalling") && (
                            <span className="spinner-border spinner-border-sm"></span>
                        )}
                    </div>
                </div>
                
                <div className="row mb-5">
                    <div className="col-12">
                        <h4>Context Menu</h4>
                        <p>
                            <strong>Status: </strong> &nbsp;
                            { contextMenu == "added" && (
                                <><FontAwesomeIcon icon={faCircle} fixedWidth className="text-success" /> Installed</>
                            ) }
                            { contextMenu == "removed" && (
                                <><FontAwesomeIcon icon={faCircle} fixedWidth className="text-danger" /> Uninstalled</>
                            )}
                            { (contextMenu == "adding" || contextMenu == "removing") && (
                                <><FontAwesomeIcon icon={faCircle} fixedWidth className="text-light" /> Waiting</>
                            )}
                        </p>
                        { contextMenu == "added" && (
                            <button className="btn btn-sm btn-danger px-5" onClick={removeContextMenu}>
                                <FontAwesomeIcon icon={faTimes} fixedWidth /> Remove Context Menu Options
                            </button>
                        ) }
                        { contextMenu == "removed" && (
                            <button className="btn btn-sm btn-success px-5" onClick={addContextMenu}>
                                <FontAwesomeIcon icon={faDownload} fixedWidth /> Add Context Menu Options
                            </button>
                        )}
                        { (contextMenu == "adding" || contextMenu == "removing") && (
                            <span className="spinner-border spinner-border-sm"></span>
                        )}
                    </div>
                </div>

                { terminalStatus !== "not-found" && (
                <div className="row">
                    <div className="col-12">
                        <h4>Windows Terminal Profile</h4>
                        { terminalStatus == "added" ? (
                            <button className="btn btn-sm btn-danger px-5" onClick={removeWindowsTerminalProfile}>
                                <FontAwesomeIcon icon={faTimes} fixedWidth /> Remove Windows Terminal profile for Git Bash
                            </button>
                        ) : (
                            <button className="btn btn-sm btn-success px-5" onClick={addWindowsTerminalProfile}>
                                <FontAwesomeIcon icon={faAdd} fixedWidth /> Add Windows Terminal profile for Git Bash
                            </button>
                        )}
                    </div>
                </div>
                ) }
            </div>

            <Modal show={showDialog} onHide={closeDialog} centered className="shadow border-0" backdrop="static" animation={true}>
                <Modal.Body>
                    <p>{ dialogText }</p>
                </Modal.Body>
                <Modal.Footer className="border-0">
                    <button className="btn btn-outline-light btn-sm border-0" onClick={closeDialog}>Ok</button>
                </Modal.Footer>
            </Modal>
        </>
    );
}
