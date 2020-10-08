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
}
