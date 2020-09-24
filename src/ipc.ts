import { IpcRenderer } from 'electron';
import {
  ImportInfo,
  ImportPackageInfo,
  PackageInfo,
  PackageLocation
} from './types/packageInfo';

declare global {
  interface Window {
    ipcRenderer: IpcRenderer;
  }
}

export function findMsfsInstallPath(): Promise<string> {
  return window.ipcRenderer.invoke('findMsfsInstallPath');
}

export function findPackages(
  location: PackageLocation
): Promise<[string, string][]> {
  return window.ipcRenderer.invoke('findPackages', location);
}

export function backupPackage(pkg: PackageInfo): Promise<void> {
  return window.ipcRenderer.invoke('backupPackage', pkg);
}

export function selectImportFile(): Promise<string> {
  return window.ipcRenderer.invoke('selectImportFile');
}

export function parseImportFile(archive: string): Promise<ImportInfo> {
  return window.ipcRenderer.invoke('parseImportFile', archive);
}

export function importPackages(pkgs: ImportPackageInfo[]): Promise<void> {
  return window.ipcRenderer.invoke('importPackages', pkgs);
}

export function deactivatePackage(pkg: PackageInfo) {
  return window.ipcRenderer.invoke('deactivatePackage', pkg.directoryName);
}
