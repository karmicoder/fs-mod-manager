import {
  PackageDependency,
  PackageInfo,
  PackageLocation
} from '@/types/packageInfo';

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

  return result;
}
