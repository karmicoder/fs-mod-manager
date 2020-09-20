import { findMsfsInstallPath, findPackages } from '@/ipc';

export type PackageLocation = 'official' | 'community' | 'inactive';
export interface PackageDependency {
  name: string;
  version: string;
}
export interface UnmetPackageDependency {
  name: string;
  expected: string;
  loaded?: string;
}
export interface PackageInfo {
  title: string;
  version: string;
  dependencies: PackageDependency[];
  contentType: string;
  minimumGameVersion: string;
  manufacturer: string;
  location: PackageLocation;
  directoryName: string;
}

// do not modify outside of this file
const packageVersions = new Map<string, string>();

let communityPackages: PackageInfo[];
let officialPackages: PackageInfo[];
let inactivePackages: PackageInfo[];

function parsePackageInfo(
  rawObjs: [string, string][],
  location: PackageLocation
): PackageInfo[] {
  return rawObjs.map(([directoryName, rawObjStr]) => {
    // properties on manifest are all in string format
    const rawObj = JSON.parse(rawObjStr) as Record<string, string>;
    const result: PackageInfo = {
      title: rawObj.title,
      version: rawObj.package_version,
      dependencies: Array.isArray(rawObj.dependencies)
        ? (rawObj.dependencies.map((d) => {
            return {
              version: d.package_version.toString(),
              name: d.name.toString()
            };
          }) as PackageDependency[])
        : [],
      contentType: rawObj.content_type as string,
      minimumGameVersion: rawObj.minimum_game_version as string,
      manufacturer: rawObj.manufacturer as string,
      location,
      directoryName
    };
    packageVersions.set(directoryName, result.version);
    return result;
  });
}

export async function getCommunityPackages(
  refresh = false
): Promise<PackageInfo[]> {
  if (communityPackages && !refresh) {
    return Promise.resolve(communityPackages);
  }
  await findMsfsInstallPath();
  const rawPackages = await findPackages('community');
  communityPackages = parsePackageInfo(rawPackages, 'community');
  console.log('parsePackageInfo complete', packageVersions);

  return communityPackages;
}

export async function getOfficialPackages(
  refresh = false
): Promise<PackageInfo[]> {
  if (officialPackages && !refresh) {
    return Promise.resolve(officialPackages);
  }
  await findMsfsInstallPath();
  const rawPackages = await findPackages('official');
  officialPackages = parsePackageInfo(rawPackages, 'official');
  console.log('parsePackageInfo complete', packageVersions);

  return officialPackages;
}

export function unmetDependencies(pkg: PackageInfo): UnmetPackageDependency[] {
  if (!pkg.dependencies) {
    return [];
  }
  return pkg.dependencies
    .filter((d) => d.version !== packageVersions.get(d.name))
    .map((d) => {
      return {
        name: d.name,
        expected: d.version,
        loaded: packageVersions.get(d.name)
      };
    });
}
