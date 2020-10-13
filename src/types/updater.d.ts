export type UpdaterType = 'github' | 'rest';
export interface UpdaterDef {
  type: UpdaterType;
  packageDir: string;
  lastVersion?: string;
  lastUpdated?: number;
}

export interface UpdaterMap {
  [key: string]: UpdaterDef;
}

export interface AvailableUpdate {
  version: string;
  desc?: string;
  changes?: string[];
  date?: number;
  url: string;
  expectedSize?: number;
}
export interface UpdatePackageResult {
  pkg: PackageInfo;
  updater: UpdaterDef;
}

export interface UpdateProgress {
  packageDir: string;
  operation: string;
  progress: number; // 0-100
}
