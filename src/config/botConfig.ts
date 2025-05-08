import { BotConfig } from './config';

// 机器人配置
const botConfig: BotConfig = {
  mc: {
    host: 'localhost',
    port: 25565,
    username: 'YunShenBot',
    password: undefined,
  },
  logging: {
    level: 'info',
  },
  bot: {
    prefix: '!',
    autoReconnect: true,
    reconnectDelay: 5000,
  },
};

export default botConfig; 