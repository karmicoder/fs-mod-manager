export interface GithubCommit {
  sha: string;
  author: string;
  message: string;
  date: number;
}

export type GithubUpdaterDef = UpdaterDef & {
  src: 'release' | 'branch';
  project: string;
  branch?: string; // only for src='branch'. Name of the branch
  prerelease?: boolean; // only for src='release'. If true, includes releases marked prerelease. Defaults to false
};
