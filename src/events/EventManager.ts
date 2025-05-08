import { Bot } from 'mineflayer';
import logger from '../utils/logger';
import path from 'path';
import fs from 'fs';

// 事件处理器接口
export interface EventHandler {
  name: string;
  once?: boolean;
  execute: (bot: Bot, ...args: any[]) => void | Promise<void>;
}

export class EventManager {
  private bot: Bot;
  private events: Map<string, EventHandler[]> = new Map();

  constructor(bot: Bot) {
    this.bot = bot;
  }

  // 注册单个事件处理器
  register(event: string, handler: EventHandler): void {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    
    this.events.get(event)?.push(handler);
    
    if (handler.once) {
      // @ts-ignore
      this.bot.once(event, (...args) => this.handleEvent(event, handler, ...args));
    } else {
      // @ts-ignore
      this.bot.on(event, (...args) => this.handleEvent(event, handler, ...args));
    }
    
    logger.debug(`已注册事件: ${event} - ${handler.name}`);
  }

  // 注册多个事件处理器
  registerMultiple(handlers: { event: string, handler: EventHandler }[]): void {
    handlers.forEach(({ event, handler }) => {
      this.register(event, handler);
    });
  }

  // 从目录加载事件处理器
  async loadEvents(directory: string): Promise<void> {
    const eventsDir = path.join(process.cwd(), directory);
    
    if (!fs.existsSync(eventsDir)) {
      logger.warn(`事件目录不存在: ${eventsDir}`);
      return;
    }
    
    const eventFiles = fs.readdirSync(eventsDir).filter(file => 
      (file.endsWith('.js') || file.endsWith('.ts')) && !file.endsWith('.d.ts')
    );
    
    for (const file of eventFiles) {
      try {
        const filePath = path.join(eventsDir, file);
        const eventModule = await import(filePath);
        const handler: EventHandler = eventModule.default;
        const eventName = file.split('.')[0];
        
        if (!handler || !handler.execute || typeof handler.execute !== 'function') {
          logger.warn(`事件处理器无效: ${file}`);
          continue;
        }
        
        this.register(eventName, handler);
        logger.info(`已加载事件: ${eventName} 来自 ${file}`);
      } catch (error) {
        logger.error(`加载事件文件失败 ${file}: ${error}`);
      }
    }
  }

  // 处理事件
  private async handleEvent(event: string, handler: EventHandler, ...args: any[]): Promise<void> {
    try {
      await handler.execute(this.bot, ...args);
    } catch (error) {
      logger.error(`事件处理器执行错误 ${event} - ${handler.name}: ${error}`);
    }
  }
} 