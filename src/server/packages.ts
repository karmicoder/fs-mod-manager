import { PackageInfo, PackageLocation } from '@/types/packageInfo';
import { existsSync, promises as fs } from 'fs';
import ncp from 'ncp';
import * as path from 'path';

import { inactivePath, localDataPath } from './localData';

const possibleInstallPaths = [
  process.env.LOCALAPPDATA +
    '\\Packages\\Microsoft.FlightSimulator_8wekyb3d8bbwe',
  process.env.LOCALAPPDATA +
    '\\Packages\\Microsoft.FlightDashboard_8wekyb3d8bbwe'
];

const packagesRelPath = 'LocalCache\\Packages';
const officialRelPath = 'Official\\OneStore';

export let installPath: string | undefined = undefined;

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
    default:
      throw new Error('getPackagePath: Unsupported location: ' + location);
  }
}

export function findMsfsInstallPath(): Promise<string> {
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
}

export async function findPackages(location: PackageLocation) {
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
}

export async function deactivatePackage(pkgDirectory: string): Promise<void> {
  const fromDir = path.join(getPackagePath('community'), pkgDirectory);
  const toDir = path.join(localDataPath, inactivePath, pkgDirectory);
  if (existsSync(toDir)) {
    await fs.rmdir(toDir, { recursive: true });
  }
  return new Promise((resolve, reject) => {
    ncp(fromDir, toDir, (err) => {
      if (err) {
        reject(err);
      } else {
        fs.rmdir(fromDir, { recursive: true }).then(
          () => {
            resolve();
          },
          (err) => reject(err)
        );
      }
    });
  });
}
