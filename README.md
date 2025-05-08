# 云深 Bot 框架 (YunShen Bot Framework)

> 松下问童子，言师采药去。只在此山中，云深不知处。

一个基于mineflayer的模块化、现代化Minecraft机器人框架。

## 特性

- **模块化设计**: 可以轻松地添加、移除和管理功能模块
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

在 `src/config/botConfig.ts` 文件中修改配置：

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
  },
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
│   ├── modules/      - 功能模块
│   │   └── commands/ - 命令
│   └── utils/        - 工具函数
├── dist/             - 编译后的文件
```

### 创建自定义模块

1. 在`src/modules`目录下创建一个新文件:

```typescript
import { Bot } from 'mineflayer';
import { BotModule } from './ModuleManager';
import logger from '../utils/logger';

export class MyModule implements BotModule {
  name = 'MyModule';
  description = '我的自定义模块';
  enabled = true;
  
  // 初始化
  init(bot: Bot): void {
    logger.info('我的模块已初始化');
  }
  
  // 启用
  onEnable(bot: Bot): void {
    logger.info('我的模块已启用');
  }
  
  // 禁用
  onDisable(bot: Bot): void {
    logger.info('我的模块已禁用');
  }
}

// 导出模块实例
export default new MyModule();
```

### 创建自定义命令

在`src/modules/commands`目录下创建一个新文件:

```typescript
import { Bot } from 'mineflayer';
import { Command } from '../CommandManager';

const MyCommand: Command = {
  name: 'mycommand',
  description: '我的自定义命令',
  usage: '!mycommand [参数]',
  aliases: ['mc', 'mycmd'],
  
  execute(bot: Bot, username: string, args: string[]): void {
    bot.chat(`Hello, ${username}! 你使用了我的命令。`);
    if (args.length > 0) {
      bot.chat(`你提供的参数是: ${args.join(', ')}`);
    }
  }
};

export default MyCommand;
```

## 许可证

ISC © [您的姓名]