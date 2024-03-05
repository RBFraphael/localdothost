import { ISettings } from "@/interfaces/ISettings";
import { faCircle, faCog, faPlay, faSquareUpRight, faStop } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { Dropdown } from "react-bootstrap";

export default function Redis()
{
    const [status, setStatus] = useState("stopped");
    const [listeningPorts, setListeningPorts] = useState<string[]>([]);
    const [pids, setPids] = useState<string[]>([]);

    const startRedis = () => {
        window.ipcRenderer.send("redis", "start");
    }

    const stopRedis = () => {
        window.ipcRenderer.send("redis", "stop");
    }

    const openRedisGui = () => {
        window.ipcRenderer.send("redis", "open");
    };

    const onRedisSettingsClose = (option: string|null = null, action: string|null = null) => {
        if(option !== null && action !== null){
            window.ipcRenderer.send(option, action);
        }
    }

    useEffect(() => {
        window.ipcRenderer.on("localhost-init", (e: any, settings: ISettings) => {
            window.ipcRenderer.send("redis-boot", settings.autostart.redis);
        });

        window.ipcRenderer.on("redis-status", (e: any, status: string) => {
            setStatus(status);
        });
        window.ipcRenderer.on("redis-ports", (e: any, ports: string[]) => {
            setListeningPorts(ports);
        });
        window.ipcRenderer.on("redis-pids", (e: any, pids: string[]) => {
            setPids(pids);
        });
    }, []);

    return (
        <div className="container-fluid">
            <div className="row mb-3">
                <div className="col-12">
                    <h2>Redis Database</h2>
                </div>
            </div>
            <div className="row">
                <div className="col-12">
                    <div className="mb-3 d-flex flex-row gap-2">
                        { status == "stopped" && (
                            <button className="btn btn-sm btn-success px-5" onClick={startRedis}>
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
                                <button className="btn btn-sm btn-danger px-5" onClick={stopRedis}>
                                    <FontAwesomeIcon icon={faStop} fixedWidth /> Stop
                                </button>
                                <button className="btn btn-sm btn-primary px-5" onClick={openRedisGui}>
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
                                <Dropdown.Item className="text-uppercase small" onClick={() => onRedisSettingsClose("redis-config", "")}>Redis config &lt;redis.cnf&gt;</Dropdown.Item>
                                <Dropdown.Item className="text-uppercase small" onClick={() => onRedisSettingsClose("redis-dir", "")}>Open Redis directory</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                </div>
            </div>
        </div>
    );
}
