import { Bot } from 'mineflayer';
import { BotModule } from './ModuleManager';
import logger from '../utils/logger';
import { config } from '../config/config';
import fs from 'fs';
import path from 'path';

export class ChatLogger implements BotModule {
  name = 'ChatLogger';
  description = '记录聊天消息到文件';
  enabled = config.plugins?.chatLogger ?? false;
  
  private bot: Bot | null = null;
  private logStream: fs.WriteStream | null = null;
  private logDir: string = path.join(process.cwd(), 'logs', 'chat');
  
  // 初始化
  init(bot: Bot): void {
    this.bot = bot;
    
    // 确保日志目录存在
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
    
    logger.info('聊天记录模块已初始化');
  }
  
  // 启用模块
  onEnable(bot: Bot): void {
    this.bot = bot;
    
    // 创建日志文件
    const now = new Date();
    const fileName = `chat_${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}.log`;
    const logFile = path.join(this.logDir, fileName);
    
    this.logStream = fs.createWriteStream(logFile, { flags: 'a' });
    
    // 写入日志头
    this.logStream.write(`=== 聊天记录开始: ${now.toLocaleString()} ===\n`);
    
    // 注册聊天监听
    bot.on('chat', (username, message) => {
      this.logChat(username, message);
    });
    
    logger.info(`聊天记录模块已启用，记录到 ${logFile}`);
  }
  
  // 禁用模块
  onDisable(bot: Bot): void {
    // 写入结束标记并关闭文件
    if (this.logStream) {
      const now = new Date();
      this.logStream.write(`=== 聊天记录结束: ${now.toLocaleString()} ===\n`);
      this.logStream.end();
      this.logStream = null;
    }
    
    logger.info('聊天记录模块已禁用');
  }
  
  // 记录聊天消息
  private logChat(username: string, message: string): void {
    if (!this.logStream) return;
    
    const timestamp = new Date().toLocaleTimeString();
    const logLine = `[${timestamp}] <${username}> ${message}\n`;
    
    this.logStream.write(logLine);
  }
}

// 导出模块实例
export default new ChatLogger(); 