import { IpcRenderer } from 'electron';

declare global {
  interface Window {
    ipcRenderer: IpcRenderer;
  }
}

export function findMsfsInstallPath(): Promise<string> {
  return window.ipcRenderer.invoke('findMsfsInstallPath');
}
