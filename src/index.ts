import { YunShenBot } from './core/Bot';
import logger from './utils/logger';

// 应用程序入口点
async function main() {
  try {
    // 显示启动横幅
    console.log(`
    ╭──────────────────────────────────╮
    │                                  │
    │          云深 Bot 框架           │
    │     YunShen Bot Framework        │
    │        基于 mineflayer           │
    │                                  │
    ╰──────────────────────────────────╯
    `);
    
    // 创建并启动机器人
    const bot = new YunShenBot();
    await bot.start();
    
  } catch (error) {
    logger.error(`主程序出错: ${error}`);
    process.exit(1);
  }
}

// 启动应用
main().catch(error => {
  console.error('致命错误:', error);
  process.exit(1);
}); 