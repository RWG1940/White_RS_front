import { ref } from 'vue'
import { createCRUDStore } from '@/utils/createStore'
import { guestTableImportApi } from '@/api/services/guestTableImport-api'
import type { GuestTableImportType } from '@/types/guestTableImport-type'

// 创建基本CRUD Store
export const guestTableImportStore = createCRUDStore('guestTableImport-store', guestTableImportApi)()
// 表单数据
export const addFormData = ref<GuestTableImportType>({})
export const editFormData = ref<GuestTableImportType>({})
