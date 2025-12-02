// 用户数据结构
export interface userType {
  id?: number
  userId?: number // 后端返回的 userId
  username?: string
  passwordHash?: string
  status?: number
  onlineStatus?: boolean
  version?: number
  created_at?: string
  createdAt?: string
  updated_at?: string
  email?: string
  phone?: string
  last_login_at?: string
  last_login_ip?: string
  profile?: string
  deleted_at?: string
  roles?: string[] // 角色代码列表
}
