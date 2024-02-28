import Dropdown from "@/components/Dropdown";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGlobe } from "@fortawesome/free-solid-svg-icons";
import Apache from "@/components/webserver/Apache";
import MariaDB from "@/components/database/MariaDB";
import MongoDB from "@/components/database/MongoDB";
import AcrylicDNS from "@/components/system/AcrylicDNS";
import Redis from "@/components/database/Redis";
import CliTools from "@/components/system/CliTools";
import NodeJS from "@/components/nodejs/NodeJS";
import Git from "@/components/system/Git";
import Recommended from "@/components/system/Recommended";
import PostgreSQL from "@/components/database/PostgreSQL";
import About from "@/components/localdothost/About";
import Autostart from "@/components/localdothost/Autostart";
import Settings from "@/components/localdothost/Settings";
import Nginx from "@/components/webserver/Nginx";

export default function Home() {

    const [selectedMenu, setSelectedMenu] = useState<string>("web");
    const [currentPage, setCurrentPage] = useState<string>("web.apache");

    useEffect(() => {
        let menu = currentPage.split(".")[0];
        setSelectedMenu(menu);

        window.ipcRenderer.on("tab", (e: any, tab: string) => {
            setCurrentPage(tab);
        });
    }, [currentPage]);

    let webServerOptions = [
        { label: "Apache", value: "web.apache" },
        { label: "NGINX", value: "web.nginx" },
    ];

    let databaseOptions = [
        { label: "MariaDB", value: "database.mariadb" },
        { label: "MongoDB", value: "database.mongodb" },
        { label: "PostgreSQL", value: "database.postgresql" },
        { label: "Redis", value: "database.redis" },
    ];

    let systemOptions = [
        { label: "Command-line Tools", value: "system.cli" },
        { label: "DNS", value: "system.dns" },
        { label: "Git", value: "system.git" },
        // { label: "Recommended Apps", value: "system.recommended" },
    ];

    let localHostOptions = [
        { label: "About", value: "localhost.about" },
        { label: "Autostart", value: "localhost.autostart" },
        { label: "Settings", value: "localhost.settings" },
    ];

    let onMenuSelect = (option: string) => {
        setCurrentPage(option);
    };

    return (
        <div className="home">
            <header className="container-fluid mb-4">
                <div className="row">
                    <div className="col-12 p-2">
                        <div className="d-flex flex-row align-items-center gap-3">
                            <div className="text-center">
                                <FontAwesomeIcon icon={faGlobe} size="lg" fixedWidth />
                            </div>
                            <Dropdown label="Web Server" options={webServerOptions} onSelect={onMenuSelect} active={selectedMenu == "web"} current={currentPage} style="outline-light" />
                            <Dropdown label="Database" options={databaseOptions} onSelect={onMenuSelect} active={selectedMenu == "database"} current={currentPage} style="outline-light" />
                            <button className={`btn btn-sm text-uppercase btn-outline-light border-0 ${selectedMenu == "nodejs" ? "active" : ""}`} onClick={() => onMenuSelect("nodejs")}>NodeJS</button>
                            <Dropdown label="System" options={systemOptions} onSelect={onMenuSelect} active={selectedMenu == "system"} current={currentPage} style="outline-light" />
                            <Dropdown label="Local.Host" options={localHostOptions} onSelect={onMenuSelect} active={selectedMenu == "localhost"} current={currentPage} style="outline-light" />
                        </div>
                    </div>
                </div>
            </header>

            <main>
                { currentPage == "web.apache" && ( <Apache /> ) }
                { currentPage == "web.nginx" && ( <Nginx /> ) }

                { currentPage == "database.mariadb" && ( <MariaDB /> ) }
                { currentPage == "database.mongodb" && ( <MongoDB /> ) }
                { currentPage == "database.postgresql" && ( <PostgreSQL /> ) }
                { currentPage == "database.redis" && ( <Redis /> ) }

                { currentPage == "system.cli" && ( <CliTools /> ) }
                { currentPage == "system.dns" && ( <AcrylicDNS /> ) }
                { currentPage == "system.git" && ( <Git /> ) }
                { currentPage == "system.recommended" && ( <Recommended /> ) }

                { currentPage == "nodejs" && ( <NodeJS /> ) }

                { currentPage == "localhost.about" && ( <About /> ) }
                { currentPage == "localhost.autostart" && ( <Autostart /> ) }
                { currentPage == "localhost.settings" && ( <Settings /> ) }
            </main>
        </div>
    );
}
