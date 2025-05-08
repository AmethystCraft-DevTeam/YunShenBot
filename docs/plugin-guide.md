# 云深Bot插件开发指南

本指南将帮助你为云深Bot开发插件。

## 插件结构

每个插件都应该是单独的TypeScript或JavaScript文件，并遵循以下规范：

1. 实现 `Plugin` 接口（继承自 `BotModule`）
2. 导出一个默认的插件实例
3. 文件名建议使用 `.plugin.ts` 或 `.plugin.js` 作为后缀

基本的插件模板：

```typescript
import { Bot } from 'mineflayer';
import { Plugin } from '../src/plugins/PluginManager';
import logger from '../src/utils/logger';

export class MyPlugin implements Plugin {
  // 插件名称（必须唯一）
  name = 'myPlugin';
  
  // 插件描述
  description = '我的第一个插件';
  
  // 是否默认启用
  enabled = true;
  
  private bot: Bot | null = null;
  
  // 初始化插件（只会调用一次）
  init(bot: Bot): void {
    this.bot = bot;
    logger.info('我的插件已初始化');
  }
  
  // 启用插件
  onEnable(bot: Bot): void {
    this.bot = bot;
    
    // 在这里注册事件监听器或其他功能
    this.bot.on('chat', (username, message) => {
      if (username === this.bot?.username) return;
      
      if (message === '!hello') {
        this.bot.chat(`你好，${username}！`);
      }
    });
    
    logger.info('我的插件已启用');
  }
  
  // 禁用插件
  onDisable(bot: Bot): void {
    // 在这里清理资源，比如移除事件监听器
    
    logger.info('我的插件已禁用');
  }
  
  // 额外的插件方法...
}

// 导出插件实例
export default new MyPlugin();
```

## 插件安装

1. 将插件文件放置在 `plugins` 目录中
2. 在 `src/config/plugins.config.ts` 中配置是否启用插件：

```typescript
const pluginsConfig: PluginsConfig = {
  // 其他插件...
  myPlugin: true,  // 启用插件
};
```

3. 重新构建并运行机器人

## 插件开发最佳实践

1. **命名规范**：
   - 插件名称使用 camelCase 格式
   - 文件名使用 `.plugin.ts` 后缀

2. **配置选项**：
   - 可以使用 `config.plugins` 访问插件的启用状态
   - 如需额外配置选项，可以扩展配置文件结构

3. **事件处理**：
   - 在 `onEnable` 中注册事件监听器
   - 在 `onDisable` 中移除事件监听器

4. **错误处理**：
   - 始终使用 try/catch 处理可能的错误
   - 使用 logger 记录错误信息

5. **资源管理**：
   - 在 `onDisable` 中释放所有资源（如文件句柄、定时器等）

## 插件通信

插件可以通过以下方式与其他插件交互：

1. **全局事件**：使用 Bot 的事件系统
2. **直接引用**：直接导入其他插件的实例
3. **共享状态**：使用共享的数据结构

## 示例插件

请参考 `src/plugins` 目录中的示例插件：

- `autoResponder.plugin.ts` - 自动回复插件
- `pathfinder.plugin.ts` - 寻路导航插件
- `chatLogger.plugin.ts` - 聊天记录插件

## 调试技巧

1. 设置日志级别为 `debug`：在 `botConfig.ts` 中将 `logging.level` 设为 `"debug"`
2. 使用 `logger.debug` 输出调试信息
3. 使用 `npm run dev` 以开发模式运行机器人 