/**
 * API 工具函数
 * 用于统一管理 API 请求
 */
import { appConfig } from '../config'

/**
 * 获取后端基础 URL
 */
export const getBackendUrl = (): string => {
  return appConfig.backendUrl
}
/**
 * 获取前端基础 URL
 */
export const getFrontendUrl = (): string => {
  return appConfig.frontendUrl
}
