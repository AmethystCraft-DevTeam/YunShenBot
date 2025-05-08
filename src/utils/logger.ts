import winston from 'winston';
import { config } from '../config/config';
import fs from 'fs';
import path from 'path';

// 创建日志目录
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// 创建一个logger实例
const logger = winston.createLogger({
  level: config.logging.level,
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.printf(info => `[${info.timestamp}] [${info.level.toUpperCase()}]: ${info.message}`)
  ),
  transports: [
    // 控制台输出
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(info => `[${info.timestamp}] [${info.level}]: ${info.message}`)
      )
    }),
    // 文件输出
    new winston.transports.File({ 
      filename: path.join(logDir, 'combined.log')
    }),
    new winston.transports.File({ 
      filename: path.join(logDir, 'error.log'), 
      level: 'error' 
    })
  ]
});

export default logger; 