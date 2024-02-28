import { INvmVersion } from "@/interfaces/INvmVersion";
import { faCircle, faDownload, faTimes, faTrash, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";

export default function NodeJS()
{
    const [status, setStatus] = useState("uninstalled");

    const [installingVersion, setInstallingVersion] = useState<string|null>(null);
    const [uninstallingVersion, setUninstallingVersion] = useState<string|null>(null);

    const [availableVersions, setAvailableVersions] = useState<string[]>([]);
    const [installedVersions, setInstalledVersions] = useState<string[]>([]);
    const [currentVersion, setCurrentVersion] = useState<string|null>(null);

    const filterInstalledVersions = (release: INvmVersion) => {
        let normalizedVersion = release.version.replace(/[^\d.]/, "");
        return installedVersions.indexOf(normalizedVersion) == -1;
    };

    const nvm = (action: string) => {
        window.ipcRenderer.send("nvm", action);
    };

    const onNvmSettingsClose = (option: string|null = null, action: string|null = null) => {
        if(option !== null){
            window.ipcRenderer.send(option, action);
        }
    };

    const onInstallVersion = (version: string) => {
        version = version.replace(/[^\d.]/, "");
        setInstallingVersion(version);
        window.ipcRenderer.send("nvm-install", version);
    };

    const onUninstallVersion = (version: string) => {
        version = version.replace(/[^\d.]/, "");
        setUninstallingVersion(version);
        window.ipcRenderer.send("nvm-uninstall", version);
    };

    const onUseVersion = (version: string|null) => {
        version = version ? version.replace(/[^\d.]/, "") : null;
        window.ipcRenderer.send("nvm-use", version);
    };

    const isInstallingVersion = (version: string) => {
        if(installingVersion !== null){
            version = version.replace(/[^\d.]/, "");
            let workingVersion = installingVersion.replace(/[^\d.]/, "");
            return version == workingVersion;
        }

        return false;
    };

    const isUninstallingVersion = (version: string) => {
        if(uninstallingVersion !== null){
            version = version.replace(/[^\d.]/, "");
            let workingVersion = uninstallingVersion.replace(/[^\d.]/, "");
            return version == workingVersion;
        }

        return false;
    }

    useEffect(() => {
        window.ipcRenderer.send("nvm-status");

        window.ipcRenderer.on("nvm-status", (e: string, status: string) => {
            setStatus(status);
        });

        window.ipcRenderer.on("nvm-available", (e: string, versions: string[]) => {
            setAvailableVersions(versions ?? []);
            setInstallingVersion(null);
        });

        window.ipcRenderer.on("nvm-installed", (e: string, versions: string[]) => {
            setInstalledVersions(versions ?? []);
            setUninstallingVersion(null);
        });

        window.ipcRenderer.on("nvm-current", (e: string, version: string|null) => {
            version = version ? version.replace(/[^\d.]/, "") : null;
            setCurrentVersion(version);
        });
    }, []);

    useEffect(() => {
        console.log(currentVersion);
    }, [currentVersion]);

    return (
        <div className="container-fluid">
            <div className="row mb-3">
                <div className="col-12">
                    <h2>NodeJS</h2>
                </div>
            </div>
            
            <div className="row mb-3">
                <div className="col-12">
                    <h4>Node Version Manager (NVM)</h4>

                    <div className="mb-3 d-flex flex-row gap-2">
                        { status == "uninstalled" && (
                            <button className="btn btn-sm btn-success px-5" onClick={() => nvm("install")}>
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
                                <button className="btn btn-sm btn-danger px-5" onClick={() => nvm("uninstall")}>
                                    <FontAwesomeIcon icon={faTimes} fixedWidth /> Uninstall
                                </button>
                            </>
                        ) }
                    </div>

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
                </div>
            </div>

            { status == "installed" && (
            <div className="row">
                <div className="col-4">
                    <div className="card shadow">
                        <div className="card-body">
                            <h5 className="card-title">Available versions</h5>
                            <ul className="list-group list-group-flush" style={{maxHeight: "200px", overflowY: "auto"}}>
                                { Object.entries(availableVersions).map((entry: any, index: number) => {
                                    let version = entry[1];
                                    return (
                                        <>
                                            <li key={index} className="list-group-item list-group-item-light px-1 py-0 fw-bold">{ version.version }{ version.lts ? ` - LTS ${version.lts}` : "" }</li>
                                            { version.releases.filter(filterInstalledVersions).slice(0, 5).map((release: any, key: number) => (
                                                <li key={`${index}_${key}`} className="list-group-item d-flex justify-content-between px-1 py-0">
                                                    {release.version}
                                                    <button className="btn btn-outline-light border-0 btn-sm px-1 py-0" disabled={installingVersion !== null} onClick={() => onInstallVersion(release.version)}>
                                                        { isInstallingVersion(release.version) ? (
                                                            <span className="spinner-border spinner-border-sm" role="status"></span>
                                                        ) : (
                                                            <FontAwesomeIcon icon={faDownload} fixedWidth />
                                                        ) }
                                                    </button>
                                                </li>
                                            )) }
                                        </>
                                    );
                                }) }
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="col-4">
                    <div className="card shadow">
                        <div className="card-body">
                            <h5 className="card-title">Installed versions</h5>
                            <ul className="list-group list-group-flush" style={{maxHeight: "200px", overflowY: "auto"}}>
                                { installedVersions.map((version: string, index: number) => (
                                    <li className="list-group-item d-flex justify-content-between px-1 py-0" key={index}>
                                        v{ version }
                                        <button className="btn btn-outline-light border-0 btn-sm px-1 py-0" disabled={uninstallingVersion !== null} onClick={() => onUninstallVersion(version)}>
                                            { isUninstallingVersion(version) ? (
                                                <span className="spinner-border spinner-border-sm" role="status"></span>
                                            ) : (
                                                <FontAwesomeIcon icon={faTrashAlt} fixedWidth />
                                            )}
                                        </button>
                                    </li>
                                )) }
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="col-4">
                    <div className="form-floating">
                        <select className="form-select" id="nvm-current" value={currentVersion ?? ""} onChange={(e) => onUseVersion(e.target.value)}>
                            <option value="" hidden>Select Node version</option>
                            { installedVersions.map((version: string, index: number) => (
                                <option value={version} key={index}>v{ version }</option>
                            )) }
                        </select>
                        <label htmlFor="nvm-current">Current active version</label>
                    </div>
                </div>
            </div>
            ) }
        </div>
    );
}