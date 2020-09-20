interface PackageDependency {
  name: string;
  version: string;
}

interface PackageManifest {
  dependencies: PackageDependency[];
  title: string;
}
