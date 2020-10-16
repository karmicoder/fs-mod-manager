import { findPackages } from '@/ipcRenderer';
import {
  PackageInfo,
  PackageLocation,
  UnmetPackageDependency
} from '@/types/packageInfo';
import { parsePackageInfo } from '@/data/parsePackageInfo';
import compareVersions from 'compare-versions';

export const packageVersions = new Map<string, string>();
const packages = new Map<PackageLocation, PackageInfo[]>();

function parsePackages(
  rawObjs: [string, string][],
  location: PackageLocation
): PackageInfo[] {
  return rawObjs
    .map(([directoryName, rawObjStr]): PackageInfo | undefined => {
      try {
        const pkg = parsePackageInfo(directoryName, rawObjStr, location);
        packageVersions.set(directoryName, pkg.version);
        // HACK: fix missing fs-base-propdefs
        if (location === 'official' && directoryName === 'fs-base') {
          packageVersions.set('fs-base-propdefs', pkg.version);
        }
        return pkg;
      } catch (err) {
        console.error('unparseable manifest ' + directoryName, rawObjStr);
        return undefined;
      }
    })
    .filter((p) => p !== undefined) as PackageInfo[];
}

export function packageNameComparator(a: PackageInfo, b: PackageInfo): number {
  return (a.title || a.directoryName).localeCompare(b.title || b.directoryName);
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
  const parsedPackages = parsePackages(rawPackages, location).sort(
    packageNameComparator
  );
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
