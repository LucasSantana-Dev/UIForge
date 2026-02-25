import { app, BrowserWindow, shell } from 'electron';
import { join } from 'path';
import { startMcpServer, stopMcpServer } from './mcp-server';
import { registerIpcHandlers } from './ipc-handlers';
import { createNativeMenu } from './native-menu';
import { createTray, destroyTray } from './tray';
import { initAutoUpdater } from './auto-updater';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'Siza',
    backgroundColor: '#0a0a0f',
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: join(__dirname, '..', 'preload', 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(
      join(__dirname, '..', 'renderer', 'index.html')
    );
  }

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.webContents.on('will-navigate', (event, url) => {
    const devUrl = process.env.VITE_DEV_SERVER_URL || '';
    if (devUrl && url.startsWith(devUrl)) return;
    if (url.startsWith('file://')) return;
    event.preventDefault();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  registerIpcHandlers(mainWindow);
  createNativeMenu(mainWindow);
  createTray(mainWindow);
}

app.whenReady().then(async () => {
  createWindow();

  try {
    await startMcpServer();
  } catch (err) {
    console.error('Failed to start MCP server:', err);
  }

  if (mainWindow && app.isPackaged) {
    initAutoUpdater(mainWindow);
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', async () => {
  destroyTray();
  await stopMcpServer();
});
