import { createCRUDService } from '@/utils/createApi'
import apiClient from '@/api/index'
import type { userType } from '@/types/user-type'

export const userApi = createCRUDService('/user')

const resolveId = (data: any) => data?.id ?? data?.Id ?? data?.ID ?? data?.userId

// 添加用户（包含角色关系） POST /user/dto?roleIds=1,2,3
export const addUserWithRoles = (user: any) => {
  const roleIds = (user?.roles || []).map((r: any) => r.id).filter(Boolean)
  const params: any = {}
  if (roleIds.length) params.roleIds = roleIds.join(',')
  return apiClient.post(`/user/dto`, user, { params })
}

// 更新用户（包含角色关系） PUT /user/dto/{id}?roleIds=1,2,3
export const updateUserWithRoles = (user: any) => {
  const id = resolveId(user)
  if (id === undefined || id === null) {
    return Promise.reject(new Error('缺少 id'))
  }
  const roleIds = (user?.roles || []).map((r: any) => r.id).filter(Boolean)
  const params: any = {}
  if (roleIds.length) params.roleIds = roleIds.join(',')
  return apiClient.put(`/user/dto/${id}`, user, { params })
}

