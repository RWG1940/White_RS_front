import { ref } from 'vue'
import { createCRUDStore } from '@/utils/createStore'
import { apcsFixedApi } from '@/api/services/apcsFixed-api'
import type { ApcsFixedType } from '@/types/apcsFixed-type'
import type { TableColumnType } from 'ant-design-vue'
import { formatTime } from '@/utils/formatTime'

// 创建基本CRUD Store
export const apcsFixedStore = createCRUDStore<ApcsFixedType>('apcsFixed-store', apcsFixedApi)
// 表单数据
export const addFormData = ref<ApcsFixedType>({})
export const editFormData = ref<ApcsFixedType>({})
