import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { message } from 'ant-design-vue'

export interface CRUDStoreOptions {
  successMessage?: {
    fetch?: string
    create?: string
    update?: string
    delete?: string
    search?: string
  }
}

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

  const pickTotal = (payload: any, fallbackLength = 0) =>
    payload?.total ??
    payload?.count ??
    payload?.totalCount ??
    payload?.recordsTotal ??
    fallbackLength

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

    // 获取所有数据
    const fetchAll = async () => {
      try {
        loading.value = true
        const res = await api.getAll()
        const payload = unwrapResponse(res)
        list.value = pickArray(payload)
        // message.success(successMessage.fetch || '获取数据成功')
      } catch (error) {
        // 错误已在拦截器中处理
      } finally {
        loading.value = false
      }
    }

    // 获取分页数据
    const fetchPage = async () => {
      try {
        loading.value = true
        const res = await api.getPages(currentPage.value, pageSize.value)
        const payload = unwrapResponse(res)
        const rows = pickArray(payload)
        pagedList.value = rows
        total.value = pickTotal(payload, rows.length)
        // message.success(successMessage.fetch || '获取数据成功')
      } catch (error) {
        // 错误已在拦截器中处理
      } finally {
        loading.value = false
      }
    }

    // 创建数据
    const create = async (newData: T) => {
      try {
        loading.value = true
        await api.add(newData)
        await fetchAll()
        await fetchPage()
        message.success(successMessage.create || '创建成功')
      } catch (error) {
        // 错误已在拦截器中处理
      } finally {
        loading.value = false
      }
    }

    // 更新数据
    const update = async (updatedData: T) => {
      try {
        loading.value = true
        await api.update(updatedData)
        await fetchAll()
        await fetchPage()
        message.success(successMessage.update || '更新成功')
      } catch (error) {
        // 错误已在拦截器中处理
      } finally {
        loading.value = false
      }
    }

    // 删除数据
    const remove = async (ids: number[]) => {
      try {
        loading.value = true
        await api.delete(ids)
        await fetchAll()
        await fetchPage()
        message.success(successMessage.delete || '删除成功')
      } catch (error) {
        // 错误已在拦截器中处理
      } finally {
        loading.value = false
      }
    }

    // 删除选中的数据
    const removeSelected = async () => {
      if (selectedIds.value.length === 0) {
        message.warning('请先选择要删除的数据')
        return
      }
      await remove(selectedIds.value)
      selectedIds.value = []
    }

    // 搜索数据
    const search = async (searchData: T) => {
      try {
        loading.value = true
        const res = await api.search(searchData)
        const payload = unwrapResponse(res)
        searchResults.value = pickArray(payload)
        message.success(successMessage.search || '搜索完成')
      } catch (error) {
        // 错误已在拦截器中处理
      } finally {
        loading.value = false
      }
    }

    // 过滤后的表格数据
    const filteredList = computed(() =>
      pagedList.value.filter((item) => {
        const lowerSearch = searchKeyword.value.toLowerCase()
        return !searchKeyword.value || JSON.stringify(item).toLowerCase().includes(lowerSearch)
      }),
    )

    // 处理选择变化
    const onSelectionChange = (selection: T[]) => {
      selectedIds.value = selection.map((item: any) => item.id)
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

      // 方法
      fetchAll,
      fetchPage,
      create,
      update,
      remove,
      removeSelected,
      search,
      onSelectionChange,
      reset,
    }
  })
}
