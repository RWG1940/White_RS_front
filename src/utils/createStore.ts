import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { message } from 'ant-design-vue'
import type { TableColumnType } from 'ant-design-vue'

export interface CRUDStoreOptions {
  successMessage?: {
    fetch?: string
    create?: string
    update?: string
    delete?: string
    search?: string
  }
}
/**
 * 创建 CRUD Store
 */
export function createCRUDStore<T>(storeName: string, api: any, options: CRUDStoreOptions = {}) {
  const {
    successMessage = {
      fetch: '获取数据成功',
      create: '创建成功',
      update: '更新成功',
      delete: '删除成功',
      search: '搜索完成',
    },
  } = options

  const unwrapResponse = (res: any) =>
    res?.data?.result ?? res?.data?.data ?? res?.data ?? res ?? {}

  const pickArray = (payload: any): T[] => {
    if (!payload) return []
    if (Array.isArray(payload)) return payload as T[]
    if (Array.isArray(payload.records)) return payload.records as T[]
    if (Array.isArray(payload.rows)) return payload.rows as T[]
    if (Array.isArray(payload.list)) return payload.list as T[]
    return []
  }

  // 使用 defineStore 创建 store
  return defineStore(storeName, () => {
    // 数据列表
    const list = ref<T[]>([])
    // 分页数据列表
    const pagedList = ref<T[]>([])
    // 每页数量
    const pageSize = ref(10)
    // 数据总数
    const total = ref(0)
    // 当前页码
    const currentPage = ref(1)
    // 选中的ID列表
    const selectedIds = ref<number[]>([])
    // 搜索关键词
    const searchKeyword = ref('')
    // 搜索结果
    const searchResults = ref<T[]>([])
    // 加载状态
    const loading = ref(false)
    // 分页条件数据
    const conditionsData = ref<T>({} as T)
    // 搜索条件数据
    const searchData = ref<T>({} as T)
    // 精确查询条件数据
    const exactData = ref<T>({} as T)
    // 筛选框下拉选项
    const searchSelectOptions = ref<Array<{ label: string; value: string }>>([])
    // 表格列数据
    const columns = ref<TableColumnType<T>[]>([])
    // 表格可编辑字段
    const editableFields = ref<string[]>([])
    // 搜索筛选值
    const searchSelectValue = ref('')
    /**
     * 基础方法，分为两类：一类用于操作没有条件的分页表格，另一类用于有条件的分页表格
     * 方法名后缀加 N 表示不刷新分页数据，便于有条件分页时调用
     */
    // 获取所有数据
    const fetchAll = async () => {
      const res = await api.getAll()
      const payload = unwrapResponse(res)
      list.value = pickArray(payload)
    }

    // 获取分页数据
    const fetchPage = async () => {
      const res = await api.getPages(currentPage.value, pageSize.value)
      const payload = unwrapResponse(res)
      const rows = payload.records
      pagedList.value = rows
      total.value = payload.total
    }
    // 获取有条件的分页数据
    const fetchPageByConditions = async () => {
      const res = await api.getPagesByCondition(
        currentPage.value,
        pageSize.value,
        conditionsData.value,
      )
      const payload = unwrapResponse(res)
      const rows = payload.records
      pagedList.value = rows
      total.value = payload.total
    }

    // 创建数据
    const create = async (newData: T) => {
      await api.add(newData)
      await fetchPage()
      message.success(successMessage.create || '创建成功')
    }
    // 创建数据 - 不刷新分页数据，便于有条件分页时调用
    const createN = async (newData: T) => {
      await api.add(newData)
      message.success(successMessage.create || '创建成功')
    }
    // 更新数据
    const update = async (updatedData: T) => {
      await api.update(updatedData)
      await fetchPage()
      message.success(successMessage.update || '更新成功')
    }
    // 更新数据 - 不刷新分页数据，便于有条件分页时调用
    const updateN = async (updatedData: T) => {
      await api.update(updatedData)
      message.success(successMessage.update || '更新成功')
    }
    // 删除数据
    const remove = async (ids: number[]) => {
      await api.delete(ids)
      if (currentPage.value == 1) {
        await fetchPage()
      } else {
        currentPage.value = currentPage.value - 1
        await fetchPage()
      }
      message.success(successMessage.delete || '删除成功')
    }
    // 删除数据 - 不刷新分页数据，便于有条件分页时调用
    const removeN = async (ids: number[]) => {
      await api.delete(ids)
      message.success(successMessage.delete || '删除成功')
    }

    // 搜索数据（模糊查询）
    const search = async () => {
      const res = await api.queryLike(searchData.value)
      const payload = unwrapResponse(res)
      searchResults.value = pickArray(payload)
      message.success(successMessage.search || '搜索完成')
    }
    // 搜索数据（精确查询）
    const exact = async () => {
      const res = await api.queryEq(exactData.value)
      const payload = unwrapResponse(res)
      searchResults.value = pickArray(payload)
    }
    /**
     * 表格操作方法
     */
    // 删除选中的数据
    const removeSelected = async () => {
      if (selectedIds.value.length === 0) {
        message.warning('请先选择要删除的数据')
        return
      }
      await remove(selectedIds.value)
      selectedIds.value = []
    }
    // 删除选中的数据 - 不刷新分页数据，便于有条件分页时调用
    const removeSelectedN = async () => {
      if (selectedIds.value.length === 0) {
        message.warning('请先选择要删除的数据')
        return
      }
      await removeN(selectedIds.value)
      selectedIds.value = []
    }

    // 过滤后的表格数据
    const filteredList = computed(() =>
      pagedList.value.filter((item) => {
        const lowerSearch = searchKeyword.value.toLowerCase()
        return !searchKeyword.value || JSON.stringify(item).toLowerCase().includes(lowerSearch)
      }),
    )

    // 处理表格选择变化
    const onSelectionChange = ({ rows }: { keys: (string | number)[]; rows: T[] }) => {
      selectedIds.value = rows.map((item: any) => item.id)
    }

    // 处理表格分页变化
    const pageChange = (val: number) => {
      currentPage.value = val
      fetchPage()
    }
    // 处理表格每页数量变化
    const pageSizeChange = (val: number) => {
      pageSize.value = val
      fetchPage()
    }
    // 处理表格搜索
    const handleSearch = async (conditions: Record<string, string>) => {
      const filteredConditions: Record<string, string> = {}
      Object.keys(conditions).forEach((key) => {
        const val = conditions[key]?.trim()
        if (val) {
          filteredConditions[key] = val
        }
      })
      if (Object.keys(filteredConditions).length === 0) {
        await fetchPage()
        return
      }
      searchData.value = filteredConditions
      await search()
      pagedList.value = searchResults.value as T[]
      total.value = searchResults.value.length
    }
    // 处理表格搜索-不刷新分页数据
    const handleSearchN = async (conditions: Record<string, string>) => {
      const filteredConditions: Record<string, string> = {}
      Object.keys(conditions).forEach((key) => {
        const val = conditions[key]?.trim()
        if (val) {
          filteredConditions[key] = val
        }
      })
      if (Object.keys(filteredConditions).length === 0) {
        return
      }
      searchData.value = filteredConditions
      await search()
      pagedList.value = searchResults.value as T[]
      total.value = searchResults.value.length
    }
    // 处理精确查询
    const handleExact = async (conditions: Record<string, string>) => {
      const filteredConditions: Record<string, string> = {}
      Object.keys(conditions).forEach((key) => {
        const val = conditions[key]?.trim()
        if (val) {
          filteredConditions[key] = val
        }
      })
      if (Object.keys(filteredConditions).length === 0) {
        await fetchPage()
        return
      }
      exactData.value = filteredConditions
      await exact()
    }
    // 处理精确查询-不刷新分页数据
    const handleExactN = async (conditions: Record<string, string>) => {
      const filteredConditions: Record<string, string> = {}
      Object.keys(conditions).forEach((key) => {
        const val = conditions[key]?.trim()
        if (val) {
          filteredConditions[key] = val
        }
      })
      if (Object.keys(filteredConditions).length === 0) {
        return
      }
      exactData.value = filteredConditions
      await exact()
    }
    // 处理表格单个删除
    const handleRowDelete = async (id: string | number) => {
      await remove([Number(id)])
    }
    // 处理表格单个删除 - 不刷新分页数据，便于有条件分页时调用
    const handleRowDeleteN = async (id: string | number) => {
      await removeN([Number(id)])
    }
    // 重置状态
    const reset = () => {
      list.value = []
      pagedList.value = []
      total.value = 0
      currentPage.value = 1
      selectedIds.value = []
      searchKeyword.value = ''
      searchResults.value = []
      searchData.value = {}
      exactData.value = {}
    }

    return {
      // 状态
      list,
      pagedList,
      pageSize,
      total,
      currentPage,
      selectedIds,
      searchKeyword,
      searchResults,
      loading,
      filteredList,
      searchData,
      exactData,
      columns,
      searchSelectOptions,
      editableFields,
      conditionsData,
      searchSelectValue,

      // 方法
      fetchAll,
      fetchPage,
      create,
      createN,
      update,
      updateN,
      remove,
      removeN,
      removeSelected,
      removeSelectedN,
      search,
      onSelectionChange,
      reset,
      exact,
      pageChange,
      pageSizeChange,
      handleRowDelete,
      handleRowDeleteN,
      handleSearch,
      handleSearchN,
      fetchPageByConditions,
      handleExact,
      handleExactN,
    }
  })
}
