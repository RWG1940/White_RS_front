import { ref } from 'vue'
import { createCRUDStore } from '@/utils/createStore'
import { guestApi } from '@/api/services/guest-api'
import type { GuestType } from '@/types/guest-type'

// 创建基本CRUD Store
export const guestStore = createCRUDStore('guest-store', guestApi)()
// 表单数据
export const addFormData = ref<GuestType>({})
export const editFormData = ref<GuestType>({})
