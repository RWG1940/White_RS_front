import { ref } from 'vue'
import { createCRUDStore } from '@/utils/createStore'
import { webhookTableImportApi } from '@/api/services/webhookTableImport-api'
import type { WebhookTableImportType } from '@/types/webhookTableImport-type'

// 创建基本CRUD Store
export const webhookTableImportStore = createCRUDStore(
  'webhookTableImport-store',
  webhookTableImportApi,
)()
// 表单数据
export const addFormData = ref<WebhookTableImportType>({})
export const editFormData = ref<WebhookTableImportType>({})
// 搜索表单下拉框数据
export const searchOptions = [
  { label: 'webhookId', value: 'webhookId' },
  { label: '批次id', value: 'importId' },
]
