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
  avatarUrl?: string
  // 可选的角色字段（后端返回时可能携带），支持 roleType 数组或简单的字符串/数字 id 列表
  roles?: roleType[] | Array<string | number>
}

export interface userListType {
  user: userType
  roles?: roleType[]
}
