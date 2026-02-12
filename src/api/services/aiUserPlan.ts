import { createCRUDService } from '../../utils/createApi'
import  apiClient  from '../index'


export const aiUserPlanApi = createCRUDService('/user-plan')