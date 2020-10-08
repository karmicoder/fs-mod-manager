import { AvailableUpdate, UpdaterDef, UpdaterMap } from '@/types/updater';
import { existsSync } from 'fs';
import path from 'path';
import { localDataPath } from './localData';
import { promises as fs } from 'fs';
import log from './log';
import { PackageInfo } from '@/types/packageInfo';
import { checkForGithubUpdates } from './updaters/github';
import { GithubUpdaterDef } from '@/types/github';

const updaterFilePath = path.join(localDataPath, 'updater.json');
let updaterMap: UpdaterMap | undefined = undefined;

export async function parseUpdaters(): Promise<UpdaterMap> {
  if (!existsSync(updaterFilePath)) {
    await fs.writeFile(updaterFilePath, '{}');
    updaterMap = {};
    return updaterMap;
  }

  const rawJson = await fs.readFile(updaterFilePath, 'utf-8');
  updaterMap = JSON.parse(rawJson) as UpdaterMap;
  const updaterKeys = Object.keys(updaterMap);
  updaterKeys.forEach((k) => {
    if (updaterMap) {
      updaterMap[k].packageDir = k;
    }
  });
  log.info('parseUpdaters, ' + updaterKeys.length + ' definition(s) found');
  return updaterMap;
}

export async function getUpdaters(reload = false): Promise<UpdaterMap> {
  if (updaterMap !== undefined && !reload) {
    return updaterMap;
  }
  return await parseUpdaters();
}

export async function checkForPackageUpdates(
  pkg: PackageInfo
): Promise<AvailableUpdate | undefined> {
  await getUpdaters();
  const updaterDef = updaterMap ? updaterMap[pkg.directoryName] : undefined;
  if (updaterDef) {
    return checkUpdater(updaterDef);
  } else {
    return undefined;
  }
}

async function checkUpdater(
  def: UpdaterDef
): Promise<AvailableUpdate | undefined> {
  if (def.type === 'github') {
    const githubDef = def as GithubUpdaterDef;
    return checkForGithubUpdates(githubDef);
  }

  return undefined;
}
