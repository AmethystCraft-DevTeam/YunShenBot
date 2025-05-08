// 插件配置文件
export interface PluginsConfig {
  [key: string]: boolean;
}

const pluginsConfig: PluginsConfig = {
  // 内置插件
  autoResponder: false,  // 自动回复插件
  pathfinder: true,      // 寻路插件
  chatLogger: true,      // 聊天记录插件
  
  // 添加自定义插件配置
  // yourPlugin: true,
};

export default pluginsConfig; 