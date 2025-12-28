/**
 * 全局配置文件
 * 用于配置网站标题、浏览器标签、端口等
 */

export interface AppConfig {
  // 网站标题名称
  siteTitle: string
  // 浏览器标签名称
  browserTitle: string
  // 访问端口（前端）
  frontendPort: number
  // 后端端口地址
  backendUrl: string
  // 是否启用调试输出
  enableDebug: boolean
}

// 默认配置
const defaultConfig: AppConfig = {
  siteTitle: '优鼎多功能系统',
  browserTitle: '优鼎多功能系统',
  frontendPort: 8888,
  //backendUrl: '/api',
  backendUrl: ' http://localhost:8080',
  enableDebug: true, // 生产环境建议设置为 false
}

// 从环境变量或本地存储中读取配置（可选）
// 这里可以根据需要扩展，比如从 .env 文件读取
const getConfig = (): AppConfig => {
  // 可以在这里添加从环境变量读取的逻辑
  // 例如：const envConfig = import.meta.env.VITE_APP_CONFIG

  return {
    ...defaultConfig,
    // 可以在这里覆盖默认配置
    // ...envConfig,
  }
}

// 导出配置实例
export const appConfig = getConfig()

// 导出配置更新函数（如果需要动态更新）
export const updateConfig = (newConfig: Partial<AppConfig>) => {
  Object.assign(appConfig, newConfig)
}
