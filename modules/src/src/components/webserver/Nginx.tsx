import { ISettings } from "@/interfaces/ISettings";
import { faPhp } from "@fortawesome/free-brands-svg-icons";
import { faCircle, faCog, faPlay, faSquareUpRight, faStop } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { Dropdown } from "react-bootstrap";

export default function Nginx()
{
    const [status, setStatus] = useState("stopped");
    const [listeningPorts, setListeningPorts] = useState<string[]>([]);
    const [pids, setPids] = useState<string[]>([]);
    const [websites, setWebsites] = useState<string[]>([]);

    const startWebServer = () => {
        window.ipcRenderer.send("nginx", "start");
    }

    const stopWebServer = () => {
        window.ipcRenderer.send("nginx", "stop");
    }

    const openWebServer = () => {
        window.ipcRenderer.send("nginx", "open");
    }

    const onNginxSettingsClose = (option: string|null = null, action: string|null = null) => {
        if(option !== null && action !== null){
            window.ipcRenderer.send(option, action);
        }
    }

    const onPhpSettingsClose = (option: string|null = null, action: string|null = null) => {
        if(option !== null && action !== null){
            window.ipcRenderer.send(option, action);
        }
    }

    useEffect(() => {
        window.ipcRenderer.on("localhost-init", (e: any, settings: ISettings) => {
            window.ipcRenderer.send("nginx-boot", settings.autostart.nginx);
        });

        window.ipcRenderer.on("nginx-status", (e: any, status: string) => {
            setStatus(status);
        });

        window.ipcRenderer.on("nginx-ports", (e: any, ports: string[]) => {
            setListeningPorts(ports);
        });

        window.ipcRenderer.on("nginx-pids", (e: any, pids: string[]) => {
            setPids(pids);
        });

        window.ipcRenderer.on("nginx-websites", (e: any, websites: string[]) => {
            setWebsites(websites);
        });
    }, []);

    const openWebsite = (site: string) => {
        window.ipcRenderer.send("nginx-open-website", site);
    }
    
    return (
        <div className="container-fluid">
            <div className="row mb-3">
                <div className="col-12">
                    <h2>Nginx Web Server</h2>
                </div>
            </div>
            <div className="row">
                <div className="col-6">
                    <div className="mb-3 d-flex flex-row gap-2">
                        { status == "stopped" && (
                            <button className="btn btn-sm btn-success px-5" onClick={startWebServer}>
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
                                <button className="btn btn-sm btn-danger px-5" onClick={stopWebServer}>
                                    <FontAwesomeIcon icon={faStop} fixedWidth /> Stop
                                </button>
                                <button className="btn btn-sm btn-primary px-5" onClick={openWebServer}>
                                    <FontAwesomeIcon icon={faSquareUpRight} fixedWidth /> Browse
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
                                <Dropdown.Item className="text-uppercase small" onClick={() => onNginxSettingsClose("nginx-config", "nginx")}>NGINX config &lt;nginx.conf&gt;</Dropdown.Item>
                                <Dropdown.Item className="text-uppercase small" onClick={() => onNginxSettingsClose("nginx-config", "nginx-localhost")}>Dynamic hosts config &lt;localdothost.conf&gt;</Dropdown.Item>
                                <Dropdown.Item className="text-uppercase small" onClick={() => onNginxSettingsClose("nginx-config", "nginx-php")}>NGINX PHP config &lt;php.conf&gt;</Dropdown.Item>
                                <Dropdown.Item className="text-uppercase small" onClick={() => onNginxSettingsClose("nginx-dir", "nginx")}>Open NGINX directory</Dropdown.Item>
                                <Dropdown.Item className="text-uppercase small" onClick={() => onNginxSettingsClose("nginx-dir", "docroot")}>Open Document Root directory</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>

                        <Dropdown>
                            <Dropdown.Toggle className="btn-secondary btn-sm px-5">
                                <FontAwesomeIcon icon={faPhp} fixedWidth /> PHP Settings
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="shadow">
                                <Dropdown.Item className="text-uppercase small" onClick={() => onNginxSettingsClose("nginx-config", "php56")}>PHP 5.6 &lt;php.ini&gt;</Dropdown.Item>
                                <Dropdown.Item className="text-uppercase small" onClick={() => onNginxSettingsClose("nginx-config", "php70")}>PHP 7.0 &lt;php.ini&gt;</Dropdown.Item>
                                <Dropdown.Item className="text-uppercase small" onClick={() => onNginxSettingsClose("nginx-config", "php72")}>PHP 7.2 &lt;php.ini&gt;</Dropdown.Item>
                                <Dropdown.Item className="text-uppercase small" onClick={() => onNginxSettingsClose("nginx-config", "php74")}>PHP 7.4 &lt;php.ini&gt;</Dropdown.Item>
                                <Dropdown.Item className="text-uppercase small" onClick={() => onNginxSettingsClose("nginx-config", "php80")}>PHP 8.0 &lt;php.ini&gt;</Dropdown.Item>
                                <Dropdown.Item className="text-uppercase small" onClick={() => onNginxSettingsClose("nginx-config", "php82")}>PHP 8.2 &lt;php.ini&gt;</Dropdown.Item>
                                <Dropdown.Item className="text-uppercase small" onClick={() => onNginxSettingsClose("nginx-config", "php83")}>PHP 8.3 &lt;php.ini&gt;</Dropdown.Item>
                                <Dropdown.Item className="text-uppercase small" onClick={() => onNginxSettingsClose("nginx-dir", "php")}>Open PHP directory</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                </div>
                <div className="col-6 ps-5">
                    { status == "running" && (
                        <>
                            <div className="card shadow">
                                <div className="card-body">
                                    <h5 className="card-title">Websites</h5>
                                    <ul className="list-group list-group-flush" style={{maxHeight: "300px", overflowY: "auto"}}>
                                        { websites.map((site, i) => (
                                            <li key={i} className="list-group-item d-flex justify-content-between align-items-center">
                                                { site }
                                                <button className="btn btn-sm btn-primary" onClick={() => openWebsite(site)}>
                                                    <FontAwesomeIcon icon={faSquareUpRight} fixedWidth />
                                                </button>
                                            </li>
                                        )) }
                                    </ul>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
