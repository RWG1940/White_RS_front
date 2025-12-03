import { ref } from 'vue'
import { createCRUDStore } from '@/utils/createStore'
import { userApi, updateUserWithRoles as apiUpdateUserWithRoles, addUserWithRoles as apiAddUserWithRoles } from '@/api/services/user-api'
import type { userType } from '@/types/user-type'

// 创建基本CRUD Store
export const userStore = createCRUDStore('user-store', userApi)()

// 表单数据
export const addFormData = ref<userType>({})
export const editFormData = ref<userType>({})

// 包装后的方法，使用包含角色关系的专用 API
export const createUserWithRoles = async (user: any) => {
  return apiAddUserWithRoles(user)
}

export const updateUserWithRoles = async (user: any) => {
  return apiUpdateUserWithRoles(user)
}

