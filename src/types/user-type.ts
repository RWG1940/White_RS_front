import type{ roleType } from './role-type'

// 用户数据结构
export interface userType {
  id?: number
  userId?: number // 后端返回的 userId
  username?: string
  passwordHash?: string
  status?: number
  onlineStatus?: boolean
  version?: number
  createdAt?: string
  updatedAt?: string
  email?: string
  phone?: string
  lastLoginAt?: string
  lastLoginIp?: string
  profile?: string
  deletedAt?: string
}

export interface userListType {
  user: userType
  roles?: roleType[]
}
