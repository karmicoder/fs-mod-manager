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
  deactivatePackage
} from './packages';

ipcMain.handle('findMsfsInstallPath', findMsfsInstallPath);
ipcMain.handle('findPackages', (ev, location: PackageLocation) =>
  findPackages(location)
);
ipcMain.handle('deactivatePackage', (ev, pkgDirectory: string) =>
  deactivatePackage(pkgDirectory)
);
ipcMain.handle('backupPackage', (ev, pkg: PackageInfo) => backupPackage(pkg));

ipcMain.handle('selectImportFile', selectImportFile);
ipcMain.handle('parseImportFile', (ev, archivePath: string) =>
  parseImportFile(archivePath)
);
ipcMain.handle('importPackages', (ev, pkgs: ImportPackageInfo[]) =>
  importPackages(pkgs)
);
