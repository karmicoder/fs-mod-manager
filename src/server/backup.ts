import * as path from 'path';
import { promises as fs, existsSync, createWriteStream } from 'fs';
import { app } from 'electron';
import { getPackagePath } from './packages';
import { PackageInfo } from '@/types/packageInfo';
import { archive } from './archive';
import log from './log';

const localDataPath = path.join(process.env.LOCALAPPDATA as string, app.name);
log.info('localDataPath: ' + localDataPath);

const backupPath = path.join(localDataPath, 'backup');
async function initBackupPath() {
  if (!existsSync(localDataPath)) {
    await fs.mkdir(localDataPath);
  }
  if (!existsSync(backupPath)) {
    await fs.mkdir(backupPath);
  }
}
export async function backupPackage(pkg: PackageInfo) {
  const origPath = path.join(
    getPackagePath(pkg.location),
    pkg.directoryName,
    '*'
  );
  await initBackupPath();
  const pkgBackupPath = path.join(backupPath, pkg.directoryName);
  if (!existsSync(pkgBackupPath)) {
    await fs.mkdir(pkgBackupPath);
  }

  return archive(
    origPath,
    path.join(pkgBackupPath, pkg.version + '.7z'),
    (percent) => log.debug('backing up ' + origPath + 'progress ', percent)
  );
}
