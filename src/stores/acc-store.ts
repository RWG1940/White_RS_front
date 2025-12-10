import { ref } from 'vue'
import { createCRUDStore } from '@/utils/createStore'
import { accApi } from '@/api/services/acc-api'
import type { AccPurchaseContractType } from '@/types/acc-type'

// 创建基本CRUD Store
export const accStore = createCRUDStore('acc-store', accApi)()
// 表单数据
export const addFormData = ref<AccPurchaseContractType>({})
export const editFormData = ref<AccPurchaseContractType>({})
