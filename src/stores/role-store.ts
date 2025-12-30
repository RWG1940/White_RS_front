import { ref } from 'vue'
import { createCRUDStore } from '@/utils/createStore'
import { roleApi } from '@/api/services/role-api'
import type { roleType } from '@/types/role-type'

// 创建基本CRUD Store
export const roleStore = createCRUDStore('role-store', roleApi)()
// 表单数据
export const addFormData = ref<roleType>({})
export const editFormData = ref<roleType>({})


