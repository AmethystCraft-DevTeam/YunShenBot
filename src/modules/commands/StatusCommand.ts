import { Bot } from 'mineflayer';
import { Command } from '../CommandManager';

const StatusCommand: Command = {
  name: 'status',
  description: '显示机器人的状态信息',
  usage: '!status',
  aliases: ['stats', 'info'],
  
  execute(bot: Bot, username: string, args: string[]): void {
    const health = bot.health ? Math.floor(bot.health) : '未知';
    const food = bot.food !== undefined ? bot.food : '未知';
    const position = bot.entity ? 
      `X: ${Math.floor(bot.entity.position.x)}, Y: ${Math.floor(bot.entity.position.y)}, Z: ${Math.floor(bot.entity.position.z)}` : 
      '未知';
    const gamemode = bot.game.gameMode;
    const players = Object.keys(bot.players).length;
    const ping = bot.player?.ping || 0;
    
    bot.chat(`=== 机器人状态 ===`);
    bot.chat(`生命值: ${health}`);
    bot.chat(`饥饿值: ${food}`);
    bot.chat(`位置: ${position}`);
    bot.chat(`游戏模式: ${gamemode}`);
    bot.chat(`在线玩家: ${players}`);
    bot.chat(`延迟: ${ping}ms`);
  }
};

export default StatusCommand; 