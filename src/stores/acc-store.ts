import { ref, computed } from 'vue'
import { createCRUDStore } from '@/utils/createStore'
import {
  accApi,
  getAccListByImportId,
  getAccListByGuestId,
  deleteAccByImportId,
  getTotalByImportId,
  updateAllSupplyDataAddress,
  getAllQuarter,
  getAllSupplyFactory,
  getAllBatchByFactory
} from '@/api/services/acc-api'
import type { AccPurchaseContractType } from '@/types/acc-type'
import { tableImportStore } from './tableImport-store'
import type { tableImportType } from '@/types/tableImport-type'
import type { quaterType } from '@/types/quater-type'

// 创建基本CRUD Store
export const accStore = createCRUDStore('acc-store', accApi)()
// 表单数据
export const addFormData = ref<AccPurchaseContractType>({})
export const editFormData = ref<AccPurchaseContractType>({})
export const washTotal = ref<number>(0)
export const tagTotal = ref<number>(0)
export const quarters = ref<quaterType[]>([])
export const currentGuestId = ref<number | null>(null)
export const selectedBatchId = ref<number | null>(null)
export const factoryBatchs = ref<any[]>([])
// 辅料工厂下拉数据
export const asUserOptions = ref<any[]>([])

// 计算可见的批次列表（过滤掉隐藏的批次）
export const visibleBatches = computed(() => {
  return (tableImportStore.list as tableImportType[]).filter((batch) => batch.status === 1)
})

// 计算可见的季度列表（过滤掉隐藏的季度）
export const visibleQuarters = computed(() => {
  return quarters.value.filter((quarter) => quarter.status !== 0)
})
// 获取分页数据
export const fetchPageByImportId = async (
  importId: number,
  page: number,
  size: number,
  quarter: string,
) => {
  if (page === 0) {
    page = accStore.currentPage
  }
  if (size === 0) {
    size = accStore.pageSize
  }
  await getAccListByImportId(importId, page, size, quarter).then((res: any) => {
    accStore.pagedList = res.data.data.records
    accStore.total = res.data.data.total
  })
}
// 根据客人ID和导入id获取分页数据
export const fetchPageByGuestId = async (
  guestId: number,
  importId: number,
  page: number,
  size: number,
  quarter: string,
) => {
  if (page === 0) {
    page = accStore.currentPage
  }
  if (size === 0) {
    size = accStore.pageSize
  }

  await getAccListByGuestId(guestId, importId, page, size, quarter).then((res: any) => {
    accStore.pagedList = res.data.data.records
    accStore.total = res.data.data.total
  })
}
// 根据导入id删除批次数据
export const deleteByImportId = async (importId: number) => {
  await deleteAccByImportId(importId)
}
// 获取洗标和吊牌总金额
export const getTotalPriceByImportId = async (importId: number) => {
  const res = await getTotalByImportId(importId)
  washTotal.value = res.data.data.data.washTotalPrice
  tagTotal.value = res.data.data.data.tagTotalPrice
}
// 更新所有辅料数据地址
export const refreshAllSupplyDataAddress = async (username: string, address: string) => {
  updateAllSupplyDataAddress(username, address)
}
// 获取所有季度（去重）
export const getQuarters = async () => {
  const res = await getAllQuarter()
  // 后端直接返回包含 name 和 status 的对象数组
  quarters.value = res.data.data
}
// 查询所有辅料工厂信息
export const getSupplyFactory = async () => {
  const res = await getAllSupplyFactory()
  asUserOptions.value = res.data.data.map((item: any) => ({
      value: item.id,
      label: item.username || `未知的辅料工厂`,
    }))
}
// 根据工厂名去获得批次信息（去重）
export const getBatchesByFactory = async (factory: string) => {
  const res = await getAllBatchByFactory(factory)
  factoryBatchs.value = res.data.data
}