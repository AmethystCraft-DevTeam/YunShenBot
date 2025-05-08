import { Bot } from 'mineflayer';
import { BotModule } from '../modules/ModuleManager';
import logger from '../utils/logger';
import { config } from '../config/config';
import fs from 'fs';
import path from 'path';

export interface Plugin extends BotModule {
  // 插件与模块接口相同，但可以在将来扩展更多插件特有的属性和方法
}

export class PluginManager {
  private bot: Bot;
  private plugins: Map<string, Plugin> = new Map();
  private pluginsDir: string;
  
  constructor(bot: Bot, pluginsDir: string = 'plugins') {
    this.bot = bot;
    // 支持绝对路径或相对路径
    this.pluginsDir = path.isAbsolute(pluginsDir) 
      ? pluginsDir 
      : path.join(process.cwd(), pluginsDir);
  }
  
  // 加载单个插件文件
  async loadPlugin(pluginPath: string): Promise<Plugin | null> {
    try {
      // 确保文件存在
      if (!fs.existsSync(pluginPath)) {
        logger.warn(`插件文件不存在: ${pluginPath}`);
        return null;
      }
      
      // 动态导入插件模块
      const pluginModule = await import(pluginPath);
      const plugin: Plugin = pluginModule.default;
      
      // 验证插件接口
      if (!plugin || !plugin.name) {
        logger.warn(`插件无效: ${pluginPath}`);
        return null;
      }
      
      // 注册插件
      this.registerPlugin(plugin);
      
      return plugin;
    } catch (error) {
      logger.error(`加载插件失败 ${pluginPath}: ${error}`);
      return null;
    }
  }
  
  // 扫描插件目录并加载所有插件
  async scanAndLoadPlugins(): Promise<number> {
    try {
      // 确保插件目录存在
      if (!fs.existsSync(this.pluginsDir)) {
        logger.warn(`插件目录不存在: ${this.pluginsDir}，正在创建...`);
        fs.mkdirSync(this.pluginsDir, { recursive: true });
        return 0;
      }
      
      // 读取目录中的所有文件
      const files = fs.readdirSync(this.pluginsDir);
      
      // 过滤出JS和TS文件
      const pluginFiles = files.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return (ext === '.js' || ext === '.ts') && !file.endsWith('.d.ts');
      });
      
      logger.info(`在 ${this.pluginsDir} 找到 ${pluginFiles.length} 个潜在插件文件`);
      
      // 加载每个插件
      let loadedCount = 0;
      for (const file of pluginFiles) {
        const pluginPath = path.join(this.pluginsDir, file);
        const plugin = await this.loadPlugin(pluginPath);
        
        if (plugin) {
          loadedCount++;
          
          // 如果插件默认启用，则初始化并启用它
          if (this.shouldEnablePlugin(plugin)) {
            await this.initAndEnablePlugin(plugin);
          }
        }
      }
      
      logger.info(`成功加载了 ${loadedCount} 个插件`);
      return loadedCount;
    } catch (error) {
      logger.error(`扫描插件目录失败: ${error}`);
      return 0;
    }
  }
  
  // 注册插件
  registerPlugin(plugin: Plugin): void {
    // 检查是否已存在同名插件
    if (this.plugins.has(plugin.name)) {
      logger.warn(`插件 ${plugin.name} 已存在，将被覆盖`);
    }
    
    // 添加到插件列表
    this.plugins.set(plugin.name, plugin);
    logger.debug(`已注册插件: ${plugin.name} - ${plugin.description}`);
  }
  
  // 获取插件
  getPlugin(name: string): Plugin | undefined {
    return this.plugins.get(name);
  }
  
  // 获取所有插件
  getAllPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }
  
  // 启用插件
  async enablePlugin(name: string): Promise<boolean> {
    const plugin = this.plugins.get(name);
    
    if (!plugin) {
      logger.warn(`尝试启用不存在的插件: ${name}`);
      return false;
    }
    
    if (plugin.enabled) {
      logger.debug(`插件 ${name} 已经启用`);
      return true;
    }
    
    try {
      if (plugin.onEnable) {
        await plugin.onEnable(this.bot);
      }
      
      plugin.enabled = true;
      logger.info(`已启用插件: ${name}`);
      return true;
    } catch (error) {
      logger.error(`启用插件 ${name} 失败: ${error}`);
      return false;
    }
  }
  
  // 禁用插件
  async disablePlugin(name: string): Promise<boolean> {
    const plugin = this.plugins.get(name);
    
    if (!plugin) {
      logger.warn(`尝试禁用不存在的插件: ${name}`);
      return false;
    }
    
    if (!plugin.enabled) {
      logger.debug(`插件 ${name} 已经禁用`);
      return true;
    }
    
    try {
      if (plugin.onDisable) {
        await plugin.onDisable(this.bot);
      }
      
      plugin.enabled = false;
      logger.info(`已禁用插件: ${name}`);
      return true;
    } catch (error) {
      logger.error(`禁用插件 ${name} 失败: ${error}`);
      return false;
    }
  }
  
  // 判断是否应该启用插件
  private shouldEnablePlugin(plugin: Plugin): boolean {
    // 先检查配置中是否有明确设置
    if (config.plugins && plugin.name.toLowerCase() in config.plugins) {
      const pluginName = plugin.name.toLowerCase();
      // @ts-ignore - 动态属性访问
      return !!config.plugins[pluginName];
    }
    
    // 如果配置中没有设置，则使用插件的默认值
    return plugin.enabled;
  }
  
  // 初始化并启用插件
  private async initAndEnablePlugin(plugin: Plugin): Promise<void> {
    try {
      // 初始化插件
      if (plugin.init) {
        await plugin.init(this.bot);
      }
      
      // 启用插件
      await this.enablePlugin(plugin.name);
    } catch (error) {
      logger.error(`初始化插件 ${plugin.name} 失败: ${error}`);
    }
  }
  
  // 关闭所有插件
  async disableAllPlugins(): Promise<void> {
    for (const plugin of this.plugins.values()) {
      if (plugin.enabled) {
        await this.disablePlugin(plugin.name);
      }
    }
  }
}

export default PluginManager; 