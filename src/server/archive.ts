import sevenBin from '7zip-bin';

import Seven from 'node-7z';

const pathTo7zip = sevenBin.path7za;

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
