/**
 * API 工具函数
 * 用于统一管理 API 请求
 */
import { appConfig } from '../config'

/**
 * 获取完整的 API 地址
 * @param path API 路径，例如 '/api/user'
 * @returns 完整的 API URL
 */
export const getApiUrl = (path: string): string => {
  // 确保 path 以 / 开头
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  // 确保 backendUrl 不以 / 结尾
  const baseUrl = appConfig.backendUrl.replace(/\/$/, '')
  return `${baseUrl}${normalizedPath}`
}

/**
 * 获取后端基础 URL
 */
export const getBackendUrl = (): string => {
  return appConfig.backendUrl
}

