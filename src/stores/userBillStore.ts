import { ref } from 'vue'
import { createCRUDStore } from '@/utils/createStore'
import { userBillApi } from '@/api/services/userBill-api'
import type { UserBillType } from '@/types/userBill-type'
import type { TableColumnType } from 'ant-design-vue'
import { formatTime } from '@/utils/formatTime'

// 创建基本CRUD Store
export const userBillStore = createCRUDStore('userBill-store', userBillApi)()
// 表单数据
export const addFormData = ref<UserBillType>({})
export const editFormData = ref<UserBillType>({})
// 搜索选项
userBillStore.searchSelectOptions = [
  { label: '用户名', value: 'userName' },
  { label: '订单号', value: 'oderNum' },
  { label: '账单结果', value: 'result' },
  { label: '花费', value: 'paid' }
]
// 表格列
export const columns: TableColumnType<UserBillType>[] = [
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
