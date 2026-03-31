import { ref } from 'vue'
import { createCRUDStore } from '@/utils/createStore'
import { userConfiguresApi,deleteUserConfiguresByE } from '@/api/services/userConfigures-api'
import type { UserConfiguresType } from '@/types/userConfigures-type'
import type { TableColumnType } from 'ant-design-vue'
import { formatTime } from '@/utils/formatTime'

// 创建基本CRUD Store
export const userConfiguresStore = createCRUDStore('userConfigures-store', userConfiguresApi)()
// 表单数据
export const addFormData = ref<UserConfiguresType>({})
export const editFormData = ref<UserConfiguresType>({})
// 搜索选项
userConfiguresStore.searchSelectOptions = [
  { label: '用户名', value: 'userName' },
  { label: '订单号', value: 'oderNum' },
  { label: '账单结果', value: 'result' },
  { label: '花费', value: 'paid' }
]
// 表格列
export const columns: TableColumnType<UserConfiguresType>[] = [
  { title: 'ID', dataIndex: 'id', ellipsis: true, width: 80 },
  { title: '用户名', dataIndex: 'userName', ellipsis: true, width: 120 },
  { title: '付费类型', dataIndex: 'type', ellipsis: true, width: 120 },
  { title: '订单号', dataIndex: 'orderNum', ellipsis: true, width: 120 },
  { title: '账单结果', dataIndex: 'result', ellipsis: true, width: 120 },
  { title: '花费', dataIndex: 'paid', ellipsis: true, width: 120 },
  { title: '时间', dataIndex: 'date', ellipsis: true, width: 150,customRender: ({ text }: any) => formatTime(text), },
  { 
    title: '状态', 
    dataIndex: 'status', 
    ellipsis: true, 
    width: 100
  },
]

// 可编辑字段
export const editableFields = [ 'type', 'orderNum', 'result', 'paid', 'date', 'status']
// 根据实体删除
export const removeConfigureByE = async(e: any) => {
  deleteUserConfiguresByE(e)
}