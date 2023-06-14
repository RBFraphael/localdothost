import React, { useContext, useState } from "react";
import Head from "next/head";
import { Box, CssBaseline, Tab, Tabs, ThemeProvider, Typography, createTheme } from "@mui/material";
import TabPanel from "./TabPanel";
import ApacheSettings from "./ApacheSettings";
import MariaDbSettings from "./MariaDbSettings";
import AppSettings from "./AppSettings";
import { ColorModeContext } from "../contexts/ColorModeContext";
import AcrylicSettings from "./AcrylicSettings";
import AppHelp from "./AppHelp";
import AppAbout from "./AppAbout";
import MongoDbSettings from "./MongoDbSettings";
import NvmSettings from "./NvmSettings";
import ExtrasSettings from "./ExtrasSettings";

export default function AppMain()
{
    const [currentTab, setCurrentTab] = useState(0);

    const {colorMode} = useContext(ColorModeContext);

    const darkTheme = createTheme({
        palette: {
            mode: "dark",
        },
    });

    const lightTheme = createTheme({
        palette: {
            mode: "light",
        },
    });

    return (
        <>
        <ThemeProvider theme={colorMode == "dark" ? darkTheme : lightTheme}>
            <CssBaseline />
            <Head>
                <title>Local.Host Admin Panel</title>
            </Head>
            <main>
                <Box sx={{width: "100%"}}>
                    <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                        <Tabs value={currentTab} onChange={(e, tab) => setCurrentTab(tab)} aria-label="Tabs">
                            <Tab label="Web" />
                            <Tab label="SQL Database" />
                            <Tab label="noSQL Database" />
                            <Tab label="DNS" />
                            <Tab label="NodeJS" />
                            <Tab label="Extras" />
                            <Tab label="Help" />
                            <Tab label="Settings" />
                            <Tab label="About" />
                        </Tabs>
                    </Box>
                    <TabPanel value={currentTab} index={0}>
                        <ApacheSettings />
                    </TabPanel>
                    <TabPanel value={currentTab} index={1}>
                        <MariaDbSettings />
                    </TabPanel>
                    <TabPanel value={currentTab} index={2}>
                        <MongoDbSettings />
                    </TabPanel>
                    <TabPanel value={currentTab} index={3}>
                        <AcrylicSettings />
                    </TabPanel>
                    <TabPanel value={currentTab} index={4}>
                        <NvmSettings />
                    </TabPanel>
                    <TabPanel value={currentTab} index={5}>
                        <ExtrasSettings />
                    </TabPanel>
                    <TabPanel value={currentTab} index={6}>
                        <AppHelp />
                    </TabPanel>
                    <TabPanel value={currentTab} index={7}>
                        <AppSettings />
                    </TabPanel>
                    <TabPanel value={currentTab} index={8}>
                        <AppAbout />
                    </TabPanel>
                </Box>
            </main>
        </ThemeProvider>
        </>
    )
}