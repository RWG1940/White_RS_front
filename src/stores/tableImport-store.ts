import { ref } from 'vue'
import { createCRUDStore } from '@/utils/createStore'
import { tableImportApi } from '@/api/services/tableImport-api'
import type { tableImportType } from '@/types/tableImport-type'

// 创建基本CRUD Store
export const tableImportStore = createCRUDStore('tableImport-store', tableImportApi)()
// 表单数据
export const addFormData = ref<tableImportType>({})
export const editFormData = ref<tableImportType>({})
