import { ref } from 'vue'
import { createCRUDStore } from '@/utils/createStore'
import { webhookApi } from '@/api/services/webhook-api'
import type { WebhookType } from '@/types/webhook-type'

// 创建基本CRUD Store
export const webhookStore = createCRUDStore('webhook-store', webhookApi)()
// 表单数据
export const addFormData = ref<WebhookType>({})
export const editFormData = ref<WebhookType>({})
// 搜索选项
export const searchOptions = [{
    label: '名称',
    value: 'name'
  },
  {
    label: 'URL',
    value: 'url'
  },
  {
    label: '状态',
    value: 'status'
  },
  {
    label: '类型',
    value: 'type'
  },
  {
    label: '备注',
    value: 'remark'
  }
]