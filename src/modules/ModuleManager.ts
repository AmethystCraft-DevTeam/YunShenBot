import { Bot } from 'mineflayer';
import logger from '../utils/logger';
import path from 'path';
import fs from 'fs';

// 模块接口
export interface BotModule {
  name: string;
  description: string;
  enabled: boolean;
  init?: (bot: Bot) => void | Promise<void>;
  onEnable?: (bot: Bot) => void | Promise<void>;
  onDisable?: (bot: Bot) => void | Promise<void>;
}

export class ModuleManager {
  private bot: Bot;
  private modules: Map<string, BotModule> = new Map();
  
  constructor(bot: Bot) {
    this.bot = bot;
  }
  
  // 注册模块
  register(module: BotModule): void {
    if (this.modules.has(module.name)) {
      logger.warn(`模块 ${module.name} 已经注册，将被覆盖`);
    }
    
    this.modules.set(module.name, module);
    logger.debug(`已注册模块: ${module.name} - ${module.description}`);
  }
  
  // 获取模块
  getModule(name: string): BotModule | undefined {
    return this.modules.get(name);
  }
  
  // 获取所有模块
  getAllModules(): BotModule[] {
    return Array.from(this.modules.values());
  }
  
  // 启用模块
  async enableModule(name: string): Promise<boolean> {
    const module = this.modules.get(name);
    
    if (!module) {
      logger.warn(`尝试启用不存在的模块: ${name}`);
      return false;
    }
    
    if (module.enabled) {
      logger.debug(`模块 ${name} 已经是启用状态`);
      return true;
    }
    
    try {
      // 调用模块的onEnable方法
      if (module.onEnable) {
        await module.onEnable(this.bot);
      }
      
      module.enabled = true;
      logger.info(`已启用模块: ${name}`);
      return true;
    } catch (error) {
      logger.error(`启用模块 ${name} 失败: ${error}`);
      return false;
    }
  }
  
  // 禁用模块
  async disableModule(name: string): Promise<boolean> {
    const module = this.modules.get(name);
    
    if (!module) {
      logger.warn(`尝试禁用不存在的模块: ${name}`);
      return false;
    }
    
    if (!module.enabled) {
      logger.debug(`模块 ${name} 已经是禁用状态`);
      return true;
    }
    
    try {
      // 调用模块的onDisable方法
      if (module.onDisable) {
        await module.onDisable(this.bot);
      }
      
      module.enabled = false;
      logger.info(`已禁用模块: ${name}`);
      return true;
    } catch (error) {
      logger.error(`禁用模块 ${name} 失败: ${error}`);
      return false;
    }
  }
  
  // 从目录加载模块
  async loadModules(directory: string): Promise<number> {
    const modulesDir = path.join(process.cwd(), directory);
    
    if (!fs.existsSync(modulesDir)) {
      logger.warn(`模块目录不存在: ${modulesDir}`);
      return 0;
    }
    
    // 获取所有js/ts文件
    const moduleFiles = fs.readdirSync(modulesDir).filter(file => 
      (file.endsWith('.js') || file.endsWith('.ts')) && !file.endsWith('.d.ts')
    );
    
    let loadedCount = 0;
    
    for (const file of moduleFiles) {
      try {
        const filePath = path.join(modulesDir, file);
        const moduleExport = await import(filePath);
        const module: BotModule = moduleExport.default;
        
        if (!module || !module.name) {
          logger.warn(`模块无效: ${file}`);
          continue;
        }
        
        this.register(module);
        
        // 如果模块有初始化方法，调用它
        if (module.init) {
          await module.init(this.bot);
        }
        
        // 如果模块默认启用，则启用它
        if (module.enabled) {
          await this.enableModule(module.name);
        }
        
        loadedCount++;
        logger.info(`已加载模块: ${module.name} (${module.enabled ? '已启用' : '已禁用'}) 来自 ${file}`);
      } catch (error) {
        logger.error(`加载模块文件失败 ${file}: ${error}`);
      }
    }
    
    return loadedCount;
  }
  
  // 初始化所有模块
  async initializeAll(): Promise<void> {
    for (const module of this.modules.values()) {
      try {
        if (module.init) {
          await module.init(this.bot);
        }
        
        // 如果模块默认启用，则启用它
        if (module.enabled) {
          await this.enableModule(module.name);
        }
      } catch (error) {
        logger.error(`初始化模块 ${module.name} 失败: ${error}`);
      }
    }
  }
} 