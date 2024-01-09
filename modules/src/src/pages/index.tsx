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
import { Code, Dns as DnsIcon, Language, Storage, Terminal, Settings as SettingsIcon, Info, Memory, Web } from "@mui/icons-material";
import { Box, Button, CssBaseline, Tab, Tabs, ThemeProvider, createTheme } from "@mui/material";
import Head from "next/head";
import { useContext, useEffect, useState } from "react";

declare module '@mui/material/styles' {
    interface Palette {
      white: Palette['primary'];
    }
  
    interface PaletteOptions {
      white?: PaletteOptions['primary'];
    }
  }

declare module '@mui/material/Button' {
    interface ButtonPropsColorOverrides {
      white: true;
    }
}

export default function Home() {

    const [currentTab, setCurrentTab] = useState<number>(0);
    const { colorMode } = useContext(ColorModeContext);
    const [uiMode, setUiMode] = useState<"modern"|"legacy">("modern");

    const darkTheme = createTheme({
        palette: {
            mode: "dark",
            white: {
                main: '#FFFFFF',
                light: '#FFFFFF',
                dark: '#FFFFFF',
                contrastText: '#2F3640',
            },
        }
    });

    const lightTheme = createTheme({
        palette: {
            mode: "light",
            white: {
                main: '#FFFFFF',
                light: '#FFFFFF',
                dark: '#FFFFFF',
                contrastText: '#2F3640',
            },
        }
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
                { uiMode == "modern" ? (
                    <Box className="panel">
                        <Box className="navbar">
                            <Box className="inner">
                                <Button variant={ currentTab == 0 ? "contained" : "outlined" } color="white" size="small" onClick={() => setCurrentTab(0)}>
                                    <Language fontSize="small" />
                                    <span>Web</span>
                                </Button>
                                <Button variant={ currentTab == 1 ? "contained" : "outlined" } color="white" size="small" onClick={() => setCurrentTab(1)}>
                                    <Storage fontSize="small" />
                                    <span>Database</span>
                                </Button>
                                <Button variant={ currentTab == 2 ? "contained" : "outlined" } color="white" size="small" onClick={() => setCurrentTab(2)}>
                                    <Memory fontSize="small" />
                                    <span>Redis</span>
                                </Button>
                                <Button variant={ currentTab == 3 ? "contained" : "outlined" } color="white" size="small" onClick={() => setCurrentTab(3)}>
                                    <Storage fontSize="small" />
                                    <span>MongoDB</span>
                                </Button>
                                <Button variant={ currentTab == 4 ? "contained" : "outlined" } color="white" size="small" onClick={() => setCurrentTab(4)}>
                                    <DnsIcon fontSize="small" />
                                    <span>DNS</span>
                                </Button>
                                <Button variant={ currentTab == 5 ? "contained" : "outlined" } color="white" size="small" onClick={() => setCurrentTab(5)}>
                                    <Code fontSize="small" />
                                    <span>Node</span>
                                </Button>
                                <Button variant={ currentTab == 6 ? "contained" : "outlined" } color="white" size="small" onClick={() => setCurrentTab(6)}>
                                    <Terminal fontSize="small" />
                                    <span>CLI</span>
                                </Button>
                                <Button variant={ currentTab == 7 ? "contained" : "outlined" } color="white" size="small" onClick={() => setCurrentTab(7)}>
                                    <SettingsIcon fontSize="small" />
                                    <span>Settings</span>
                                </Button>
                                <Button variant={ currentTab == 8 ? "contained" : "outlined" } color="white" size="small" onClick={() => setCurrentTab(8)}>
                                    <Info fontSize="small" />
                                    <span>About</span>
                                </Button>
                            </Box>
                        </Box>
                        <Box className="content-wrapper">
                            { currentTab == 0 && <WebServer /> }
                            { currentTab == 1 && <Database /> }
                            { currentTab == 2 && <Redis /> }
                            { currentTab == 3 && <MongoDb /> }
                            { currentTab == 4 && <Dns /> }
                            { currentTab == 5 && <Nvm /> }
                            { currentTab == 6 && <Extras /> }
                            { currentTab == 7 && <Settings /> }
                            { currentTab == 8 && <About /> }
                        </Box>
                    </Box>
                ) : (
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
                ) }
            </main>
        </ThemeProvider>
    )
}
