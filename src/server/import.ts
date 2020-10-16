import { app, dialog, ipcMain } from 'electron';
import path from 'path';
import { existsSync, promises as fs } from 'fs';
import tmp from 'tmp';

import { getPackagePath } from './packages';
import ncp from 'ncp';
import {
  ImportInfo,
  ImportPackageInfo,
  PackageInfo
} from '@/types/packageInfo';
import { unarchive } from './archive';
import log from './log';
import { parsePackageInfo } from '@/data/parsePackageInfo';

let tmpDir: tmp.DirResult | undefined;

export async function selectImportFile(): Promise<string> {
  const result = await dialog.showOpenDialog({
    defaultPath: app.getPath('downloads'),
    filters: [
      { name: 'Package Archives', extensions: ['zip', 'rar', '7z', 'tar.gz'] }
    ],
    properties: ['openFile']
  });
  return result.filePaths[0];
}

async function cleanupTmpDir() {
  if (tmpDir) {
    // default tmpDir.removeCallback() stupidly doesn't set recrusive
    await fs.rmdir(tmpDir.name, { recursive: true });
    tmpDir = undefined;
  }
}

export async function findManifests(
  startPath: string
): Promise<[string, PackageInfo][]> {
  const pathsToScan = [startPath];
  const result: [string, PackageInfo][] = [];
  while (pathsToScan.length > 0) {
    const curPath = pathsToScan.shift() || '';
    var files = await fs.readdir(curPath);
    for (let i = 0; i < files.length; ++i) {
      const fPath = files[i];
      if (fPath === 'manifest.json') {
        const rawManifest = await fs.readFile(
          path.join(curPath, fPath),
          'utf-8'
        );
        const directoryName = curPath.split(path.sep).splice(-1, 1)[0];

        try {
          result.push([
            curPath,
            parsePackageInfo(directoryName, rawManifest, 'temp')
          ]);
        } catch (err) {
          log.error('error parsing manifest.json in ' + curPath, err);
        }
        break;
      }
      const stats = await fs.lstat(path.join(curPath, fPath));
      if (stats.isDirectory()) {
        pathsToScan.push(path.join(curPath, fPath));
      }
    }
  }
  return result;
}

export async function parseImportFile(
  archivePath: string,
  onProgress?: (percent: number) => void
): Promise<ImportInfo> {
  cleanupTmpDir();
  tmpDir = tmp.dirSync();
  const tmpName = tmpDir.name;
  log.debug('parseImportFile: extracting ' + archivePath + ' to ' + tmpName);
  await unarchive(archivePath, tmpName, onProgress);
  const manifests = await findManifests(tmpName);
  log.debug('parseImportFile: found ' + manifests.length + ' manifests');
  return { importPath: tmpName, packages: manifests };
}

export async function installPackage(pkg: ImportPackageInfo): Promise<void> {
  const fromPath = pkg[0];
  const toPath = path.join(getPackagePath('community'), pkg[1].directoryName);
  if (existsSync(toPath)) {
    log.debug('install: toPath exists, removing...', toPath);
    await fs.rmdir(toPath, { recursive: true });
  }

  return new Promise((resolve, reject) => {
    log.debug('installPackage: copying ' + pkg);
    ncp(fromPath, toPath, { stopOnErr: true }, (err) => {
      if (err) {
        reject(err);
      } else {
        log.debug('install copy comand complete', fromPath, toPath);
        resolve();
      }
    });
  });
}
export async function importPackages(pkgs: ImportPackageInfo[]): Promise<void> {
  // could be done in parallel, but this was creating EMFILE: too many open files errors when
  // installing large numbers of packages (i.e. liveries megapack)
  for (let i = 0; i < pkgs.length; ++i) {
    await installPackage(pkgs[i]);
  }
  await cleanupTmpDir();
  return;
}

process.on('exit', cleanupTmpDir);
process.on('SIGINT', cleanupTmpDir);
process.on('uncaughtException', cleanupTmpDir);
