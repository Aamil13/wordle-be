import winston from 'winston';
import { config } from '../config/env';

const devFormat = winston.format.printf(({ level, message, stack, timestamp }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});
export const logger = winston.createLogger({
  level: config.nodeEnv === 'production' ? 'warn' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    config.nodeEnv === 'production' ? winston.format.json() : devFormat,
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});
