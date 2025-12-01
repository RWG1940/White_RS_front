import apiClient from '../api/index'

const resolveId = (data: any) => data?.id ?? data?.Id ?? data?.ID ?? data?.userId

export const createCRUDService = (basePath: string) => ({
  // 获取所有数据
  getAll: () => apiClient.get(`${basePath}/list`),

  // 获取分页数据（后端使用 MyBatis-Plus Page<T> 结构）
  getPages: (page: number, pageSize: number) =>
    apiClient.get(`${basePath}/page`, {
      params: { current: page, size: pageSize },
    }),

  // 搜索数据，使用 column/keyword 查询
  search: (params: { column: string; keyword: string }) =>
    apiClient.get(`${basePath}/search`, {
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
      throw new Error(`update 调用缺少 id 字段`)
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
