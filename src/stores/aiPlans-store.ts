import { ref } from 'vue'
import { createCRUDStore } from '@/utils/createStore'
import { aiPlansApi } from '@/api/services/aiPlans-api'
import type { AiPlansType } from '@/types/aiPlans-type'
import type { TableColumnType } from 'ant-design-vue'

// 创建基本CRUD Store
export const aiPlansStore = createCRUDStore('aiPlans-store', aiPlansApi)()
// 表单数据
export const addFormData = ref<AiPlansType>({})
export const editFormData = ref<AiPlansType>({})
// 搜索选项
aiPlansStore.searchSelectOptions = [
  { label: '订阅名', value: 'name' },
  { label: '描述', value: 'description' },
]
// 表格列
export const columns: TableColumnType<AiPlansType>[] = [
  { title: '订阅名', dataIndex: 'name' },
  { title: '价格', dataIndex: 'price' },
  { title: '天数', dataIndex: 'durationDays' },
  { title: '最大图片尺寸', dataIndex: 'maxSize' },
  { title: '状态', dataIndex: 'status' },
  { title: '创建时间', dataIndex: 'createdAt' },
  { title: '描述', dataIndex: 'description' },
  { title: '每日调用上限', dataIndex: 'dailyLimit' },
  { title: '免费次数', dataIndex: 'cheapLimit' },
]

// 可编辑字段
export const editableFields = ['name', 'price', 'durationDays', 'maxSize','status', 'description', 'dailyLimit', 'cheapLimit']
