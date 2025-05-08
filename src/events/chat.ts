import { Bot } from 'mineflayer';
import { EventHandler } from './EventManager';
import logger from '../utils/logger';
import { config } from '../config/config';

const chatHandler: EventHandler = {
  name: 'chat',
  
  execute(bot: Bot, username: string, message: string): void {
    // 忽略自己发送的消息
    if (username === bot.username) return;
    
    // 记录聊天消息
    logger.info(`聊天: <${username}> ${message}`);
    
    // 如果有人提到机器人的名字但不是命令，回应
    if (
      message.toLowerCase().includes(bot.username.toLowerCase()) && 
      !message.startsWith(config.bot.prefix)
    ) {
      bot.chat(`${username}，你好！如需帮助，请输入 ${config.bot.prefix}help`);
    }
  }
};

export default chatHandler; 