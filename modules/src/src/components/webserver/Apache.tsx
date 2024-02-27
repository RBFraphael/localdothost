import { ISettings } from "@/interfaces/ISettings";
import { faPhp } from "@fortawesome/free-brands-svg-icons";
import { faCircle, faCog, faPlay, faSquareUpRight, faStop } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { Dropdown } from "react-bootstrap";

export default function Apache()
{
    const [status, setStatus] = useState("stopped");
    const [listeningPorts, setListeningPorts] = useState<string[]>([]);
    const [pids, setPids] = useState<string[]>([]);
    const [websites, setWebsites] = useState<string[]>([]);

    const startWebServer = () => {
        window.ipcRenderer.send("apache", "start");
    }

    const stopWebServer = () => {
        window.ipcRenderer.send("apache", "stop");
    }

    const openWebServer = () => {
        window.ipcRenderer.send("apache", "open");
    }

    const onApacheSettingsClose = (option: string|null = null, action: string|null = null) => {
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
            window.ipcRenderer.send("apache-boot", settings.autostart.apache);
        });

        window.ipcRenderer.on("apache-status", (e: any, status: string) => {
            setStatus(status);
        });

        window.ipcRenderer.on("apache-ports", (e: any, ports: string[]) => {
            setListeningPorts(ports);
        });

        window.ipcRenderer.on("apache-pids", (e: any, pids: string[]) => {
            setPids(pids);
        });

        window.ipcRenderer.on("apache-websites", (e: any, websites: string[]) => {
            setWebsites(websites);
        });
    }, []);

    const openWebsite = (site: string) => {
        window.ipcRenderer.send("apache-open-website", site);
    }

    return (
        <div className="container-fluid">
            <div className="row mb-3">
                <div className="col-12">
                    <h2>Apache Web Server</h2>
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
                                <Dropdown.Item className="text-uppercase small" onClick={() => onApacheSettingsClose("apache-config", "apache")}>Apache config &lt;httpd.conf&gt;</Dropdown.Item>
                                <Dropdown.Item className="text-uppercase small" onClick={() => onApacheSettingsClose("apache-config", "apache-ssl")}>Apache SSL config &lt;httpd-ssl.conf&gt;</Dropdown.Item>
                                <Dropdown.Item className="text-uppercase small" onClick={() => onApacheSettingsClose("apache-config", "apache-vhosts")}>Virtual Hosts config &lt;httpd-vhosts.conf&gt;</Dropdown.Item>
                                <Dropdown.Item className="text-uppercase small" onClick={() => onApacheSettingsClose("apache-config", "apache-localhost")}>Dynamic hosts config &lt;httpd-local.host.conf&gt;</Dropdown.Item>
                                <Dropdown.Item className="text-uppercase small" onClick={() => onApacheSettingsClose("apache-dir", "apache")}>Open Apache directory</Dropdown.Item>
                                <Dropdown.Item className="text-uppercase small" onClick={() => onApacheSettingsClose("apache-dir", "docroot")}>Open Document Root directory</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>

                        <Dropdown>
                            <Dropdown.Toggle className="btn-secondary btn-sm px-5">
                                <FontAwesomeIcon icon={faPhp} fixedWidth /> PHP Settings
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="shadow">
                                <Dropdown.Item className="text-uppercase small" onClick={() => onApacheSettingsClose("apache-config", "php56")}>PHP 5.6 &lt;php.ini&gt;</Dropdown.Item>
                                <Dropdown.Item className="text-uppercase small" onClick={() => onApacheSettingsClose("apache-config", "php70")}>PHP 7.0 &lt;php.ini&gt;</Dropdown.Item>
                                <Dropdown.Item className="text-uppercase small" onClick={() => onApacheSettingsClose("apache-config", "php72")}>PHP 7.2 &lt;php.ini&gt;</Dropdown.Item>
                                <Dropdown.Item className="text-uppercase small" onClick={() => onApacheSettingsClose("apache-config", "php74")}>PHP 7.4 &lt;php.ini&gt;</Dropdown.Item>
                                <Dropdown.Item className="text-uppercase small" onClick={() => onApacheSettingsClose("apache-config", "php80")}>PHP 8.0 &lt;php.ini&gt;</Dropdown.Item>
                                <Dropdown.Item className="text-uppercase small" onClick={() => onApacheSettingsClose("apache-config", "php82")}>PHP 8.2 &lt;php.ini&gt;</Dropdown.Item>
                                <Dropdown.Item className="text-uppercase small" onClick={() => onApacheSettingsClose("apache-config", "php83")}>PHP 8.3 &lt;php.ini&gt;</Dropdown.Item>
                                <Dropdown.Item className="text-uppercase small" onClick={() => onApacheSettingsClose("apache-dir", "php")}>Open PHP directory</Dropdown.Item>
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
