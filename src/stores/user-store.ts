import { ref } from 'vue'
import { createCRUDStore } from '@/utils/createStore'
import { userApi, updateUserWithRoles as apiUpdateUserWithRoles, addUserWithRoles as apiAddUserWithRoles } from '@/api/services/user-api'
import type { userType } from '@/types/user-type'

// 创建基本CRUD Store
export const userStore = createCRUDStore('user-store', userApi)()

// 表单数据
export const addFormData = ref<userType>({})
export const editFormData = ref<userType>({})

// 搜索选项
export const userSearchSelectOptions = [
  { label: '用户名', value: 'username' },
  { label: '邮箱', value: 'email' },
  { label: '手机号', value: 'phone' },
]
// 创建用户及其角色
export const createUserWithRoles = async (user: any) => {
  return apiAddUserWithRoles(user)
}
// 更新用户及其角色
export const updateUserWithRoles = async (user: any) => {
  return apiUpdateUserWithRoles(user)
}

