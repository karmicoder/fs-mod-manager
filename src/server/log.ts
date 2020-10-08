import { app } from 'electron';
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
log.info(
  `application start v${app.getVersion()} debug=${process.env.NODE_ENV !==
    'production'}`
);

export default log;
