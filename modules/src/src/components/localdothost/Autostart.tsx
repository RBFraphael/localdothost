import { ISettings } from "@/interfaces/ISettings";
import { useEffect, useState } from "react";

export default function Autostart()
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

    const toggle = (service:"apache"|"nginx"|"mariadb"|"mongodb"|"postgres"|"redis") => {
        let newSettings = {
            ...settings,
            autostart: {
                ...settings.autostart,
                [service]: !settings.autostart[service]
            }
        };

        setSettings(newSettings);
        window.ipcRenderer.send("localhost-settings", newSettings);
    }

    return (
        <div className="container-fluid">
            <div className="row mb-3">
                <div className="col-12">
                    <h2>Autostart</h2>
                </div>
            </div>
            <div className="row">
                <div className="col-12">
                    <div className="mb-4">
                        <h4>Web Server</h4>
                        <div className="form-check form-switch mb-2">
                            <input type="checkbox" name="autostartApache" id="autostartApache" className="form-check-input" checked={settings.autostart.apache} onChange={(e) => toggle("apache")} />
                            <label htmlFor="autostartApache" className="form-check-label">Apache Web Server</label>
                        </div>
                        <div className="form-check form-switch mb-2">
                            <input type="checkbox" name="autostartNginx" id="autostartNginx" className="form-check-input" checked={settings.autostart.nginx} onChange={(e) => toggle("nginx")} />
                            <label htmlFor="autostartNginx" className="form-check-label">Nginx Web Server</label>
                        </div>
                    </div>

                    <div className="mb-4">
                        <h4>Database</h4>
                        <div className="form-check form-switch mb-2">
                            <input type="checkbox" name="autostartMariaDB" id="autostartMariaDB" className="form-check-input" checked={settings.autostart.mariadb} onChange={(e) => toggle("mariadb")} />
                            <label htmlFor="autostartMariaDB" className="form-check-label">MariaDB Database</label>
                        </div>
                        <div className="form-check form-switch mb-2">
                            <input type="checkbox" name="autostartMongoDB" id="autostartMongoDB" className="form-check-input" checked={settings.autostart.mongodb} onChange={(e) => toggle("mongodb")} />
                            <label htmlFor="autostartMongoDB" className="form-check-label">MongoDB Database</label>
                        </div>
                        <div className="form-check form-switch mb-2">
                            <input type="checkbox" name="autostartPostgreSQL" id="autostartPostgreSQL" className="form-check-input" checked={settings.autostart.postgres} onChange={(e) => toggle("postgres")} />
                            <label htmlFor="autostartPostgreSQL" className="form-check-label">PostgreSQL Database</label>
                        </div>
                        <div className="form-check form-switch mb-2">
                            <input type="checkbox" name="autostartRedis" id="autostartRedis" className="form-check-input" checked={settings.autostart.redis} onChange={(e) => toggle("redis")} />
                            <label htmlFor="autostartRedis" className="form-check-label">Redis Database</label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
