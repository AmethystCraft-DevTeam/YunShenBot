import { Bot } from 'mineflayer';
import { Command } from '../CommandManager';
import commandManager from '../CommandManager';

const HelpCommand: Command = {
  name: 'help',
  description: '显示所有可用命令或指定命令的帮助信息',
  usage: '!help [命令名]',
  aliases: ['?', 'commands'],
  
  async execute(bot: Bot, username: string, args: string[]): Promise<void> {
    // 如果指定了命令名，显示该命令的详细帮助
    if (args.length > 0) {
      const commandName = args[0].toLowerCase();
      const command = commandManager.getCommand(commandName);
      
      if (!command) {
        bot.chat(`找不到命令: ${commandName}`);
        return;
      }
      
      bot.chat(`命令: ${command.name}`);
      bot.chat(`描述: ${command.description}`);
      bot.chat(`用法: ${command.usage}`);
      
      if (command.aliases && command.aliases.length > 0) {
        bot.chat(`别名: ${command.aliases.join(', ')}`);
      }
      
      return;
    }
    
    // 否则，显示所有命令的列表
    const commands = commandManager.getAllCommands();
    const prefix = commandManager.getPrefix();
    
    bot.chat(`=== 可用命令列表 (${commands.length}) ===`);
    
    const commandGroups: { [key: string]: Command[] } = {};
    
    // 将命令分组，每组最多5个命令
    commands.forEach((command, index) => {
      const groupIndex = Math.floor(index / 5);
      if (!commandGroups[groupIndex]) {
        commandGroups[groupIndex] = [];
      }
      commandGroups[groupIndex].push(command);
    });
    
    // 发送分组后的命令列表
    Object.values(commandGroups).forEach((group, index) => {
      const commandList = group.map(cmd => `${prefix}${cmd.name}`).join(', ');
      bot.chat(`${commandList}`);
    });
    
    bot.chat(`输入 ${prefix}help <命令名> 获取特定命令的详细帮助`);
  }
};

export default HelpCommand; 