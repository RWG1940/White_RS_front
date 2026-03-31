import { createCRUDService } from '../../utils/createApi'
import apiClient from '../index'

export const apcsFixedApi = createCRUDService('/apcs-fixed')
// 上传库存商品
export const uploadApcsFixedInfoImage = (form: FormData) => {
  return apiClient.post(`/apcs-fixed/saveWithImages`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

// 更新库存商品
export const updateApcsFixedInfoImage = (form: FormData) => {
  return apiClient.post(`/apcs-fixed/saveWithImages`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

// 订单接口类型定义
export interface OrderItem {
  apcsFixedId: number
  quantity: number
}

export interface CreateOrderRequest {
  items: OrderItem[]
  factory: string
  batch: string
  address: string
  accessoryFactory: string
  tracking: string // 跟单字段
  customer: string // 客户字段
}

// 创建订单
export const createOrder = (orderData: CreateOrderRequest) => {
  return apiClient.post(`/apcs-fixed/create-order`, orderData, {
    headers: { 'Content-Type': 'application/json' },
  })
}