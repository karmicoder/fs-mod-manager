declare module global {
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

  export interface ImportInfo extends PackageInfo {
    importPath: string;
    packages: [string, PackageInfo];
  }
}
