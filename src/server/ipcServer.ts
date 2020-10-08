import {
  ImportPackageInfo,
  PackageInfo,
  PackageLocation
} from '@/types/packageInfo';
import { ipcMain } from 'electron';

import { backupPackage } from './backup';
import { importPackages, parseImportFile, selectImportFile } from './import';
import {
  findMsfsInstallPath,
  findPackages,
  deactivatePackage,
  activatePackage,
  verifySetup
} from './packages';
import { checkForPackageUpdates, getUpdaters } from './updater';

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
