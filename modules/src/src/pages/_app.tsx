import { ColorModeContextProvider } from '@/contexts/ColorModeContext'
import type { AppProps } from 'next/app'

declare global {
    interface Window {
        ipcRenderer: any;
    }
}

export default function App({ Component, pageProps }: AppProps) {
    return (
        <ColorModeContextProvider>
            <Component {...pageProps} />
        </ColorModeContextProvider>
    );
}
