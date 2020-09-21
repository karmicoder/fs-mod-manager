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

const packages = new Map<PackageLocation, PackageInfo[]>();

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

export async function getPackages(
  location: PackageLocation,
  refresh = false
): Promise<PackageInfo[]> {
  const cached = packages.get(location);
  if (cached && !refresh) {
    return Promise.resolve(cached);
  }
  const rawPackages = await findPackages(location);
  const parsedPackages = parsePackageInfo(rawPackages, location);
  packages.set(location, parsedPackages);
  return parsedPackages;
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
