import About from "@/components/About";
import Database from "@/components/Database";
import Dns from "@/components/Dns";
import Extras from "@/components/Extras";
import MongoDb from "@/components/MongoDb";
import Nvm from "@/components/Nvm";
import Redis from "@/components/Redis";
import Settings from "@/components/Settings";
import TabPanel from "@/components/TabPanel";
import WebServer from "@/components/WebServer";
import { ColorModeContext } from "@/contexts/ColorModeContext";
import { Box, CssBaseline, Tab, Tabs, ThemeProvider, createTheme } from "@mui/material";
import Head from "next/head";
import { useContext, useEffect, useState } from "react";

export default function Home() {

    const [currentTab, setCurrentTab] = useState<number>(0);
    const { colorMode } = useContext(ColorModeContext);

    const darkTheme = createTheme({
        palette: { mode: "dark" }
    });

    const lightTheme = createTheme({
        palette: { mode: "light" }
    });

    useEffect(() => {
        window.ipcRenderer.on("tab", (e: any, tab: string) => {
            switch(tab){
                case "web":
                    setCurrentTab(0);
                    break;
                case "database":
                    setCurrentTab(1);
                    break;
                case "redis":
                    setCurrentTab(2);
                    break;
                case "mongodb":
                    setCurrentTab(3);
                    break;
                case "dns":
                    setCurrentTab(4);
                    break;
                case "node":
                    setCurrentTab(5);
                    break;
                case "cli":
                    setCurrentTab(6);
                    break;
                case "settings":
                    setCurrentTab(7);
                    break;
                case "about":
                    setCurrentTab(8);
                    break;
            }
        })
    }, []);

    return (
        <ThemeProvider theme={colorMode == "dark" ? darkTheme : lightTheme}>
            <CssBaseline />

            <Head>
                <title>Local.Host Admin Panel</title>
            </Head>

            <main>
                <Box sx={{ width: "100%" }} >
                    <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                        <Tabs value={currentTab} onChange={(e, tab) => setCurrentTab(tab)} aria-label="Tabs">
                            <Tab label="Web" />
                            <Tab label="Database" />
                            <Tab label="Redis" />
                            <Tab label="MongoDB" />
                            <Tab label="DNS" />
                            <Tab label="Node" />
                            <Tab label="CLI" />
                            <Tab label="Settings" />
                            <Tab label="About" />
                        </Tabs>
                    </Box>

                    <TabPanel value={currentTab} index={0}>
                        <WebServer />
                    </TabPanel>

                    <TabPanel value={currentTab} index={1}>
                        <Database />
                    </TabPanel>

                    <TabPanel value={currentTab} index={2}>
                        <Redis />
                    </TabPanel>

                    <TabPanel value={currentTab} index={3}>
                        <MongoDb />
                    </TabPanel>

                    <TabPanel value={currentTab} index={4}>
                        <Dns />
                    </TabPanel>

                    <TabPanel value={currentTab} index={5}>
                        <Nvm />
                    </TabPanel>

                    <TabPanel value={currentTab} index={6}>
                        <Extras />
                    </TabPanel>

                    <TabPanel value={currentTab} index={7}>
                        <Settings />
                    </TabPanel>

                    <TabPanel value={currentTab} index={8}>
                        <About />
                    </TabPanel>
                </Box>
            </main>
        </ThemeProvider>
    )
}
