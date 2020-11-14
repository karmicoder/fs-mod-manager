import { GithubCommit, GithubRelease, GithubUpdaterDef } from '@/types/github';
import {
  AvailableUpdate,
  UpdatePackageResult,
  UpdateProgress
} from '@/types/updater';
import fs from 'fs';
import axios from 'axios';
import tmp from 'tmp';
import moment from 'moment';
import log from '@/server/log';
import { PackageInfo } from '@/types/packageInfo';
import { installPackage, parseImportFile } from '../import';
import compareVersions from 'compare-versions';
import { webContents } from 'electron';
import bytes from 'bytes';

const githubApi = axios.create({
  baseURL: 'https://api.github.com/',
  headers: {
    accept: 'application/vnd.github.v3+json'
  }
});
githubApi.interceptors.request.use((config) => {
  log.debug(
    `githubApi [${config.method}] ${config.baseURL || ''}${config.url}`
  );
  return config;
});
githubApi.interceptors.response.use((resp) => {
  log.debug(
    `githubApi response ${resp.status} [${resp.config.method}] ${resp.config
      .baseURL || ''}${resp.config.url} `
  );
  return resp;
});

function parseCommit(rawCommit: { [key: string]: any }): GithubCommit {
  return {
    sha: rawCommit.sha,
    message: rawCommit.commit.message,
    author: rawCommit.author ? rawCommit.author.name : undefined,
    date: moment(rawCommit.commit.date).unix()
  };
}

function parseRelease(rawRelease: { [key: string]: any }): GithubRelease {
  return {
    id: rawRelease.indexOf,
    tagName: rawRelease.tag_name,
    prerelease: rawRelease.prerelease,
    date: moment(
      rawRelease.assets[0]
        ? rawRelease.assets[0].published_at || rawRelease.assets[0].created_at
        : rawRelease.published_at || rawRelease.created_at
    ).unix(),
    body: rawRelease.body,
    downloadUrl: rawRelease.assets[0]
      ? rawRelease.assets[0].browser_download_url
      : undefined,
    size: rawRelease.assets[0] ? rawRelease.assets[0].size : undefined
  };
}

async function downloadPackage(
  url: string,
  packageDir: string,
  expectedSize?: number
): Promise<tmp.FileResult> {
  const tmpFile = tmp.fileSync({ postfix: '.zip' });
  const stream = fs.createWriteStream(tmpFile.name, {
    encoding: 'binary',
    autoClose: true,
    fd: tmpFile.fd
  });
  log.info('github: download package: ' + url);
  const resp = await axios.get(url, {
    responseType: 'stream'
  });
  log.debug('github: download headers', resp.headers);
  resp.data.pipe(stream);
  const fileSize = expectedSize || parseInt(resp.headers['content-length']);
  let bytesRx = 0;
  resp.data.on('data', (chunk: []) => {
    bytesRx += chunk.length;
    log.debug(
      'got chunk: downloaded ' + bytes(bytesRx) + '/' + bytes(fileSize)
    );
    try {
      webContents.getAllWebContents()[0].send('update-progress', {
        packageDir,
        operation: 'Downloading',
        progress: (bytesRx / fileSize) * 100 * 0.2
      } as UpdateProgress);
    } catch (ex) {
      log.error('failed to emit update-progress', ex);
    }

    return chunk;
  });

  return new Promise((resolve, reject) => {
    stream.on('finish', () => {
      stream.close();
      log.debug('github: download finished');
      resolve(tmpFile);
    });
    stream.on('error', (err) => {
      reject(err);
    });
  });
}

async function getLatestCommits({
  branch,
  project
}: GithubUpdaterDef): Promise<GithubCommit[]> {
  const url = `repos/${project}/commits`;
  const resp = await githubApi.get(url);
  const json = resp.data as [];
  return json.map(parseCommit);
}

async function getLatestReleases({
  project,
  prerelease
}: GithubUpdaterDef): Promise<GithubRelease[]> {
  const url = `repos/${project}/releases`;
  const resp = await githubApi.get(url);
  const json = resp.data as [];
  return json
    .map(parseRelease)
    .filter((r) => prerelease === true || r.prerelease !== true);
}
export async function checkForGithubUpdates(
  def: GithubUpdaterDef
): Promise<AvailableUpdate | undefined> {
  if (def.src === 'branch') {
    const commits = await getLatestCommits(def);

    if (commits.length > 0) {
      const latestCommit = commits[0];
      if (!def.lastVersion || latestCommit.sha !== def.lastVersion) {
        return {
          version: latestCommit.sha,
          changes: commits.map((c) => c.message),
          date: latestCommit.date,
          url:
            'https://github.com/' +
            def.project +
            '/archive/' +
            def.branch +
            '.zip'
        };
      }
    }
  } else if (def.src === 'release') {
    const releases = await getLatestReleases(def);

    if (releases.length > 0) {
      const latestRelease = releases[0];

      let comparedVersions = 0;
      try {
        comparedVersions = compareVersions(
          def.lastVersion,
          latestRelease.tagName
        );
      } catch {}
      if (
        !def.lastVersion ||
        comparedVersions > 0 ||
        latestRelease.date > def.lastUpdated
      ) {
        const result = {
          version: latestRelease.tagName,
          changes: latestRelease.body ? latestRelease.body.split('\n') : [],
          date: latestRelease.date,
          url: latestRelease.downloadUrl,
          expectedSize: latestRelease.size
        };
        log.debug('update available for ' + def.packageDir, result);
        return result;
      } else {
        log.debug(def.packageDir + ' up to date', { latestRelease, def });
      }
    }
  } else {
    throw new Error('checkForGithubUpdates not implemented for src="release"');
  }

  return undefined;
}

export async function updateGithubPackage(
  pkg: PackageInfo,
  updater: GithubUpdaterDef,
  availableUpdate: AvailableUpdate
): Promise<UpdatePackageResult> {
  const downloadTmpFile: tmp.FileResult = await downloadPackage(
    availableUpdate.url,
    pkg.directoryName
  );
  const importInfo = await parseImportFile(downloadTmpFile.name);
  if (importInfo.packages.length <= 0) {
    throw new Error(
      'Downloaded archive does not contain any recognized msfs packages'
    );
  } else if (importInfo.packages.length > 1) {
    throw new Error(
      'Downloaded archive contains multiple packages. Ony one can be auto-updated'
    );
  }
  await installPackage(importInfo.packages[0]);
  downloadTmpFile.removeCallback();
  updater.lastUpdated = moment().unix();
  updater.lastVersion = availableUpdate.version;

  return { pkg: importInfo.packages[0][1], updater };
}
