import { createCRUDService } from '../../utils/createApi'
import  apiClient  from '../index'


export const userConfiguresApi = createCRUDService('/user-configures')
export const deleteUserConfiguresByE = (e: any) => {
    console.log(e)
  return apiClient.post(`/user-configures/deleteByE`, e)
}