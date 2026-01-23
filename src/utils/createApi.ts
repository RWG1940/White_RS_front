import apiClient from '../api/index'
import { message } from 'ant-design-vue'
// 自动解析数据中的主键字段
const resolveId = (data: any) => data?.id ?? data?.Id ?? data?.ID ?? data?.userId

export const createCRUDService = (basePath: string) => ({
  // 获取单个数据
  get: (id: number) => apiClient.get(`${basePath}/${id}`),

  // 获取所有数据
  getAll: () => apiClient.get(`${basePath}/list`),

  // 获取分页数据
  getPages: (page: number, pageSize: number) =>
    apiClient.get(`${basePath}/page`, {
      params: { current: page, size: pageSize },
    }),

  // 获取分页数据 by 条件
  getPagesByCondition: (page: number, pageSize: number, condition: any) =>
    apiClient.post(
      `${basePath}/page/condition`,
      { ...condition },
      {
        params: { current: page, size: pageSize },
      },
    ),
  // 搜索数据
  search: (params: { column: string; keyword: string }) =>
    apiClient.get(`${basePath}/search`, {
      params,
    }),

  // 精确查询数据
  exact: (params: { column: string; value: string }) =>
    apiClient.get(`${basePath}/exact`, {
      params,
    }),

  // 添加数据
  add: (data: any) => apiClient.post(basePath, data),

  // 批量新增
  addBatch: (list: any[]) => apiClient.post(`${basePath}/batch`, list),

  // 更新数据
  update: (data: any) => {
    const id = resolveId(data)
    if (id === undefined || id === null) {
      message.info('缺少主键id')
    }
    return apiClient.put(`${basePath}/${id}`, data)
  },

  // 删除数据
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
})
