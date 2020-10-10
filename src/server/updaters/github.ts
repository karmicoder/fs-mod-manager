import { GithubCommit, GithubUpdaterDef } from '@/types/github';
import { AvailableUpdate, UpdatePackageResult } from '@/types/updater';
import fs from 'fs';
import axios from 'axios';
import tmp from 'tmp';
import moment from 'moment';
import log from '@/server/log';
import { PackageInfo } from '@/types/packageInfo';
import { installPackage, parseImportFile } from '../import';
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

async function downloadPackage(
  project: string,
  branchOrTag: string
): Promise<tmp.FileResult> {
  const tmpFile = tmp.fileSync({ postfix: '.zip' });
  const stream = fs.createWriteStream(tmpFile.name, {
    encoding: 'binary',
    autoClose: true,
    fd: tmpFile.fd
  });
  const url =
    'https://github.com/' + project + '/archive/' + branchOrTag + '.zip';
  log.info('github: download package: ' + url);
  const resp = await axios.get(url, {
    responseType: 'stream'
  });
  log.debug('github: download headers', resp.headers);
  resp.data.pipe(stream);
  const fileSize = resp.headers['content-length'];
  let bytesRx = 0;
  resp.data.on('data', (chunk: []) => {
    bytesRx += chunk.length;
    log.debug(
      'github download progress ' + bytes(bytesRx) + '/' + bytes(fileSize)
    );
  });

  return new Promise((resolve, reject) => {
    stream.on('finish', () => {
      stream.close();
      log.debug('github: download finished');
      resolve(tmpFile);
    });
    stream.on('error', (err) => {
      tmpFile.removeCallback();
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
          date: latestCommit.date
        };
      }
    }
  } else {
    throw new Error('checkForGithubUpdates not implemented for src="release"');
  }
}

export async function updateGithubPackage(
  pkg: PackageInfo,
  updater: GithubUpdaterDef
): Promise<UpdatePackageResult> {
  const downloadTmpFile = await downloadPackage(
    updater.project,
    updater.branch
  );
  try {
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
    return { pkg: importInfo.packages[0][1], updater };
  } finally {
    // downloadTmpFile.removeCallback();
  }
}
