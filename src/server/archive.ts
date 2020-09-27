import Seven from 'node-7z';
import { app } from 'electron';
import path from 'path';

const pathTo7zip =
  process.env.NODE_ENV !== 'production'
    ? path.join(
        app.getAppPath(),
        '..\\node_modules\\win-7zip\\7zip-lite\\7z.exe'
      )
    : '7z.exe';
console.log('7zip path: ' + pathTo7zip);

export function archive(
  fromPath: string,
  toPath: string,
  onProgress?: (percent: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log('archive ', { fromPath, toPath });
    const stream = Seven.add(toPath, fromPath, {
      $bin: pathTo7zip,
      $progress: true,
      recursive: true
    });
    if (onProgress) {
      stream.on('progress', function(val) {
        onProgress(val.percent as number);
      });
    }
    stream.on('error', reject);
    stream.on('end', resolve);
  });
}
export function unarchive(
  fromPath: string,
  toPath: string,
  onProgress?: (percent: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log('unarchive', { fromPath, toPath });
    const stream = Seven.extractFull(fromPath, toPath, {
      $bin: pathTo7zip,
      $progress: true
    });
    if (onProgress) {
      stream.on('progress', function(val) {
        onProgress(val.percent as number);
      });
    }
    stream.on('error', reject);
    stream.on('end', resolve);
  });
}
