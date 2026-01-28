import { createCRUDService } from '../../utils/createApi'
import  apiClient  from '../index'


export const aiPromptsApi = createCRUDService('/ai-sys-prompts')