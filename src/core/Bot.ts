import mineflayer, { Bot } from 'mineflayer';
import { EventManager } from '../events/EventManager';
import { ModuleManager } from '../modules/ModuleManager';
import { config } from '../config/config';
import logger from '../utils/logger';
import commandManager from '../modules/CommandManager';
import HelpCommand from '../modules/commands/HelpCommand';
import StatusCommand from '../modules/commands/StatusCommand';

export class YunShenBot {
  private bot: Bot | null = null;
  private eventManager: EventManager | null = null;
  private moduleManager: ModuleManager | null = null;
  private reconnectAttempts = 0;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private isShuttingDown = false;

  constructor() {
    // 处理退出信号
    process.on('SIGINT', () => this.shutdown());
    process.on('SIGTERM', () => this.shutdown());
  }

  // 启动机器人
  async start(): Promise<void> {
    try {
      logger.info('正在启动云深机器人...');
      logger.info(`尝试连接到服务器: ${config.mc.host}:${config.mc.port}`);

      // 创建mineflayer机器人实例
      this.bot = mineflayer.createBot({
        host: config.mc.host,
        port: config.mc.port,
        username: config.mc.username,
        password: config.mc.password,
        auth: config.mc.password ? 'microsoft' : 'offline',
        version: 'auto',
        keepAlive: true,
        checkTimeoutInterval: 60 * 1000, // 1分钟
        respawn: true
      });

      // 初始化事件管理器
      this.eventManager = new EventManager(this.bot);
      
      // 注册核心事件监听
      this.setupEvents();
      
      // 等待登录成功
      await new Promise<void>((resolve, reject) => {
        this.bot?.once('login', () => resolve());
        this.bot?.once('error', (err) => reject(err));
        
        // 超时处理
        const timeout = setTimeout(() => {
          reject(new Error('登录超时'));
        }, 30000); // 30秒超时
        
        this.bot?.once('login', () => clearTimeout(timeout));
      });
      
      logger.info(`登录成功! 机器人名称: ${this.bot?.username}`);
      
      // 初始化模块管理器
      this.moduleManager = new ModuleManager(this.bot);
      
      // 注册命令管理器
      this.moduleManager.register(commandManager);
      
      // 注册命令
      this.registerCommands();
      
      // 启用命令管理器
      await this.moduleManager.enableModule('CommandManager');
      
      // 从模块目录加载模块
      const modulesLoaded = await this.moduleManager.loadModules('dist/modules');
      logger.info(`已加载 ${modulesLoaded} 个模块`);
      
      // 加载事件处理器
      await this.eventManager.loadEvents('dist/events');
      
      // 重置重连计数
      this.reconnectAttempts = 0;
      
      logger.info('云深机器人初始化完成!');
    } catch (error) {
      logger.error(`启动失败: ${error}`);
      
      if (config.bot.autoReconnect && !this.isShuttingDown) {
        this.reconnect();
      }
    }
  }

  // 注册事件处理
  private setupEvents(): void {
    if (!this.bot || !this.eventManager) return;
    
    // 处理断开连接
    this.bot.on('end', (reason) => {
      logger.warn(`断开连接: ${reason}`);
      
      if (config.bot.autoReconnect && !this.isShuttingDown) {
        this.reconnect();
      }
    });
    
    // 处理错误
    this.bot.on('error', (error) => {
      logger.error(`发生错误: ${error}`);
    });
    
    // 处理踢出
    this.bot.on('kicked', (reason, loggedIn) => {
      logger.warn(`被踢出服务器 (${loggedIn ? '已登录' : '未登录'}): ${reason}`);
      
      if (config.bot.autoReconnect && !this.isShuttingDown) {
        this.reconnect();
      }
    });
    
    // 机器人死亡
    this.bot.on('death', () => {
      const position = this.bot?.entity?.position;
      if (position) {
        logger.info(`机器人死亡，位置: X=${Math.floor(position.x)}, Y=${Math.floor(position.y)}, Z=${Math.floor(position.z)}`);
      } else {
        logger.info('机器人死亡');
      }
    });
  }

  // 重新连接
  private reconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    
    this.reconnectAttempts++;
    const delay = Math.min(
      config.bot.reconnectDelay * Math.pow(1.5, this.reconnectAttempts - 1),
      300000 // 最大5分钟
    );
    
    logger.info(`将在 ${Math.floor(delay / 1000)} 秒后尝试重新连接 (尝试 #${this.reconnectAttempts})...`);
    
    this.reconnectTimeout = setTimeout(() => {
      this.start();
    }, delay);
  }

  // 注册命令
  private registerCommands(): void {
    if (!commandManager) return;
    
    // 注册内置命令
    commandManager.registerCommands([
      HelpCommand,
      StatusCommand
    ]);
  }

  // 关闭机器人
  async shutdown(): Promise<void> {
    logger.info('正在关闭云深机器人...');
    this.isShuttingDown = true;
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    // 禁用所有模块
    if (this.moduleManager) {
      for (const module of this.moduleManager.getAllModules()) {
        if (module.enabled) {
          await this.moduleManager.disableModule(module.name);
        }
      }
    }
    
    // 断开连接
    if (this.bot) {
      this.bot.quit();
      this.bot.end();
    }
    
    // 等待日志输出
    setTimeout(() => {
      logger.info('云深机器人已安全关闭');
      process.exit(0);
    }, 1000);
  }
} 