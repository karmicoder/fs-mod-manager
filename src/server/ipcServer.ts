import {
  ImportPackageInfo,
  PackageInfo,
  PackageLocation
} from '@/types/packageInfo';
import {
  AvailableUpdate,
  UpdatePackageResult,
  UpdateProgress,
  UpdaterDef
} from '@/types/updater';
import { app, ipcMain, IpcMainEvent, BrowserWindow } from 'electron';

import { backupPackage } from './backup';
import { importPackages, parseImportFile, selectImportFile } from './import';
import log from './log';
import {
  findMsfsInstallPath,
  findPackages,
  deactivatePackage,
  activatePackage,
  verifySetup
} from './packages';
import { checkForPackageUpdates, getUpdaters, updatePackage } from './updater';
ipcMain.on('devtools', () => {
  log.debug('toggle devtools');
  const win = BrowserWindow.getFocusedWindow();
  if (win && win.webContents.isDevToolsOpened()) {
    win.webContents.closeDevTools();
  } else if (win) {
    win.webContents.openDevTools();
  }
});
ipcMain.handle('findMsfsInstallPath', findMsfsInstallPath);
ipcMain.handle('verifySetup', verifySetup);
ipcMain.handle('findPackages', (ev, location: PackageLocation) =>
  findPackages(location)
);
ipcMain.handle('deactivatePackage', (ev, pkgDirectory: string) =>
  deactivatePackage(pkgDirectory)
);
ipcMain.handle('activatePackage', (ev, pkgDirectory: string) =>
  activatePackage(pkgDirectory)
);
ipcMain.handle('backupPackage', (ev, pkg: PackageInfo) => backupPackage(pkg));

ipcMain.handle('selectImportFile', selectImportFile);
ipcMain.handle('parseImportFile', (ev, archivePath: string) =>
  parseImportFile(archivePath, (percent) => {
    ev.sender.send('unarchive_progress', percent);
  })
);
ipcMain.handle('importPackages', (ev, pkgs: ImportPackageInfo[]) =>
  importPackages(pkgs)
);
ipcMain.handle('getUpdaters', () => getUpdaters());
ipcMain.handle('checkForPackageUpdates', (ev, pkg: PackageInfo) =>
  checkForPackageUpdates(pkg)
);
ipcMain.handle(
  'updatePackage',
  (
    ev,
    pkg: PackageInfo,
    updater: UpdaterDef,
    availableUpdate: AvailableUpdate
  ): Promise<UpdatePackageResult> => {
    const progressHandler = (ev: IpcMainEvent, progress: UpdateProgress) => {
      ev.sender.send('update-progress', progress);
    };
    ipcMain.on('update-progress', progressHandler);
    return updatePackage(pkg, updater, availableUpdate).finally(() =>
      ipcMain.off('update-progress', progressHandler)
    );
  }
);
