import apiClient from '../api/index'

export const createCRUDService = (basePath:string) => ({
  // 获取所有数据
  getAll: () => apiClient.get(basePath),

  // 获取分页数据
  getPages: (page:number, pageSize:number) =>
    apiClient.get(`${basePath}/pages`, {
      params: { page, pageSize },
    }),

  // 搜索数据
  search: (data:any) =>
    apiClient.post(`${basePath}/search`, data),

  // 添加数据
  add: (data:any) =>
    apiClient.post(basePath, data),

  // 更新数据
  update: (data:any) =>
    apiClient.put(basePath, data),

  // 删除数据
  delete: (ids:any[]) =>
    apiClient.delete(basePath, {
      params: { ids: ids.join(',') },
    }),
});
