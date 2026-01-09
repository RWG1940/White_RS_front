import { ref } from 'vue'
import { createCRUDStore } from '@/utils/createStore'
import { fileSharingApi } from '@/api/services/fileSharing-api'
import type { FileSharingType } from '@/types/fileSharing-type'

// 创建基本CRUD Store
export const fileSharingStore = createCRUDStore('fileSharing-store', fileSharingApi)()
// 表单数据
export const addFormData = ref<FileSharingType>({})
export const editFormData = ref<FileSharingType>({})

