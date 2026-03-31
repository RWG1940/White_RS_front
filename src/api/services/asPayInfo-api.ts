import { createCRUDService } from '../../utils/createApi'
import apiClient from '../index'

export const asPayInfoApi = createCRUDService('/aspay-info')

// 创建支付信息（包含图片）
export const createAsPayInfoWithImages = (form: FormData) => {
  return apiClient.post(`/aspay-info/saveWithImages`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

// 更新支付信息（包含图片）
export const updateAsPayInfoWithImages = (form: FormData) => {
  return apiClient.put(`/aspay-info/saveWithImages/${form.get('id') || ''}`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

