import { ISettings } from "@/interfaces/ISettings";
import { useEffect, useState } from "react";

export default function Settings()
{
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

        window.ipcRenderer.on("localhost-settings", (e: any, settings: ISettings) => {
            setSettings(settings);
        });
    }, []);

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
            <div className="row">
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
        </div>
    );
}
