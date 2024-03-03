import { ISettings } from "@/interfaces/ISettings";
import { faCircle, faDownload, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";

export default function Settings()
{
    const [contextMenu, setContextMenu] = useState<string>("removed");

    const [settings, setSettings] = useState<ISettings>({
        autostart: {
            apache: false, nginx: false, mariadb: false,
            mongodb: false, redis: false, postgres: false,
        },
        theme: "dark", closeToTray: false, startOnBoot: false,
        minimizeToTray: false, startMinimized: false,
    });

    useEffect(() => {
        window.ipcRenderer.send("localhost-boot");
        window.ipcRenderer.send("localhost-context-menu-status");

        window.ipcRenderer.on("localhost-context-menu", (e: any, status: string) => {
            setContextMenu(status);
        });

        window.ipcRenderer.on("localhost-settings", (e: any, settings: ISettings) => {
            setSettings(settings);
        });
    }, []);

    const addContextMenu = () => {
        window.ipcRenderer.send("localhost-context-menu", "add");
    }

    const removeContextMenu = () => {
        window.ipcRenderer.send("localhost-context-menu", "remove");
    }

    const toggle = (setting:"closeToTray"|"startOnBoot"|"minimizeToTray"|"startMinimized") => {
        let newSettings = {
            ...settings,
            [setting]: !settings[setting]
        };

        setSettings(newSettings);
        window.ipcRenderer.send("localhost-settings", newSettings);
    }

    return (
        <div className="container-fluid">
            <div className="row mb-3">
                <div className="col-12">
                    <h2>Settings</h2>
                </div>
            </div>
            <div className="row mb-3">
                <div className="col-12">
                    <div className="form-check form-switch mb-2">
                        <input type="checkbox" name="startOnBoot" id="startOnBoot" className="form-check-input" checked={settings.startOnBoot} onChange={(e) => toggle("startOnBoot")} />
                        <label htmlFor="startOnBoot" className="form-check-label">Start on Windows boot</label>
                    </div>
                    <div className="form-check form-switch mb-2">
                        <input type="checkbox" name="startMinimized" id="startMinimized" className="form-check-input" checked={settings.startMinimized} onChange={(e) => toggle("startMinimized")} />
                        <label htmlFor="startMinimized" className="form-check-label">Start minimized (on tray)</label>
                    </div>
                    <div className="form-check form-switch mb-2">
                        <input type="checkbox" name="minimizeToTray" id="minimizeToTray" className="form-check-input" checked={settings.minimizeToTray} onChange={(e) => toggle("minimizeToTray")} />
                        <label htmlFor="minimizeToTray" className="form-check-label">Minimize to Tray</label>
                    </div>
                    <div className="form-check form-switch mb-2">
                        <input type="checkbox" name="closeMinimizes" id="closeMinimizes" className="form-check-input" checked={settings.closeToTray} onChange={(e) => toggle("closeToTray")} />
                        <label htmlFor="closeMinimizes" className="form-check-label">Close minimizes</label>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-12">
                    <h4>Local.Host Symbolic Link Shortcut</h4>
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
                            <FontAwesomeIcon icon={faTimes} fixedWidth /> Remove Context Menu Shortcut
                        </button>
                    ) }
                    { contextMenu == "removed" && (
                        <button className="btn btn-sm btn-success px-5" onClick={addContextMenu}>
                            <FontAwesomeIcon icon={faDownload} fixedWidth /> Add Context Menu Shortcut
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
