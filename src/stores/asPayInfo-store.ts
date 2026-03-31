import { ref } from 'vue'
import { createCRUDStore } from '@/utils/createStore'
import { asPayInfoApi } from '@/api/services/asPayInfo-api'
import type { AsPayInfoType } from '@/types/asPayInfo-type'
import type { TableColumnType } from 'ant-design-vue'
import { formatTime } from '@/utils/formatTime'

// 创建基本CRUD Store
export const useAsPayInfoStore = createCRUDStore<AsPayInfoType>('asPayInfo-store', asPayInfoApi)
// 表单数据
export const addFormData = ref<AsPayInfoType>({})
export const editFormData = ref<AsPayInfoType>({})

// 表格列
export const columns: TableColumnType<AsPayInfoType>[] = [
  { title: 'ID', dataIndex: 'id', ellipsis: true, width: 80 },
  { title: '银行卡号', dataIndex: 'bankNum', ellipsis: true, width: 150 },
  { title: '银行名称', dataIndex: 'bankName', ellipsis: true, width: 120 },
  { title: '户名', dataIndex: 'huName', ellipsis: true, width: 120 },
  { title: '辅料工厂名称', dataIndex: 'asName', ellipsis: true, width: 120 },
  { 
    title: '微信好友二维码', 
    dataIndex: 'wechatQr', 
    ellipsis: true, 
    width: 120
  },
  { 
    title: '微信收款码', 
    dataIndex: 'wechatPay', 
    ellipsis: true, 
    width: 120
  },
  { 
    title: '支付宝收款码', 
    dataIndex: 'aliPay', 
    ellipsis: true, 
    width: 120
  },
  { 
    title: '状态', 
    dataIndex: 'status', 
    ellipsis: true, 
    width: 80,
    customRender: ({ text }) => {
      if (text === 1) return '<span style="color: #52c41a;">启用</span>'
      if (text === 0) return '<span style="color: #ff4d4f;">禁用</span>'
      return '-'
    }
  },
  { title: '备注', dataIndex: 'remark', ellipsis: true, width: 150 },
  { 
    title: '创建时间', 
    dataIndex: 'createdAt', 
    ellipsis: true, 
    width: 120,
    customRender: ({ text }) => text ? formatTime(text) : '-'
  },
  { 
    title: '更新时间', 
    dataIndex: 'updatedAt', 
    ellipsis: true, 
    width: 120,
    customRender: ({ text }) => text ? formatTime(text) : '-'
  },
]

// 可编辑字段
export const editableFields = ['status', 'bankNum', 'bankName', 'huName', 'asName', 'remark']
