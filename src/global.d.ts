declare module 'dom' {
  interface WindowEventMap {
    snack: SnackEvent;
  }
  interface Window {
    ipcRenderer: IpcRenderer;
  }
}
