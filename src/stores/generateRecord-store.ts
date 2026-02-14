import { ref } from 'vue'
import { createCRUDStore } from '@/utils/createStore'
import { generateRecordApi } from '@/api/services/generateRecord-api'
import type { generateRecordType } from '@/types/generateRecord-type'

// 创建基本CRUD Store
export const generateRecordStore = createCRUDStore('generateRecord-store', generateRecordApi)()
// 表单数据
export const addFormData = ref<generateRecordType>({})
export const editFormData = ref<generateRecordType>({})
// 表格列
export const columns = ref([
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
  },

  {
    title: '类型',
    dataIndex: 'type',
    key: 'type',
  },

  {
    title: 'URL',
    dataIndex: 'url',
    key: 'url',
  },

  {
    title: '创建时间',
    dataIndex: 'create_at',
    key: 'create_at',
  },

  {
    title: '用户ID',
    dataIndex: 'uid',
    key: 'uid',
  },
])
// 表格编辑字段
export const editableFields = ['type', 'url', 'uid']
