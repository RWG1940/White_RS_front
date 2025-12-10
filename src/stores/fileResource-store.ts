import { ref } from 'vue'
import { createCRUDStore } from '@/utils/createStore'
import { fileResourceApi } from '@/api/services/fileResource-api'
import type { FileResourceType } from '@/types/fileResource-type'

// 创建基本CRUD Store
export const fileResourceStore = createCRUDStore('fileResource-store', fileResourceApi)()
// 表单数据
export const addFormData = ref<FileResourceType>({})
export const editFormData = ref<FileResourceType>({})
