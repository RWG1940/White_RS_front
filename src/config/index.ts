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

// 生产配置
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
  backendUrl: 'http://192.168.24.77:8080',
  enableDebug: true,
  bottomText: 'Copyright © 2025 数字技术部 All Rights Reserved.',
  frontendUrl: 'http://192.168.24.77:8888',
}

// 根据环境选择配置
const getConfig = (): AppConfig => {
  const isDev = 0
  if (isDev == 0) {
    return {
      ...developConfig,
    }
  } else {
    return {
      ...productConfig,
    }
  }
}

// 导出配置实例
export const appConfig = getConfig()

// 导出配置更新函数（如果需要动态更新）
export const updateConfig = (newConfig: Partial<AppConfig>) => {
  Object.assign(appConfig, newConfig)
}
