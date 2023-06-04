import React from "react";
import { ColorModeContextProvider } from "../contexts/ColorModeContext";
import AppMain from "../components/AppMain";

function Home() {
  return (
    <ColorModeContextProvider>
        <React.Fragment>
          <AppMain />
        </React.Fragment>
    </ColorModeContextProvider>
  );
}

export default Home;
