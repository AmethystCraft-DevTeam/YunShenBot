import { BotConfig } from './config';

// 机器人配置示例
// 复制此文件为 botConfig.ts 并根据需要修改
const botConfig: BotConfig = {
  mc: {
    host: 'localhost',      // Minecraft服务器地址
    port: 25565,            // Minecraft服务器端口
    username: 'YunShenBot', // 机器人用户名
    password: undefined,    // 微软账号密码（如果需要）
  },
  logging: {
    level: 'info',          // 日志级别：debug, info, warn, error
  },
  bot: {
    prefix: '!',            // 命令前缀
    autoReconnect: true,    // 自动重连
    reconnectDelay: 5000,   // 重连延迟（毫秒）
  }
};

export default botConfig; 