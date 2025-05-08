import { Bot } from 'mineflayer';
import { EventHandler } from './EventManager';
import logger from '../utils/logger';

const loginHandler: EventHandler = {
  name: 'login',
  
  execute(bot: Bot): void {
    logger.info(`机器人已成功登录: ${bot.username}`);
    
    // 发送欢迎消息
    setTimeout(() => {
      bot.chat('云深机器人已上线! 输入 !help 获取帮助。');
    }, 2000); // 延迟2秒发送消息，以确保服务器已经准备好接收消息
  }
};

export default loginHandler; 