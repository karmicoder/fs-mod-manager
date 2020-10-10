import { IpcRenderer } from 'electron';
import {
  ImportInfo,
  ImportPackageInfo,
  PackageInfo,
  PackageLocation
} from './types/packageInfo';
import {
  AvailableUpdate,
  UpdatePackageResult,
  UpdaterDef,
  UpdaterMap
} from './types/updater';
const ipcRenderer = (window as any).ipcRenderer as IpcRenderer;
export default ipcRenderer;

export function verifySetup(): Promise<boolean> {
  return ipcRenderer.invoke('verifySetup');
}
export function findMsfsInstallPath(): Promise<string> {
  return ipcRenderer.invoke('findMsfsInstallPath');
}

export function findPackages(
  location: PackageLocation
): Promise<[string, string][]> {
  return ipcRenderer.invoke('findPackages', location);
}

export function backupPackage(pkg: PackageInfo): Promise<void> {
  return ipcRenderer.invoke('backupPackage', pkg);
}

export function selectImportFile(): Promise<string> {
  return ipcRenderer.invoke('selectImportFile');
}

export function parseImportFile(archive: string): Promise<ImportInfo> {
  return ipcRenderer.invoke('parseImportFile', archive);
}

export function importPackages(pkgs: ImportPackageInfo[]): Promise<void> {
  return ipcRenderer.invoke('importPackages', pkgs);
}

export function deactivatePackage(pkg: PackageInfo) {
  return ipcRenderer.invoke('deactivatePackage', pkg.directoryName);
}

export function activatePackage(pkg: PackageInfo) {
  return ipcRenderer.invoke('activatePackage', pkg.directoryName);
}

export function getUpdaters(): Promise<UpdaterMap | undefined> {
  return ipcRenderer.invoke('getUpdaters');
}

export function checkForPackageUpdates(
  pkg: PackageInfo
): Promise<AvailableUpdate | undefined> {
  return ipcRenderer.invoke('checkForPackageUpdates', pkg);
}

export function updatePackage(
  pkg: PackageInfo,
  def: UpdaterDef
): Promise<UpdatePackageResult> {
  return ipcRenderer.invoke('updatePackage', pkg, def);
}
