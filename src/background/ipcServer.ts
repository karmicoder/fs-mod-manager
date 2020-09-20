import * as fs from 'fs';
import { ipcMain } from 'electron';

const possibleInstallPaths = [
  process.env.LOCALAPPDATA +
    '\\Packages\\Microsoft.FlightSimulator_8wekyb3d8bbwe',
  process.env.LOCALAPPDATA +
    '\\Packages\\Microsoft.FlightDashboard_8wekyb3d8bbwe'
];

export default {
  start() {
    ipcMain.handle('findMsfsInstallPath', (event) => {
      return new Promise((res, rej) => {
        const foundPath = possibleInstallPaths.find((path) => {
          const stats = fs.statSync(path);
          return stats && stats.isDirectory();
        });
        if (foundPath) {
          res(foundPath);
        } else {
          rej(new Error('MSFS Install Path Not Found'));
        }
      });
    });
  }
};
