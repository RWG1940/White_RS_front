import { ref } from 'vue'
import { createCRUDStore } from '@/utils/createStore'
import { webhookApi } from '@/api/services/webhook-api'
import type { WebhookType } from '@/types/webhook-type'

// 创建基本CRUD Store
export const webhookStore = createCRUDStore('webhook-store', webhookApi)()
// 表单数据
export const addFormData = ref<WebhookType>({})
export const editFormData = ref<WebhookType>({})
