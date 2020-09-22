import { IpcRenderer } from 'electron';
import { PackageInfo, PackageLocation } from './data/packageInfo';

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
