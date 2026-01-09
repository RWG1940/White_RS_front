import apiClient from '../api/index'
import { message } from 'ant-design-vue'

const resolveId = (data: any) => data?.id ?? data?.Id ?? data?.ID ?? data?.userId

export const createCRUDService = (basePath: string) => ({
  // 获取单个数据
  get: (id: number) => apiClient.get(`${basePath}/${id}`),
  // 获取所有数据
  getAll: () => apiClient.get(`${basePath}/list`),

  // 获取分页数据（后端使用 MyBatis-Plus Page<T> 结构）
  getPages: (page: number, pageSize: number) =>
    apiClient.get(`${basePath}/page`, {
      params: { current: page, size: pageSize },
    }),

  // 搜索数据，使用 column/keyword 模糊查询
  search: (params: { column: string; keyword: string }) =>
    apiClient.get(`${basePath}/search`, {
      params,
    }),
  // 精确查询数据，使用 column/value 精确查询
  exact: (params: { column: string; value: string }) =>
    apiClient.get(`${basePath}/exact`, {
      params,
    }),
  // 添加数据
  add: (data: any) => apiClient.post(basePath, data),

  // 批量新增
  addBatch: (list: any[]) => apiClient.post(`${basePath}/batch`, list),

  // 更新数据 => PUT /resource/{id}
  update: (data: any) => {
    const id = resolveId(data)
    if (id === undefined || id === null) {
       message.info('缺少主键id')
    }
    return apiClient.put(`${basePath}/${id}`, data)
  },

  // 删除数据 => DELETE /resource/{id} 或 /resource/batch
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
