# 云深 Bot 框架 (YunShen Bot Framework)

> 松下问童子，言师采药去。只在此山中，云深不知处。

一个基于mineflayer的模块化、现代化Minecraft机器人框架。

## 特性

- **模块化设计**: 可以轻松地添加、移除和管理功能模块
- **插件系统**: 类似NoneBot的扫描式插件加载系统
- **事件系统**: 灵活的事件处理机制
- **命令系统**: 易于扩展的命令处理系统
- **配置灵活**: 通过JavaScript配置文件进行配置
- **可靠的日志**: 使用Winston进行日志记录
- **自动重连**: 与服务器断开连接后自动重新连接
- **TypeScript**: 使用TypeScript编写，提供良好的类型安全

## 安装

```bash
# 克隆仓库
git clone https://github.com/your-username/YunShenBot.git
cd YunShenBot

# 安装依赖
npm install

# 构建项目
npm run build
```

## 配置

在 `src/config/botConfig.ts` 文件中修改基本配置：

```typescript
// 机器人配置
const botConfig: BotConfig = {
  mc: {
    host: 'localhost',      // Minecraft服务器地址
    port: 25565,            // Minecraft服务器端口
    username: 'YunShenBot', // 机器人用户名
    password: undefined,    // 微软账号密码（如果需要）
  },
  logging: {
    level: 'info',          // 日志级别：debug, info, warn, error
  },
  bot: {
    prefix: '!',            // 命令前缀
    autoReconnect: true,    // 自动重连
    reconnectDelay: 5000,   // 重连延迟（毫秒）
  }
};
```

在 `src/config/plugins.config.ts` 文件中管理插件配置：

```typescript
const pluginsConfig: PluginsConfig = {
  // 内置插件
  autoResponder: false,  // 自动回复插件
  pathfinder: true,      // 寻路插件
  chatLogger: true,      // 聊天记录插件
  
  // 添加自定义插件配置
  // yourPlugin: true,
};
```

## 使用

```bash
# 构建并启动机器人
npm run build
npm start

# 或者使用开发模式（不需要构建）
npm run dev
```

## 开发指南

### 目录结构

```
YunShenBot/
├── src/
│   ├── config/       - 配置相关
│   ├── core/         - 核心功能
│   ├── events/       - 事件处理器
│   ├── modules/      - 内置功能模块
│   │   └── commands/ - 命令
│   ├── plugins/      - 插件系统和内置插件
│   └── utils/        - 工具函数
├── dist/             - 编译后的文件
└── docs/             - 文档
```

### 插件系统

云深Bot框架使用类似NoneBot的插件系统，只需将插件文件放入`plugins`目录，系统会自动扫描并加载。

创建一个简单的插件：

```typescript
// myPlugin.plugin.ts
import { Bot } from 'mineflayer';
import { Plugin } from '../src/plugins/PluginManager';
import logger from '../src/utils/logger';

export class MyPlugin implements Plugin {
  name = 'myPlugin';  // 插件名称
  description = '我的插件';
  enabled = true;     // 默认启用状态
  
  init(bot: Bot): void {
    logger.info('我的插件已初始化');
  }
  
  onEnable(bot: Bot): void {
    // 当插件启用时执行...
  }
  
  onDisable(bot: Bot): void {
    // 当插件禁用时执行...
  }
}

export default new MyPlugin();
```

详细的插件开发指南请查看 [docs/plugin-guide.md](docs/plugin-guide.md)

## 许可证

GPL-3.0