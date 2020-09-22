import { existsSync, promises as fs } from 'fs';
import * as path from 'path';
import { app, ipcMain } from 'electron';
import { PackageInfo, PackageLocation } from '@/data/packageInfo';
import { backupPackage } from './backup';
const localDataPath = path.join(process.env.LOCALAPPDATA as string, app.name);

const possibleInstallPaths = [
  process.env.LOCALAPPDATA +
    '\\Packages\\Microsoft.FlightSimulator_8wekyb3d8bbwe',
  process.env.LOCALAPPDATA +
    '\\Packages\\Microsoft.FlightDashboard_8wekyb3d8bbwe'
];

const packagesRelPath = 'LocalCache\\Packages';
const officialRelPath = 'Official\\OneStore';

let installPath: string | undefined = undefined;

export function getPackagePath(location: PackageLocation): string {
  if (!installPath) {
    throw new Error('installPath not set');
  }
  switch (location) {
    case 'community':
    case 'official':
      return path.join(
        installPath,
        packagesRelPath,
        location === 'official' ? officialRelPath : location
      );
    case 'inactive':
      return path.join(localDataPath, 'inactive');
  }
}

ipcMain.handle('findMsfsInstallPath', () => {
  return new Promise((res, rej) => {
    const foundPath = (installPath = possibleInstallPaths.find((p) => {
      return existsSync(p) && existsSync(path.join(p, packagesRelPath));
    }));
    if (foundPath) {
      installPath = foundPath;
      res(foundPath);
    } else {
      rej(new Error('MSFS Install Path Not Found'));
    }
  });
});

ipcMain.handle('findPackages', async (ev, location: PackageLocation) => {
  const packageDirPath = getPackagePath(location);

  const packageDirs = (
    await fs.readdir(packageDirPath, {
      withFileTypes: true
    })
  )
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  const manifests = await Promise.all(
    packageDirs.map(async (pd) => {
      const rawFileContent = await fs.readFile(
        path.join(packageDirPath, pd, 'manifest.json'),
        'utf-8'
      );
      return [pd, rawFileContent];
    })
  );

  return manifests;
});

ipcMain.handle('backupPackage', (ev, pkg: PackageInfo) => backupPackage(pkg));
