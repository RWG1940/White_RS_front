import { createCRUDService } from '../../utils/createApi'
import apiClient from '../index'

export const accApi = createCRUDService('/acc')
// 上传单条记录的文件 参数：单条记录ID，文件表单
export const addFileWithInfo = (form: FormData) => {
  return apiClient.post(`/acc/addFile`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
// 修改单条记录的文件 参数：单条记录ID，文件表单
export const updateFileWithInfo = (form: FormData) => {
  return apiClient.post(`/acc/updateFile`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
// 导入辅料清单表 参数：文件表单、导入批次ID
export const importExcel = (form: FormData) => {
  return apiClient.post(`/acc/importExcel`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
// 导出辅料清单表 参数导入批次id
export const exportExcel = (data: any) => {
  return apiClient.post(`/acc/exportExcel`, data, {
    headers: { 'Content-Type': 'application/json' },
    responseType: 'blob',
  })
}

// 根据导入id获取分页数据
export const getAccListByImportId = (importId: number, page: number, size: number,quater:string) => {
  return apiClient.get(`/acc/getAccListByImportId/${importId}`, {
    params: {
      current: page,
      size: size,
      quarter: quater,
    },
  })
}

// 根据客人ID和导入id获取分页数据
export const getAccListByGuestId = (
  guestId: number,
  importId: number,
  page: number,
  size: number,
  quarter: string
) => {
  return apiClient.get(`/acc/pageByGuestId`, {
    params: {
      guestId: guestId,
      importId: importId,
      current: page,
      size: size,
      quarter: quarter,
    },
  })
}

// 根据importId删除辅料记录
export const deleteAccByImportId = (importId: number) => {
  return apiClient.delete(`/acc/deleteByImportId/${importId}`)
}

// 根据importId获取洗标和吊牌总金额
export const getTotalByImportId = (importId: number) => {
  return apiClient.get(`/acc/getTotalByImportId/${importId}`)
}

// 更新所有辅料数据的地址信息
export const updateAllSupplyDataAddress = (username: string, address: string) => {
  return apiClient.post(
    `/acc/updateAllSupplyDataAddress?username=${encodeURIComponent(username)}&address=${encodeURIComponent(address)}`,
  )
}

// 查询所有季度（去重）
export const getAllQuarter = () => {
  return apiClient.get(`/acc/getAllQuarters`)
}

// 查询所有辅料工厂信息
export const getAllSupplyFactory = () => {
  return apiClient.get(`/user/getASUsers`)
}

// 根据工厂名去获得批次信息（去重）
export const getAllBatchByFactory = (factory: string) => {
  return apiClient.get(`/acc/getBatchsByFactoryName`,{
    params:{
      factoryName: factory,
    }
  })
}
