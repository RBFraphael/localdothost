import { faCircle, faDownload, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";

export default function CliTools()
{
    const [status, setStatus] = useState("uninstalled");
    const [currentCliPhpVersion, setCurrentCliPhpVersion] = useState("");

    const phpVersions = ["5.6", "7.0", "7.2", "7.4", "8.0", "8.2", "8.3"];

    useEffect(() => {
        window.ipcRenderer.send("extras-status");
        window.ipcRenderer.send("php-cli");

        window.ipcRenderer.on("php-cli-version", (e: any, version: string) => {
            setCurrentCliPhpVersion(version);
        });

        window.ipcRenderer.on("extras-status", (e: any, status: string) => {
            setStatus(status);
        });
    }, []);

    const tools = (action: string) => {
        window.ipcRenderer.send("extras", action);
    };

    const onChangeCliPhpVersion = (version: string) => {
        window.ipcRenderer.send("set-php-cli", version);
    };

    return (
        <div className="container-fluid">
            <div className="row mb-3">
                <div className="col-12">
                    <h2>Commandline Tools</h2>
                </div>
            </div>

            <div className="row">
                <div className="col-6">
                    <p>This includes the following commands:</p>
                    <ul className="list-inline">
                        <li className="list-inline-item mb-1"><span className="badge bg-secondary font-monospace">composer</span></li>
                        <li className="list-inline-item mb-1"><span className="badge bg-secondary font-monospace">mysql</span></li>
                        <li className="list-inline-item mb-1"><span className="badge bg-secondary font-monospace">mysqldump</span></li>
                        <li className="list-inline-item mb-1"><span className="badge bg-secondary font-monospace">psql</span></li>
                        <li className="list-inline-item mb-1"><span className="badge bg-secondary font-monospace">pg_dump</span></li>
                        <li className="list-inline-item mb-1"><span className="badge bg-secondary font-monospace">php</span></li>
                        <li className="list-inline-item mb-1"><span className="badge bg-secondary font-monospace">php5.6</span></li>
                        <li className="list-inline-item mb-1"><span className="badge bg-secondary font-monospace">php7.0</span></li>
                        <li className="list-inline-item mb-1"><span className="badge bg-secondary font-monospace">php7.2</span></li>
                        <li className="list-inline-item mb-1"><span className="badge bg-secondary font-monospace">php7.4</span></li>
                        <li className="list-inline-item mb-1"><span className="badge bg-secondary font-monospace">php8.0</span></li>
                        <li className="list-inline-item mb-1"><span className="badge bg-secondary font-monospace">php8.2</span></li>
                        <li className="list-inline-item mb-1"><span className="badge bg-secondary font-monospace">php8.3</span></li>
                        <li className="list-inline-item mb-1"><span className="badge bg-secondary font-monospace">redis</span></li>
                    </ul>

                    <div className="mb-3">
                        <p className="mb-0">
                            <strong>Status:</strong> &nbsp;
                            { status == "installed" && (
                                <> <FontAwesomeIcon icon={faCircle} className="text-success" fixedWidth /> Installed </>
                            )}
                            { status == "uninstalled" && (
                                <> <FontAwesomeIcon icon={faCircle} className="text-danger" fixedWidth /> Uninstalled </>
                            )}
                            { (status == "installing" || status == "uninstalling") && (
                                <> <FontAwesomeIcon icon={faCircle} fixedWidth /> Waiting </>
                            )}
                        </p>
                    </div>

                    <div className="mb-3 d-flex flex-row gap-2">
                        { status == "uninstalled" && (
                            <button className="btn btn-sm btn-success px-5" onClick={() => tools("install")}>
                                <FontAwesomeIcon icon={faDownload} fixedWidth /> Install
                            </button>
                        ) }
                        { ( status == "installing" || status == "uninstalling" ) && (
                            <div className="spinner-border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        ) }
                        { status == "installed" && (
                            <>
                                <button className="btn btn-sm btn-danger px-5" onClick={() => tools("uninstall")}>
                                    <FontAwesomeIcon icon={faTimes} fixedWidth /> Uninstall
                                </button>
                            </>
                        ) }
                    </div>
                </div>
                <div className="col-6">
                    <div className="form-floating">
                        <select className="form-select" id="phpVersion" value={currentCliPhpVersion} onChange={(e) => onChangeCliPhpVersion(e.target.value)}>
                            <option value="" hidden>Select PHP Version</option>
                            { phpVersions.map((version, index) => (
                                <option key={index} value={version}>PHP {version}</option>
                            )) }
                        </select>
                        <label htmlFor="phpVersion">Default PHP CLI Version</label>
                    </div>
                </div>
            </div>
        </div>
    );
}