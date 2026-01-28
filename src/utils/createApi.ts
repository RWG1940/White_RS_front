import apiClient from '../api/index'
import { message } from 'ant-design-vue'

// 自动解析主键
const resolveId = (data: any) =>
  data?.id ?? data?.Id ?? data?.ID ?? data?.userId

export const createCRUDService = (basePath: string) => ({
  /* ================= 基础 CRUD ================= */

  // 根据 ID 查询
  get: (id: number) => apiClient.get(`${basePath}/${id}`),

  // 查询全部
  getAll: () => apiClient.get(basePath),

  // 分页查询（无条件）
  getPages: (page: number, pageSize: number) =>
    apiClient.get(`${basePath}/page`, {
      params: { current: page, size: pageSize },
    }),

  // 条件分页查询
  getPagesByCondition: (
    page: number,
    pageSize: number,
    conditions: Record<string, any>,
  ) =>
    apiClient.post(`${basePath}/query/page`, {
      current: page,
      size: pageSize,
      conditions,
    }),

  /* ================= 查询类 ================= */

  // 模糊查询
  queryLike: (conditions: Record<string, string>) =>
    apiClient.post(`${basePath}/query/like`, {
      conditions,
    }),

  // 精确查询
  queryEq: (conditions: Record<string, any>) =>
    apiClient.post(`${basePath}/query/eq`, {
      conditions,
    }),

  /* ================= 写操作 ================= */

  // 新增
  add: (data: any) => apiClient.post(basePath, data),

  // 批量新增
  addBatch: (list: any[]) => apiClient.post(`${basePath}/batch`, list),

  // 更新
  update: (data: any) => {
    const id = resolveId(data)
    if (id === undefined || id === null) {
      message.warning('缺少主键 id')
      return Promise.reject('Missing id')
    }
    return apiClient.put(`${basePath}/${id}`, data)
  },

  // 删除（单 / 批）
  delete: (ids: any[]) => {
    if (!Array.isArray(ids) || ids.length === 0) {
      return Promise.resolve()
    }
    if (ids.length === 1) {
      return apiClient.delete(`${basePath}/${ids[0]}`)
    }
    return apiClient.delete(`${basePath}/batch`, {
      data: ids,
    })
  },

  // 统计数量
  count: () => apiClient.get(`${basePath}/count`),
})
