import { app } from 'electron';
import serve from 'electron-serve';
import { createWindow } from './helpers';
import { declareApacheIpcEvents, declareApacheCallbackEvents } from "./libs/apache-js";
import { declareMariaDbIpcEvents, declareMariaDbCallbackEvents } from "./libs/mariadb-js";
import { join } from "path";
import { declareAcrylicCallbackEvents, declareAcrylicIpcEvents } from './libs/acrylic-js';

const isProd = process.env.NODE_ENV === 'production';

if (isProd) {
  serve({ directory: 'app' });
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`);
}

(async () => {
  await app.whenReady();

  const mainWindow = createWindow('Local.Host Admin Panel', {
    width: 640,
    height: 560,
    resizable: false
  });

  declareApacheIpcEvents();
  declareApacheCallbackEvents(mainWindow);

  declareMariaDbIpcEvents();
  declareMariaDbCallbackEvents(mainWindow);

  declareAcrylicIpcEvents();
  declareAcrylicCallbackEvents(mainWindow);
  
  mainWindow.setMenu(null);

  if (isProd) {
    await mainWindow.loadURL('app://./home.html');
  } else {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}/home`);
    // mainWindow.webContents.openDevTools();
  }
})();

app.on('window-all-closed', () => {
  app.quit();
});
