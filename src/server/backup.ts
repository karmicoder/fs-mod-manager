import { PackageInfo } from '@/data/packageInfo';
import { getPackagePath } from './ipcServer';
import * as path from 'path';
import { promises as fs, existsSync, createWriteStream } from 'fs';
import { app } from 'electron';
import archiver from 'archiver';

console.log('PROCESS ENV', process.env.LOCALAPPDATA, app.name);
const localDataPath = path.join(process.env.LOCALAPPDATA as string, app.name);

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
  const origPath = path.join(getPackagePath(pkg.location), pkg.directoryName);
  await initBackupPath();
  const pkgBackupPath = path.join(backupPath, pkg.directoryName);
  if (!existsSync(pkgBackupPath)) {
    await fs.mkdir(pkgBackupPath);
  }

  const archive = archiver('zip', { zlib: { level: 6 } });
  const stream = createWriteStream(
    path.join(pkgBackupPath, pkg.version + '.zip')
  );
  return new Promise<void>((resolve, reject) => {
    stream.on('close', resolve);
    archive
      .directory(origPath, false)
      .on('error', (err: Error) => reject(err))
      .pipe(stream);
    archive.finalize();
  });
}
