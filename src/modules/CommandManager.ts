import { Bot } from 'mineflayer';
import { BotModule } from './ModuleManager';
import { config } from '../config/config';
import logger from '../utils/logger';

// 命令接口
export interface Command {
  name: string;
  description: string;
  usage: string;
  aliases?: string[];
  permission?: string;
  execute: (bot: Bot, username: string, args: string[]) => void | Promise<void>;
}

export class CommandManager implements BotModule {
  name = 'CommandManager';
  description = '管理和处理机器人命令';
  enabled = true;
  
  private bot: Bot | null = null;
  private commands: Map<string, Command> = new Map();
  private aliases: Map<string, string> = new Map();
  private prefix: string = config.bot.prefix;
  
  // 初始化
  init(bot: Bot): void {
    this.bot = bot;
    logger.info('命令管理器已初始化');
  }
  
  // 启用
  onEnable(bot: Bot): void {
    this.bot = bot;
    
    // 注册消息事件监听
    if (this.bot) {
      this.bot.on('chat', (username, message) => {
        // 忽略自己发送的消息
        if (username === this.bot?.username) return;
        
        // 检查是否是命令 (以前缀开头)
        if (message.startsWith(this.prefix)) {
          this.handleCommand(username, message);
        }
      });
    }
    
    logger.info('命令管理器已启用');
  }
  
  // 禁用
  onDisable(bot: Bot): void {
    // 移除所有事件监听
    if (this.bot) {
      // @ts-ignore
      this.bot.removeAllListeners('chat');
    }
    logger.info('命令管理器已禁用');
  }
  
  // 注册命令
  registerCommand(command: Command): void {
    if (this.commands.has(command.name)) {
      logger.warn(`命令 ${command.name} 已经注册，将被覆盖`);
    }
    
    this.commands.set(command.name.toLowerCase(), command);
    
    // 注册别名
    if (command.aliases && command.aliases.length > 0) {
      command.aliases.forEach(alias => {
        this.aliases.set(alias.toLowerCase(), command.name.toLowerCase());
      });
    }
    
    logger.debug(`已注册命令: ${command.name} - ${command.description}`);
  }
  
  // 注册多个命令
  registerCommands(commands: Command[]): void {
    commands.forEach(command => this.registerCommand(command));
  }
  
  // 获取命令
  getCommand(name: string): Command | undefined {
    name = name.toLowerCase();
    
    // 直接查找命令
    const command = this.commands.get(name);
    if (command) return command;
    
    // 通过别名查找
    const originalName = this.aliases.get(name);
    if (originalName) {
      return this.commands.get(originalName);
    }
    
    return undefined;
  }
  
  // 获取所有命令
  getAllCommands(): Command[] {
    return Array.from(this.commands.values());
  }
  
  // 处理命令
  private async handleCommand(username: string, message: string): Promise<void> {
    if (!this.bot) {
      logger.error('Bot实例未初始化，无法处理命令');
      return;
    }
    
    // 去掉前缀并分割参数
    const args = message.slice(this.prefix.length).trim().split(/\s+/);
    const commandName = args.shift()?.toLowerCase();
    
    if (!commandName) return;
    
    const command = this.getCommand(commandName);
    
    if (!command) {
      // 命令不存在
      this.bot.chat(`未知命令: ${commandName}。输入 ${this.prefix}help 获取帮助。`);
      return;
    }
    
    // 执行命令
    try {
      await command.execute(this.bot, username, args);
      logger.debug(`${username} 执行了命令: ${commandName} ${args.join(' ')}`);
    } catch (error) {
      logger.error(`执行命令 ${commandName} 出错: ${error}`);
      this.bot.chat(`执行命令出错: ${error}`);
    }
  }
  
  // 设置命令前缀
  setPrefix(prefix: string): void {
    this.prefix = prefix;
    logger.info(`命令前缀已设置为: ${prefix}`);
  }
  
  // 获取命令前缀
  getPrefix(): string {
    return this.prefix;
  }
}

// 导出默认实例
export default new CommandManager(); 