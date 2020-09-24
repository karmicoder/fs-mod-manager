import { findPackages } from '@/ipc';
import compareVersions from 'compare-versions';
export interface PackageDependency {
  name: string;
  version: string;
}

export interface PackageManifest {
  dependencies: PackageDependency[];
  title: string;
}

export type PackageLocation = 'official' | 'community' | 'inactive' | 'temp';

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
  size: number;
}

export type ImportPackageInfo = [string, PackageInfo];
export interface ImportInfo {
  importPath: string;
  packages: ImportPackageInfo[];
}

const packageVersions = new Map<string, string>();
const packages = new Map<PackageLocation, PackageInfo[]>();

export function parsePackageInfo(
  directoryName: string,
  rawObjStr: string,
  location: PackageLocation
): PackageInfo {
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
    size: parseInt(rawObj.total_package_size as string),
    location,
    directoryName
  };
  packageVersions.set(directoryName, result.version);
  // HACK: fix missing fs-base-propdefs
  if (location === 'official' && directoryName === 'fs-base') {
    packageVersions.set('fs-base-propdefs', result.version);
  }
  return result;
}
function parsePackages(
  rawObjs: [string, string][],
  location: PackageLocation
): PackageInfo[] {
  return rawObjs.map(([directoryName, rawObjStr]) =>
    parsePackageInfo(directoryName, rawObjStr, location)
  );
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
  const parsedPackages = parsePackages(rawPackages, location).sort((a, b) =>
    (a.title || a.directoryName).localeCompare(b.title || b.directoryName)
  );
  packages.set(location, parsedPackages);
  return parsedPackages;
}

export function unmetDependencies(pkg: PackageInfo): UnmetPackageDependency[] {
  if (!pkg.dependencies) {
    return [];
  }
  return pkg.dependencies
    .filter((d) => {
      const loadedVersion = packageVersions.get(d.name);
      return !loadedVersion || compareVersions(d.version, loadedVersion) > 0;
    })
    .map((d) => {
      return {
        name: d.name,
        expected: d.version,
        loaded: packageVersions.get(d.name)
      };
    });
}

export function clearPackageInfo() {
  packages.clear();
  packageVersions.clear();
}
