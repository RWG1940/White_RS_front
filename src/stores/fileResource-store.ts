import { ref } from 'vue'
import { createCRUDStore } from '@/utils/createStore'
import { fileResourceApi, getFilesByBiz, getTotalFileSize, shareFile,getSharedFile } from '@/api/services/fileResource-api'
import type { FileResourceType } from '@/types/fileResource-type'
import type { FileSharingType } from '@/types/fileSharing-type'

// 创建基本CRUD Store
export const fileResourceStore = createCRUDStore('fileResource-store', fileResourceApi)()
// 表单数据
export const addFormData = ref<FileResourceType>({})
export const editFormData = ref<FileResourceType>({})
// 文件之和
export const filesTotalSize = ref(0)
// 获取文件资源总数
export const fetchTotalFileSize = async () => {
    await getTotalFileSize().then((res: any) => {
        filesTotalSize.value = res.data.data
    })
}
// 根据业务类型和业务ID获取文件资源
export const fetchFilesByBiz = async (bizType: string, bizId: number, page: number, size: number) => {
    if (page === 0) {
        page = fileResourceStore.currentPage
    }
    if (size === 0) {
        size = fileResourceStore.pageSize
    }
    await getFilesByBiz(bizType, bizId, page, size).then((res: any) => {
        fileResourceStore.pagedList = res.data.data.records
        fileResourceStore.total = res.data.data.total
    })
}
// 分享文件
export const shareFiles = async (data: FileSharingType) => {
    const res = await shareFile(data)
    return res.data.data
}
// 获取分享的文件
export const getSharedFiles = async (shareUrl: string) => {
    const res = await getSharedFile(shareUrl)
    return res.data.data
}
