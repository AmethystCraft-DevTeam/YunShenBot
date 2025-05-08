import botConfig from './botConfig';

// 配置接口
export interface BotConfig {
  // Minecraft服务器配置
  mc: {
    host: string;
    port: number;
    username: string;
    password?: string;
  };
  // 日志配置
  logging: {
    level: string;
  };
  // 机器人行为配置
  bot: {
    prefix: string;
    autoReconnect: boolean;
    reconnectDelay: number;
  };
}

// 默认配置
const defaultConfig: BotConfig = {
  mc: {
    host: 'localhost',
    port: 25565,
    username: 'bot',
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

// 合并默认配置和用户配置
export const config: BotConfig = {
  ...defaultConfig,
  ...botConfig,
  // 确保嵌套对象也被正确合并
  mc: { ...defaultConfig.mc, ...botConfig.mc },
  logging: { ...defaultConfig.logging, ...botConfig.logging },
  bot: { ...defaultConfig.bot, ...botConfig.bot },
}; 