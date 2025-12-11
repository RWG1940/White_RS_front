import { createCRUDService } from '../../utils/createApi'
import  apiClient  from '../index'

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