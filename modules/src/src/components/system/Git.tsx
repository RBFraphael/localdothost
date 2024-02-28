import { faCircle, faDownload, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";

export default function Git()
{
    const [status, setStatus] = useState<string>("uninstalled");
    const [contextMenu, setContextMenu] = useState<string>("removed");

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

    useEffect(() => {
        window.ipcRenderer.send("git-status");

        window.ipcRenderer.on("git-status", (e: any, status: string) => {
            setStatus(status);
        });

        window.ipcRenderer.on("git-context-menu", (e: any, status: string) => {
            setContextMenu(status);
        });
    }, []);

    return (
        <div className="container-fluid">
            <div className="row mb-3">
                <div className="col-12">
                    <h2>Git</h2>
                </div>
            </div>
            <div className="row mb-4">
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
            <div className="row">
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
        </div>
    );
}
