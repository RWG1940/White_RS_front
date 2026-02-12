import { ref } from 'vue'
import { createCRUDStore } from '@/utils/createStore'
import { aiUserPlanApi } from '@/api/services/aiUserPlan'
import type { AiUserPlanType } from '@/types/aiUserPlan'
import type { TableColumnType } from 'ant-design-vue'
import { formatTime } from '@/utils/formatTime'

// 创建基本CRUD Store
export const aiUserPlanStore = createCRUDStore('aiUserPlan-store', aiUserPlanApi)()
// 表单数据
export const addFormData = ref<AiUserPlanType>({})
export const editFormData = ref<AiUserPlanType>({})
// 搜索选项
aiUserPlanStore.searchSelectOptions = [
  { label: '订阅人', value: 'userName' },
  { label: '套餐名称', value: 'planName' }
]
// 表格列
export const columns: TableColumnType<AiUserPlanType>[] = [
  { title: 'ID', dataIndex: 'id', ellipsis: true, width: 80 },
  { title: '订阅人', dataIndex: 'userName', ellipsis: true, width: 120 },
  { title: '套餐名称', dataIndex: 'planName', ellipsis: true, width: 120 },
  { title: '开始时间', dataIndex: 'sTime', ellipsis: true, width: 150,customRender: ({ text }: any) => formatTime(text), },
  { title: '结束时间', dataIndex: 'eTime', ellipsis: true, width: 150,customRender: ({ text }: any) => formatTime(text) },
  { 
    title: '状态', 
    dataIndex: 'status', 
    ellipsis: true, 
    width: 100
  },
]

// 可编辑字段
export const editableFields = ['userName', 'planName', 'sTime', 'eTime', 'status']
