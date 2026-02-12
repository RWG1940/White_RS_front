import { ref } from 'vue'
import { createCRUDStore } from '@/utils/createStore'
import { aiPromptsApi } from '@/api/services/aiPrompts-api'
import type { AiPromptsType } from '@/types/aiPrompts-type'
import type { TableColumnType } from 'ant-design-vue'

// 创建基本CRUD Store
export const aiPromptsStore = createCRUDStore('aiPrompts-store', aiPromptsApi)()
// 表单数据
export const addFormData = ref<AiPromptsType>({})
export const editFormData = ref<AiPromptsType>({})
// 表格列
export const columns: TableColumnType<AiPromptsType>[] = [
  { title: '名称', dataIndex: 'label', width: '180px' },
  { title: '类别', dataIndex: 'subcategory', width: '120px' },
  { title: '值', dataIndex: 'value', width: '120px' },
  { title: '描述', dataIndex: 'describtion', width: '180px' },
]

// 可编辑字段
export const editableFields = ['subcategory', 'label', 'value', 'describtion']
//  搜索字段
export const searchOptions = [
  { label: '类别', value: 'subcategory' },
  { label: '名称', value: 'label' },
  { label: '值', value: 'value' },
  { label: '描述', value: 'describtion' }
]