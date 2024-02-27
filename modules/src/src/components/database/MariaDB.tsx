import { ISettings } from "@/interfaces/ISettings";
import { faCircle, faCog, faDatabase, faPlay, faSquareUpRight, faStop } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { Dropdown } from "react-bootstrap";

export default function MariaDB()
{
    const [status, setStatus] = useState("stopped");
    const [listeningPorts, setListeningPorts] = useState<string[]>([]);
    const [pids, setPids] = useState<string[]>([]);

    const startDbServer = () => {
        window.ipcRenderer.send("mariadb", "start");
    }

    const stopDbServer = () => {
        window.ipcRenderer.send("mariadb", "stop");
    }

    const openDbServer = () => {
        window.ipcRenderer.send("mariadb", "open");
    }

    const onMariadbSettingsClose = (option: string|null = null, action: string|null = null) => {
        if(option !== null && action !== null){
            window.ipcRenderer.send(option, action);
        }
    }

    const onPmaSettingsClose = (option: string|null = null, action: string|null = null) => {
        if(option !== null && action !== null){
            window.ipcRenderer.send(option, action);
        }
    }

    const openHeidiSql = () => {
        window.ipcRenderer.send("heidisql");
    }

    useEffect(() => {
        window.ipcRenderer.on("localhost-init", (e: any, settings: ISettings) => {
            window.ipcRenderer.send("mariadb-boot", settings.autostart.mariadb);
        });

        window.ipcRenderer.on("mariadb-status", (e: any, status: string) => {
            setStatus(status);
        });
        window.ipcRenderer.on("mariadb-ports", (e: any, ports: string[]) => {
            setListeningPorts(ports);
        });
        window.ipcRenderer.on("mariadb-pids", (e: any, pids: string[]) => {
            setPids(pids);
        });
    }, []);

    return (
        <div className="container-fluid">
            <div className="row mb-3">
                <div className="col-12">
                    <h2>MariaDB/MySQL Database</h2>
                </div>
            </div>
            <div className="row">
                <div className="col-12">
                    <div className="mb-3 d-flex flex-row gap-2">
                        { status == "stopped" && (
                            <button className="btn btn-sm btn-success px-5" onClick={startDbServer}>
                                <FontAwesomeIcon icon={faPlay} fixedWidth /> Start
                            </button>
                        ) }
                        { ( status == "starting" || status == "stopping" ) && (
                            <div className="spinner-border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        ) }
                        { status == "running" && (
                            <>
                                <button className="btn btn-sm btn-danger px-5" onClick={stopDbServer}>
                                    <FontAwesomeIcon icon={faStop} fixedWidth /> Stop
                                </button>
                                <button className="btn btn-sm btn-primary px-5" onClick={openDbServer}>
                                    <FontAwesomeIcon icon={faSquareUpRight} fixedWidth /> Browse
                                </button>
                                <button className="btn btn-sm btn-primary px-5" onClick={openHeidiSql}>
                                    <FontAwesomeIcon icon={faSquareUpRight} fixedWidth /> Open HeidiSQL
                                </button>
                            </>
                        ) }
                    </div>

                    <div className="mb-3">
                        <p className="mb-0">
                            <strong>Status:</strong> &nbsp;
                            { status == "running" && (
                                <> <FontAwesomeIcon icon={faCircle} className="text-success" fixedWidth /> Running </>
                            )}
                            { status == "stopped" && (
                                <> <FontAwesomeIcon icon={faCircle} className="text-danger" fixedWidth /> Stopped </>
                            )}
                            { (status == "starting" || status == "stopping") && (
                                <> <FontAwesomeIcon icon={faCircle} fixedWidth /> Waiting </>
                            )}
                        </p>
                        <p className="mb-0">
                            { status == "running" && (
                                <><strong>Listening ports:</strong> { listeningPorts.join(", ") }</>
                            ) }
                        </p>
                        <p className="mb-0">
                            { status == "running" && (
                                <><strong>PID:</strong> { pids.join(", ") }</>
                            ) }
                        </p>
                    </div>

                    <div className="mb-3 d-flex flex-row gap-2">
                        <Dropdown>
                            <Dropdown.Toggle className="btn-secondary btn-sm px-5">
                                <FontAwesomeIcon icon={faCog} fixedWidth /> Settings
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="shadow">
                                <Dropdown.Item className="text-uppercase small" onClick={() => onMariadbSettingsClose("mariadb-config", "mariadb")}>MariaDB config &lt;my.cnf&gt;</Dropdown.Item>
                                <Dropdown.Item className="text-uppercase small" onClick={() => onMariadbSettingsClose("mariadb-dir", "mariadb")}>Open MariaDB directory</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>

                        <Dropdown>
                            <Dropdown.Toggle className="btn-secondary btn-sm px-5">
                                <FontAwesomeIcon icon={faDatabase} fixedWidth /> phpMyAdmin Settings
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="shadow">
                                <Dropdown.Item className="text-uppercase small" onClick={() => onPmaSettingsClose("mariadb-config", "phpmyadmin")}>phpMyAdmin config &lt;config.inc.php&gt;</Dropdown.Item>
                                <Dropdown.Item className="text-uppercase small" onClick={() => onPmaSettingsClose("mariadb-dir", "phpmyadmin")}>Open phpMyAdmin directory</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                </div>
            </div>
        </div>
    );
}
