import { ipcMain } from 'electron';
import {
  ImportPackageInfo,
  PackageInfo,
  PackageLocation
} from '@/data/packageInfo';
import { backupPackage } from './backup';
import { importPackages, parseImportFile, selectImportFile } from './import';
import { findMsfsInstallPath, findPackages } from './packages';

ipcMain.handle('findMsfsInstallPath', findMsfsInstallPath);
ipcMain.handle('findPackages', (ev, location: PackageLocation) =>
  findPackages(location)
);

ipcMain.handle('backupPackage', (ev, pkg: PackageInfo) => backupPackage(pkg));

ipcMain.handle('selectImportFile', selectImportFile);
ipcMain.handle('parseImportFile', (ev, archivePath: string) =>
  parseImportFile(archivePath)
);
ipcMain.handle('importPackages', (ev, pkgs: ImportPackageInfo[]) =>
  importPackages(pkgs)
);
