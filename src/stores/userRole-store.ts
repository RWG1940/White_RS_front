import { ref } from 'vue'
import { createCRUDStore } from '@/utils/createStore'
import { userRoleApi } from '@/api/services/userRole-api'
import type { UserRole } from '@/types/userRole-type'

// 创建基本CRUD Store
export const userRoleStore = createCRUDStore('userRole-store', userRoleApi)()
// 表单数据
export const addFormData = ref<UserRole>({})
export const editFormData = ref<UserRole>({})
