import { createContext, useState } from "react";

const ColorModeContext = createContext({
    colorMode: "light",
    setColorMode: (mode: "light"|"dark") => {}
});

const ColorModeContextProvider = (props: any) => {
    const [colorMode, setColorMode] = useState<"light"|"dark">("light");

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