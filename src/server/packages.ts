import { PackageLocation } from '@/types/packageInfo';
import { existsSync, promises as fs } from 'fs';
import ncp from 'ncp';
import * as path from 'path';
import log from './log';

import { inactivePath, localDataPath } from './localData';
import { parseUpdaters } from './updater';
import { loggers } from 'winston';

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

export async function verifySetup(): Promise<boolean> {
  log.debug('verifying setup');
  const installPath = await findMsfsInstallPath();
  await parseUpdaters();
  return existsSync(installPath);
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
      const manifestPath = path.join(packageDirPath, pd, 'manifest.json');
      if (existsSync(manifestPath)) {
        const rawFileContent = await fs.readFile(manifestPath, 'utf-8');
        return [pd, rawFileContent];
      }
      return [pd, ''];
    })
  );

  log.info(
    'findPackages: ' + location + ': ' + manifests.length + ' manifest(s) found'
  );

  return manifests;
}

export async function deactivatePackage(pkgDirectory: string): Promise<void> {
  log.info('deactivatePackage ' + pkgDirectory);
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

export async function activatePackage(pkgDirectory: string) {
  log.info('activatePackage ' + pkgDirectory);
  const fromDir = path.join(localDataPath, inactivePath, pkgDirectory);
  const toDir = path.join(getPackagePath('community'), pkgDirectory);
  if (existsSync(toDir)) {
    throw new Error(
      'Active package with directory "' + pkgDirectory + '" already exists'
    );
  }
  return new Promise((resolve, reject) => {
    ncp(fromDir, toDir, (err) => {
      if (err) {
        reject(err);
      } else {
        fs.rmdir(fromDir, { recursive: true }).then(resolve, reject);
      }
    });
  });
}
