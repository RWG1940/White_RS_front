import { ref } from 'vue'
import { createCRUDStore } from '@/utils/createStore'
import { userApi } from '@/api/services/user-api'
import type { userType } from '@/types/user-type'

// 创建基本CRUD Store
export const cooperaMsgStore = createCRUDStore('user-store', userApi)()
// 表单数据
export const addFormData = ref<userType>({})
export const editFormData = ref<userType>({})
