import { autoUpdater, UpdateInfo } from 'electron-updater';
import { BrowserWindow, dialog } from 'electron';

const UPDATE_CHECK_INTERVAL = 4 * 60 * 60 * 1000; // 4 hours

export function initAutoUpdater(mainWindow: BrowserWindow) {
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('update-available', (info: UpdateInfo) => {
    dialog
      .showMessageBox(mainWindow, {
        type: 'info',
        title: 'Update Available',
        message: `Siza v${info.version} is available. Download now?`,
        buttons: ['Download', 'Later'],
      })
      .then(({ response }) => {
        if (response === 0) {
          autoUpdater.downloadUpdate();
        }
      });
  });

  autoUpdater.on('update-downloaded', () => {
    dialog
      .showMessageBox(mainWindow, {
        type: 'info',
        title: 'Update Ready',
        message: 'Update downloaded. Restart to install?',
        buttons: ['Restart', 'Later'],
      })
      .then(({ response }) => {
        if (response === 0) {
          autoUpdater.quitAndInstall();
        }
      });
  });

  autoUpdater.on('error', (err: Error) => {
    console.error('Auto-update error:', err);
  });

  autoUpdater.checkForUpdates().catch(() => {});

  setInterval(() => {
    autoUpdater.checkForUpdates().catch(() => {});
  }, UPDATE_CHECK_INTERVAL);
}
