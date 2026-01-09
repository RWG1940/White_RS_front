import { ref } from 'vue'
import { createCRUDStore } from '@/utils/createStore'
import { fileSharingFilesApi } from '@/api/services/fileSharingFiles-api'
import type { FileSharingFilesType } from '@/types/fileSharingFiles-type'

// 创建基本CRUD Store
export const fileSharingFilesStore = createCRUDStore('fileSharingFiles-store', fileSharingFilesApi)()
// 表单数据
export const addFormData = ref<FileSharingFilesType>({})
export const editFormData = ref<FileSharingFilesType>({})

