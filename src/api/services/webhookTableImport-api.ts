import { createCRUDService } from '../../utils/createApi'
import  apiClient  from '../index'

export const webhookTableImportApi = createCRUDService('/webhook-table-import')
// 批量通知,根据该条数据的tableImportId去获取对应的webhook id,在后端实现批量通知功能
export const noticeGroup = (tableImportId: string,sku: string) => {
  return apiClient.get(`/webhook-table-import/notice-group/${tableImportId}/${sku}`)
}
