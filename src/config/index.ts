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
  // 底部文字
  bottomText: string
  // 前端路径
  frontendUrl: string
}

// 生产配置(辅料进度系统)
const productConfig: AppConfig = {
  siteTitle: '利拉辅料系统',
  browserTitle: '利拉辅料系统',
  frontendPort: 8888,
  backendUrl: '/api',
  enableDebug: false,
  bottomText: 'Copyright © 2025 优鼎 All Rights Reserved.',
  frontendUrl: 'http://123.157.20.70:25080',
}

// 开发配置
const developConfig: AppConfig = {
  siteTitle: '开发测试系统',
  browserTitle: '开发测试系统',
  frontendPort: 8888,
  backendUrl: 'http://192.168.24.77:8777',
  enableDebug: true,
  bottomText: 'Copyright © 2025 数字技术部 All Rights Reserved.',
  frontendUrl: 'http://192.168.24.77:8888',
}

// ai项目配置
const aiConfig: AppConfig = {
  siteTitle: 'Ai多功能系统',
  browserTitle: 'Ai多功能系统',
  frontendPort: 8888,
  backendUrl: '/api',
  enableDebug: true,
  bottomText: 'Copyright © 2025 AIRWG All Rights Reserved.',
  frontendUrl: 'http://123.157.20.70:28888',
}

// 大华项目配置
const dhConfig: AppConfig = {
  siteTitle: '智能考勤管理系统',
  browserTitle: '智能考勤管理系统',
  frontendPort: 8888,
  backendUrl: '/api',
  enableDebug: true,
  bottomText: 'Copyright © 2025 AIRWG All Rights Reserved.',
  frontendUrl: 'http://123.157.20.70:28888',
}
// 根据环境选择配置
const getConfig = (): AppConfig => {
  return {
    //...productConfig,
    //...developConfig,
    ...dhConfig,
    //...aiConfig,
  }
}

// 导出配置实例
export const appConfig = getConfig()
