import { Bot } from 'mineflayer';
import { BotModule } from './ModuleManager';
import logger from '../utils/logger';

export class AutoResponder implements BotModule {
  name = 'AutoResponder';
  description = '自动回复特定消息的模块';
  enabled = true;
  
  private bot: Bot | null = null;
  private patterns: Map<RegExp, string> = new Map();
  
  constructor() {
    // 添加一些默认回复模式
    this.addPattern(/你好|hello|hi/i, '你好！');
    this.addPattern(/机器人|bot/i, '我是云深Bot，很高兴为您服务！');
    this.addPattern(/天气怎么样|weather/i, '今天天气不错，适合挖矿！');
    this.addPattern(/谢谢|thanks/i, '不客气！');
  }
  
  // 初始化
  init(bot: Bot): void {
    this.bot = bot;
    logger.info('自动回复模块已初始化');
  }
  
  // 启用模块
  onEnable(bot: Bot): void {
    this.bot = bot;
    
    // 注册消息事件监听
    this.bot.on('chat', (username, message) => this.handleChat(username, message));
    
    logger.info('自动回复模块已启用');
  }
  
  // 禁用模块
  onDisable(bot: Bot): void {
    // 移除事件监听器
    if (this.bot) {
      // @ts-ignore: 忽略事件移除的类型问题
      this.bot.removeListener('chat', this.handleChat);
    }
    
    logger.info('自动回复模块已禁用');
  }
  
  // 添加回复模式
  addPattern(pattern: RegExp, response: string): void {
    this.patterns.set(pattern, response);
  }
  
  // 移除回复模式
  removePattern(pattern: RegExp): boolean {
    return this.patterns.delete(pattern);
  }
  
  // 清除所有回复模式
  clearPatterns(): void {
    this.patterns.clear();
  }
  
  // 获取所有回复模式
  getPatterns(): Map<RegExp, string> {
    return new Map(this.patterns);
  }
  
  // 处理聊天消息
  private handleChat(username: string, message: string): void {
    // 忽略自己发送的消息
    if (!this.bot || username === this.bot.username) return;
    
    // 检查是否匹配任何回复模式
    for (const [pattern, response] of this.patterns.entries()) {
      if (pattern.test(message)) {
        // 延迟回复，使对话更自然
        setTimeout(() => {
          this.bot?.chat(`@${username} ${response}`);
        }, 1000 + Math.random() * 2000); // 1-3秒的随机延迟
        
        // 只匹配第一个模式
        break;
      }
    }
  }
}

// 导出模块实例
export default new AutoResponder(); 