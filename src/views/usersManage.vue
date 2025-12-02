<template>
  <div>
    <ManagePage
      v-model:data-source="dataSource"
      :columns="columns"
      :editable-fields="editableFields"
      row-key="id"
      :page-size="PAGE_SIZE"
      search-placeholder="搜索用户名"
      @search="handleSearch"
      @add="handleAddUser"
      @save="handleSave"
      @row-delete="handleRowDelete"
      @batch-delete="handleBatchDelete"
      @selection-change="handleSelectionChange"
    >
      <template #cell-status="{ record, isEditing }">
        <template v-if="!isEditing">
          <a-tag :color="record.status === 1 ? 'blue' : 'red'">
            {{ record.status === 1 ? '启用' : '禁用' }}
          </a-tag>
        </template>
      </template>
      <template #cell-onlineStatus="{ record }">
        <div class="online-status-cell">
          <a-spin v-if="onlineStatusLoading" size="small" />
          <a-tag
            v-else
            :color="isUserOnline(record) ? 'success' : 'default'"
          >
            {{ isUserOnline(record) ? '在线' : '离线' }}
          </a-tag>
        </div>
      </template>
    </ManagePage>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import type { TableColumnType } from 'ant-design-vue'
import ManagePage from '@/components/ManagePage.vue'
import { cooperaMsgStore } from '@/stores/user-store'
import type { userType } from '@/types/user-type'
import dayjs from 'dayjs'
import { batchCheckUsersOnline } from '@/api/services/websocket-api'

const store = cooperaMsgStore
const PAGE_SIZE = 15
store.pageSize = PAGE_SIZE

const columns: TableColumnType<userType>[] = [
  {
    title: 'ID',
    dataIndex: 'id',
    width: '80px',
    sorter: (a, b) => Number(a.id ?? 0) - Number(b.id ?? 0),
    sortDirections: ['descend', 'ascend'],
    filters: [
      { text: 'ID < 100', value: 'lt-100' },
      { text: '100 ≤ ID < 1000', value: 'between-100-999' },
      { text: 'ID ≥ 1000', value: 'gte-1000' },
    ],
    onFilter: (value, record) => {
      const id = Number(record.id ?? 0)
      switch (value) {
        case 'lt-100':
          return id < 100
        case 'between-100-999':
          return id >= 100 && id < 1000
        case 'gte-1000':
          return id >= 1000
        default:
          return true
      }
    },
  },
  {
    title: '用户名',
    dataIndex: 'username',
    width: '140px',
  },
  {
    title: '邮箱',
    dataIndex: 'email',
    width: '180px',
  },
  {
    title: '手机号',
    dataIndex: 'phone',
    width: '140px',
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: '70px',
    filters: [
      { text: '启用', value: 1 },
      { text: '禁用', value: 0 },
    ],
    onFilter: (value, record) => {
      const target = Number(value)
      return (record.status ?? 0) === target
    },
  },
  {
    title: '在线状态',
    dataIndex: 'onlineStatus',
    width: '100px',
    filters: [
      { text: '在线', value: 'online' },
      { text: '离线', value: 'offline' },
    ],
    onFilter: (value, record) => {
      const isOnline = Boolean(record.onlineStatus)
      return value === 'online' ? isOnline : !isOnline
    },
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    width: '130px',
    sorter: (a, b) => dayjs(a.createdAt).valueOf() - dayjs(b.createdAt).valueOf(),
    sortDirections: ['descend', 'ascend'],
    filters: [
      { text: '最近 7 天', value: '7d' },
      { text: '最近 30 天', value: '30d' },
      { text: '今年', value: 'year' },
    ],
    onFilter: (value, record) => {
      const target = dayjs(record.createdAt)
      if (!target.isValid()) {
        return false
      }
      const now = dayjs()
      switch (value) {
        case '7d':
          return target.isAfter(now.subtract(7, 'day'), 'day')
        case '30d':
          return target.isAfter(now.subtract(30, 'day'), 'day')
        case 'year':
          return target.year() === now.year()
        default:
          return true
      }
    },
  },
]

const rawRows = ref<userType[]>([])
const dataSource = ref<userType[]>([])
const editableFields = ['username', 'email', 'phone']
const onlineStatusMap = ref<Record<string, boolean>>({})
const onlineStatusLoading = ref(false)

const getUserKey = (user?: userType) => {
  if (!user) return ''
  const id = user.userId ?? user.id
  return id === undefined || id === null ? '' : String(id)
}

const isUserOnline = (user: userType) => {
  const key = getUserKey(user)
  if (!key) return false
  return Boolean(onlineStatusMap.value[key])
}

const applyOnlineStatus = () => {
  dataSource.value = rawRows.value.map((row) => ({
    ...row,
    onlineStatus: isUserOnline(row),
  }))
}

const normalizeOnlineMap = (payload?: Record<string | number, boolean>) => {
  const normalized: Record<string, boolean> = {}
  if (!payload) return normalized
  Object.entries(payload).forEach(([key, value]) => {
    normalized[String(key)] = Boolean(value)
  })
  return normalized
}

const refreshOnlineStatus = async () => {
  const ids = rawRows.value
    .map((item) => item?.userId ?? item?.id)
    .filter((id): id is number => typeof id === 'number')

  if (!ids.length) {
    onlineStatusMap.value = {}
    applyOnlineStatus()
    return
  }

  try {
    onlineStatusLoading.value = true
    const result = await batchCheckUsersOnline(ids)
    onlineStatusMap.value = normalizeOnlineMap(result)
    applyOnlineStatus()
  } catch (error) {
    console.error('获取在线状态失败:', error)
  } finally {
    onlineStatusLoading.value = false
  }
}

const setTableRows = (rows: userType[]) => {
  rawRows.value = rows.map((item) => ({ ...item }))
  applyOnlineStatus()
  refreshOnlineStatus()
}

watch(
  () => store.pagedList,
  (list) => {
    setTableRows(list as userType[])
  },
  { immediate: true, deep: true },
)

onMounted(async () => {
  await store.fetchPage()
})

const handleSearch = async (keyword: string) => {
  const trimmed = keyword.trim()
  if (!trimmed) {
    await store.fetchPage()
    return
  }
  await store.search({ column: 'username', keyword: trimmed } as any)
  setTableRows(store.searchResults as userType[])
}

// 生成一个类似 UUID 的 6 位用户名。优先使用浏览器的 crypto.randomUUID，失败时回退到 Math.random。
const generateUsername = (): string => {
  try {
    return crypto.randomUUID().replace(/-/g, '').slice(0, 6)
  } catch (e) {
    return Math.random().toString(36).slice(2, 8)
  }
}

const handleAddUser = async () => {
  await store.create({
    username: generateUsername(),
    status: 1,
  } as userType)
}

const handleSave = async (record: userType) => {
  await store.update(record)
}

const handleRowDelete = async (id: string | number) => {
  await store.remove([Number(id)])
}

const handleBatchDelete = async ({ keys }: { keys: (string | number)[] }) => {
  await store.remove(keys.map((id) => Number(id)))
}

const handleSelectionChange = ({ rows }: { keys: (string | number)[]; rows: userType[] }) => {
  store.onSelectionChange(rows as any)
}
</script>

<style scoped>
.online-status-cell {
  display: flex;
  align-items: center;
  min-height: 24px;
}
</style>
