import { GithubCommit, GithubUpdaterDef } from '@/types/github';
import { AvailableUpdate } from '@/types/updater';
import axios from 'axios';
import moment from 'moment';
import log from '@/server/log';
const githubApi = axios.create({
  baseURL: 'https://api.github.com/',
  headers: {
    accept: 'application/vnd.github.v3+json'
  }
});

function parseCommit(rawCommit: { [key: string]: any }): GithubCommit {
  return {
    sha: rawCommit.sha,
    message: rawCommit.commit.message,
    author: rawCommit.author.name,
    date: moment(rawCommit.author.date).unix()
  };
}

async function getLatestCommits({
  branch,
  project
}: GithubUpdaterDef): Promise<GithubCommit[]> {
  const resp = await githubApi.get(`repos/${project}/commits`);
  const json = resp.data as [];
  return json.map(parseCommit);
}

export async function checkForGithubUpdates(
  def: GithubUpdaterDef
): Promise<AvailableUpdate | undefined> {
  if (def.src === 'branch') {
    const commits = await getLatestCommits(def);
    log.debug(
      'checkForGithubUpdates for ' + def.packageDir + ', got commits',
      commits
    );
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
