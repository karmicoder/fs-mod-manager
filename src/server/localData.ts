import path from 'path';
import { existsSync } from 'fs';
import { promises as fs } from 'fs';
import { app } from 'electron';
export const localDataPath = path.join(
  process.env.LOCALAPPDATA as string,
  app.name
);

export async function initLocalData(): Promise<void> {
  if (!existsSync(localDataPath)) {
    await fs.mkdir(localDataPath);
  }
}

initLocalData();
