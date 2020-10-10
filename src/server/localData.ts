import path from 'path';
import { exists, existsSync } from 'fs';
import { promises as fs } from 'fs';
import { app } from 'electron';
export const localDataPath = path.join(
  process.env.LOCALAPPDATA as string,
  app.name
);
export const inactivePath = 'inactive';

export async function initLocalData(): Promise<void> {
  if (!existsSync(localDataPath)) {
    await fs.mkdir(localDataPath);
  }
  const fullInactivePath = path.join(localDataPath, 'inactive');
  if (!existsSync(fullInactivePath)) {
    await fs.mkdir(fullInactivePath);
  }
}

initLocalData();
