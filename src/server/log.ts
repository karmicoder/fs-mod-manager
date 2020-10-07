import path from 'path';
import { format, transports, createLogger } from 'winston';
import { localDataPath } from './localData';
const log = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: format.simple(),
  transports: [
    new transports.Console(),
    new transports.File({
      filename: path.join(localDataPath, 'server.log'),
      tailable: true,
      maxsize: 1024 ** 2,
      maxFiles: 5
    })
  ]
});
export default log;
