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
import { Modal } from "react-bootstrap";

export default function Home() {

    const [selectedMenu, setSelectedMenu] = useState<string>("web");
    const [currentPage, setCurrentPage] = useState<string>("web.apache");

    const [showDialog, setShowDialog] = useState(false);
    const [dialogText, setDialogText] = useState("");
    const [latestVersion, setLatestVersion] = useState("");
    const [updateCheckStatus, setUpdateCheckStatus] = useState("");
    const [checked, setChecked] = useState(false);
    const [releasePage, setReleasePage] = useState("");

    useEffect(() => {
        window.ipcRenderer.send("localhost-check-for-updates");

        window.ipcRenderer.on("localhost-status", (e: any, status: string) => {
            setUpdateCheckStatus(status);
        });

        window.ipcRenderer.on("localhost-available", (e: any, version: string, url: string = "") => {
            setLatestVersion(version);
            setReleasePage(url);
        });
    }, []);

    useEffect(() => {
        if(updateCheckStatus == "available" && latestVersion != "" && !checked){
            setDialogText(`There's a new version available to download: ${latestVersion}. Go to the Local.Host > About page to download the latest version.`);
            setShowDialog(true);
            setChecked(true);
        }
    }, [updateCheckStatus, latestVersion]);

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

    const closeDialog = () => {
        setShowDialog(false);
    };

    const openReleasePage = () => {
        window.ipcRenderer.send("localhost-open-release-page", releasePage);
    };

    return (
        <>
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

            <Modal show={showDialog} onHide={closeDialog} centered className="shadow border-0" backdrop="static" animation={true}>
                <Modal.Body>
                    <p>{ dialogText }</p>
                </Modal.Body>
                <Modal.Footer className="border-0">
                    <button className="btn btn-outline-light btn-sm border-0" onClick={openReleasePage}>View release info</button>
                    <button className="btn btn-outline-light btn-sm border-0" onClick={closeDialog}>Ok</button>
                </Modal.Footer>
            </Modal>
        </>
    );
}
