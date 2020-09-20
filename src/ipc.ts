import { IpcRenderer } from 'electron';
import { PackageLocation } from './data/packageInfo';

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
  return window.ipcRenderer.invoke('findCommunityPackages', location);
}
