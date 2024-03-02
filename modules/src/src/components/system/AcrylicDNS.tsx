import { faCircle, faCog, faDownload, faPlay, faRotateRight, faStop, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { Dropdown, Modal } from "react-bootstrap";

export default function AcrylicDNS()
{
    const [serverStatus, setServerStatus] = useState("stopped");
    const [serviceStatus, setServiceStatus] = useState("uninstalled");
    const [cacheStatus, setCacheStatus] = useState("");
    const [listeningPorts, setListeningPorts] = useState<string[]>([]);
    const [pids, setPids] = useState<string[]>([]);

    const [dnsStatusMessage, setDnsStatusMessage] = useState("");
    const [showDnsDialog, setShowDnsDialog] = useState(false);

    useEffect(() => {
        window.ipcRenderer.send("acrylic-service-status");

        window.ipcRenderer.on("acrylic-server-status", (e: any, status: string) => {
            setServerStatus(status);
        });

        window.ipcRenderer.on("acrylic-service-status", (e: any, status: string) => {
            setServiceStatus(status);
            if(status == "installed"){
                window.ipcRenderer.send("acrylic-server-status");
            }
        });

        window.ipcRenderer.on("acrylic-ports", (e: any, ports: string[]) => {
            setListeningPorts(ports);
        });

        window.ipcRenderer.on("acrylic-pids", (e: any, pids: string[]) => {
            setPids(pids);
        });

        window.ipcRenderer.on("acrylic-cache-clear", () => {
            setCacheStatus("cleared");
            setTimeout(() => {
                setCacheStatus("");
            }, 4000);
        });

        window.ipcRenderer.on("acrylic-dns", (e: any, status: string) => {
            if(status == "set"){
                setDnsStatusMessage("DNS settings have been set to 127.0.0.1 successfully.");
            } else if(status == "set-error"){
                setDnsStatusMessage("Failed to set DNS settings. Please try again or set it manually.");
            } else if(status == "reset"){
                setDnsStatusMessage("DNS settings have been reset to DHCP successfully.");
            } else if(status == "reset-error"){
                setDnsStatusMessage("Failed to reset DNS settings. Please try again or reset it manually.");
            }

            setShowDnsDialog(true);
        });
    }, []);

    const acrylicService = (action: string) => {
        window.ipcRenderer.send("acrylic-service", action);
    };

    const acrylicServer = (action: string) => {
        window.ipcRenderer.send("acrylic-server", action);
    };

    const onAcrylicSettingsClose = (option: string|null = null, action: string|null = null) => {
        if(option !== null){
            window.ipcRenderer.send(option, action);
        }
    }

    const closeDnsDialog = () => {
        setShowDnsDialog(false);
    };

    return (
        <>
            <div className="container-fluid">
                <div className="row mb-3">
                    <div className="col-12">
                        <h2>Acrylic DNS Proxy</h2>
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col-12">
                        <h4>Service</h4>

                        <div className="mb-3 d-flex flex-row gap-2">
                            { serviceStatus == "uninstalled" && (
                                <button className="btn btn-sm btn-success px-5" onClick={() => acrylicService("install")}>
                                    <FontAwesomeIcon icon={faDownload} fixedWidth /> Install
                                </button>
                            ) }
                            { ( serviceStatus == "installing" || serviceStatus == "uninstalling" ) && (
                                <div className="spinner-border" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            ) }
                            { serviceStatus == "installed" && (
                                <>
                                    <button className="btn btn-sm btn-danger px-5" onClick={() => acrylicService("uninstall")}>
                                        <FontAwesomeIcon icon={faTimes} fixedWidth /> Uninstall
                                    </button>
                                </>
                            ) }
                        </div>

                        <div className="mb-3">
                            <p className="mb-0">
                                <strong>Status:</strong> &nbsp;
                                { serviceStatus == "installed" && (
                                    <> <FontAwesomeIcon icon={faCircle} className="text-success" fixedWidth /> Installed </>
                                )}
                                { serviceStatus == "uninstalled" && (
                                    <> <FontAwesomeIcon icon={faCircle} className="text-danger" fixedWidth /> Uninstalled </>
                                )}
                                { (serviceStatus == "installing" || serviceStatus == "uninstalling") && (
                                    <> <FontAwesomeIcon icon={faCircle} fixedWidth /> Waiting </>
                                )}
                            </p>
                        </div>
                    </div>
                </div>

                { serviceStatus == "installed" && (
                <div className="row mb-3">
                    <div className="col-12">
                        <h4>Server</h4>

                        <div className="mb-3 d-flex flex-row gap-2">
                            { serverStatus == "stopped" && (
                                <button className="btn btn-sm btn-success px-5" onClick={() => acrylicServer("start")}>
                                    <FontAwesomeIcon icon={faPlay} fixedWidth /> Start
                                </button>
                            ) }
                            { ( serverStatus == "starting" || serverStatus == "stopping" || serverStatus == "restarting") && (
                                <div className="spinner-border" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            ) }
                            { serverStatus == "running" && (
                                <>
                                    <button className="btn btn-sm btn-danger px-5" onClick={() => acrylicServer("stop")}>
                                        <FontAwesomeIcon icon={faStop} fixedWidth /> Stop
                                    </button>
                                    <button className="btn btn-sm btn-secondary px-5" onClick={() => acrylicServer("restart")}>
                                        <FontAwesomeIcon icon={faRotateRight} fixedWidth /> Restart
                                    </button>
                                </>
                            ) }
                        </div>

                        <div className="mb-3">
                            <p className="mb-0">
                                <strong>Status:</strong> &nbsp;
                                { serverStatus == "running" && (
                                    <> <FontAwesomeIcon icon={faCircle} className="text-success" fixedWidth /> Running </>
                                )}
                                { serverStatus == "stopped" && (
                                    <> <FontAwesomeIcon icon={faCircle} className="text-danger" fixedWidth /> Stopped </>
                                )}
                                { (serverStatus == "starting" || serverStatus == "stopping" || serverStatus == "restarting") && (
                                    <> <FontAwesomeIcon icon={faCircle} fixedWidth /> Waiting </>
                                )}
                            </p>
                            <p className="mb-0">
                                { serverStatus == "running" && (
                                    <><strong>Listening ports:</strong> { listeningPorts.join(", ") }</>
                                ) }
                            </p>
                            <p className="mb-0">
                                { serverStatus == "running" && (
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
                                    <Dropdown.Item className="text-uppercase small" onClick={() => onAcrylicSettingsClose("acrylic-server", "cache")}>Clean DNS cache</Dropdown.Item>
                                    <Dropdown.Item className="text-uppercase small" onClick={() => onAcrylicSettingsClose("acrylic-config", "acrylic")}>Open Acrylic config. File</Dropdown.Item>
                                    <Dropdown.Item className="text-uppercase small" onClick={() => onAcrylicSettingsClose("acrylic-config", "hosts")}>Open Acrylic hosts File</Dropdown.Item>
                                    <Dropdown.Item className="text-uppercase small" onClick={() => onAcrylicSettingsClose("acrylic-dns-set")}>Set system DNS to 127.0.0.1</Dropdown.Item>
                                    <Dropdown.Item className="text-uppercase small" onClick={() => onAcrylicSettingsClose("acrylic-dns-reset")}>Set system DNS to DHCP</Dropdown.Item>
                                    <Dropdown.Item className="text-uppercase small" onClick={() => onAcrylicSettingsClose("acrylic-config", "networks")}>Open Network Connections</Dropdown.Item>
                                    <Dropdown.Item className="text-uppercase small" onClick={() => onAcrylicSettingsClose("acrylic-dir")}>Open Acrylic directory</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </div>
                    </div>
                </div>
                ) }
            </div>

            <Modal show={showDnsDialog} onHide={closeDnsDialog} centered className="shadow border-0" backdrop="static" animation={true}>
                <Modal.Body>
                    <p>{ dnsStatusMessage }</p>
                </Modal.Body>
                <Modal.Footer className="border-0">
                    <button className="btn btn-outline-light btn-sm border-0" onClick={closeDnsDialog}>Ok</button>
                </Modal.Footer>
            </Modal>
        </>
    );
}
