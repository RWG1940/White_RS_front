import { createCRUDService } from '../../utils/createApi'
import  apiClient  from '../index'

export const fileResourceApi = createCRUDService('/api/files')
// 上传文件
export const uploadFileWithInfo = (form: FormData) => {
   return apiClient.post('/api/files/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
}
// 删除文件
export const deleteFilesWithInfo = (fileKeys: string[]) => {
   return apiClient.delete('/api/files/delete', { data: fileKeys })
}
// 更新文件
export const updateFileWithInfo = (fileKey:string, form: FormData) => {
   return apiClient.post(`/api/files/update/${fileKey}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
   })
}

// 下载文件
export const downloadFile = (fileKey:string) => {
   return apiClient.get(`/api/files/download/${fileKey}`, {
      responseType: 'blob'
   })
}