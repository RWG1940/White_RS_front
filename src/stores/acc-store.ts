import { ref } from 'vue'
import { createCRUDStore } from '@/utils/createStore'
import { accApi,getAccListByImportId,getAccListByGuestId } from '@/api/services/acc-api'
import type { AccPurchaseContractType } from '@/types/acc-type'

// 创建基本CRUD Store
export const accStore = createCRUDStore('acc-store', accApi)()
// 表单数据
export const addFormData = ref<AccPurchaseContractType>({})
export const editFormData = ref<AccPurchaseContractType>({})
export const fetchPageByImportId = async(importId: number,page:number,size:number) => {
    if(page === 0){
        page = accStore.currentPage
    }
    if(size === 0){
        size = accStore.pageSize
    }
    await getAccListByImportId(importId,page,size).then((res:any) => { 
        accStore.pagedList = res.data.data.records
        accStore.total = res.data.data.total
    })
}

export const fetchPageByGuestId = async(guestId: number,importId:number,page:number,size:number) => { 
    if(page === 0){
        page = accStore.currentPage
    }
    if(size === 0){
        size = accStore.pageSize
    }
    await getAccListByGuestId(guestId,importId,page,size).then((res:any) => { 
        accStore.pagedList = res.data.data.records
        accStore.total = res.data.data.total
    })
}