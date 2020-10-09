import { GithubCommit, GithubUpdaterDef } from '@/types/github';
import { AvailableUpdate } from '@/types/updater';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import moment from 'moment';
import log from '@/server/log';
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
