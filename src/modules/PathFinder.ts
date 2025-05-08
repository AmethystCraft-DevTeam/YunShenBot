import { Bot } from 'mineflayer';
import { BotModule } from './ModuleManager';
import logger from '../utils/logger';
import { config } from '../config/config';
import { pathfinder, Movements, goals } from 'mineflayer-pathfinder';

export class PathFinder implements BotModule {
  name = 'PathFinder';
  description = '提供寻路和导航功能';
  enabled = config.plugins?.pathfinder ?? false;
  
  private bot: Bot | null = null;
  
  // 初始化
  init(bot: Bot): void {
    this.bot = bot;
    logger.info('寻路模块已初始化');
  }
  
  // 启用模块
  onEnable(bot: Bot): void {
    this.bot = bot;
    
    // 加载pathfinder插件
    bot.loadPlugin(pathfinder);
    
    // 设置基本移动参数
    const movements = new Movements(bot);
    bot.pathfinder.setMovements(movements);
    
    // 注册命令监听 (例如: !goto x y z)
    bot.on('chat', (username, message) => {
      // 忽略自己发送的消息
      if (username === bot.username) return;
      
      // 处理goto命令
      const gotoMatch = message.match(/^!goto\s+(-?\d+)\s+(-?\d+)\s+(-?\d+)$/);
      if (gotoMatch) {
        const x = parseInt(gotoMatch[1]);
        const y = parseInt(gotoMatch[2]);
        const z = parseInt(gotoMatch[3]);
        
        this.navigateTo(x, y, z);
      }
      
      // 处理来指令 (到玩家所在位置)
      const comeMatch = message.match(/^!come$/);
      if (comeMatch) {
        this.goToPlayer(username);
      }
    });
    
    logger.info('寻路模块已启用');
  }
  
  // 禁用模块
  onDisable(bot: Bot): void {
    logger.info('寻路模块已禁用');
  }
  
  // 导航到指定坐标
  navigateTo(x: number, y: number, z: number): void {
    if (!this.bot) return;
    
    const goal = new goals.GoalBlock(x, y, z);
    
    this.bot.chat(`正在前往坐标: ${x}, ${y}, ${z}`);
    
    this.bot.pathfinder.setGoal(goal);
  }
  
  // 导航到玩家位置
  goToPlayer(username: string): void {
    if (!this.bot) return;
    
    const player = this.bot.players[username];
    
    if (!player || !player.entity) {
      this.bot.chat(`找不到玩家: ${username}`);
      return;
    }
    
    const { x, y, z } = player.entity.position;
    
    this.bot.chat(`正在前往玩家 ${username} 的位置`);
    
    // 设置目标为玩家位置
    const goal = new goals.GoalNear(x, y, z, 2); // 距离玩家2格以内视为到达
    this.bot.pathfinder.setGoal(goal);
  }
}

// 导出模块实例
export default new PathFinder(); 