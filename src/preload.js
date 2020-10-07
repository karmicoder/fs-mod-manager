import { ipcRenderer } from 'electron';
process.on('loaded', () => {
  console.log('process loaded: preload ipcRenderer');
  window.ipcRenderer = ipcRenderer;
});
