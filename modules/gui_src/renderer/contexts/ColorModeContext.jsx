import { createContext, useState } from "react";

const ColorModeContext = createContext({
    colorMode: "light",
    setColorMode: (mode) => {}
});

const ColorModeContextProvider = (props) => {
    const [colorMode, setColorMode] = useState("light");

    return (
        <ColorModeContext.Provider value={{colorMode, setColorMode}}>
            { props.children }
        </ColorModeContext.Provider>
    );
}

export {
    ColorModeContext,
    ColorModeContextProvider
}