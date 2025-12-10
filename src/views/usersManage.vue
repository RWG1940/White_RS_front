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
      <template #cell-status="{ record, isEditing, editableData, getInternalKey }">
        <template v-if="!isEditing">
          <a-tag :color="record.status === 1 ? 'blue' : 'red'">
            {{ record.status === 1 ? '启用' : '禁用' }}
          </a-tag>
        </template>
        <template v-else>
          <a-select
            v-model:value="editableData[getInternalKey(record)]!.status"
            style="width: 100px"
            size="small"
          >
            <a-select-option :value="1">启用</a-select-option>
            <a-select-option :value="0">禁用</a-select-option>
          </a-select>
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
      <!-- 新增角色列的渲染插槽，展示每个角色的 name -->
      <template #cell-roles="{ record, isEditing, editableData, getInternalKey }">
        <div>
          <template v-if="!isEditing">
            <a-tag v-for="r in record.roles ?? []" :key="r.id" :color="r.id == 1 ? 'orange' : r.id == 3?'pink':r.id == 4?'purple':r.id == 5?'default':'lightgrey'" style="margin-right:6px">
              {{ r.name }}
            </a-tag>
          </template>
          <template v-else>
            <a-select
              mode="multiple"
              size="small"
              :value="(editableData[getInternalKey(record)]?.roles || []).map((r: any) => r.id)"
              @change="(vals:any) => onRolesChange(editableData, getInternalKey(record), vals)"
              style="min-width: 180px"
            >
              <a-select-option v-for="opt in allRoles" :key="opt.id" :value="opt.id">{{ opt.name }}</a-select-option>
            </a-select>
          </template>
        </div>
      </template>
    </ManagePage>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import type { TableColumnType } from 'ant-design-vue'
import ManagePage from '@/components/ManagePage.vue'
import { userStore, updateUserWithRoles, createUserWithRoles } from '@/stores/user-store'
import type { userType, userListType } from '@/types/user-type'
import type { roleType } from '@/types/role-type'
import { formatTime } from '@/utils/formatTime'
import dayjs from 'dayjs'
import { batchCheckUsersOnline } from '@/api/services/websocket-api'
import { roleStore } from '@/stores/role-store'


const store = userStore
const PAGE_SIZE = 15
store.pageSize = PAGE_SIZE

// 本地行类型：在 userType 基础上可能携带 roles
type LocalRow = userType & { roles?: roleType[] }

// 使用 any 避免与第三方 TableColumnType 复杂签名产生的类型不匹配警告
const columns = computed(() => {
  const roleFilters = (allRoles.value
    .filter((r) => r && r.id !== undefined && r.id !== null)
    .map((r) => ({ text: r.name ?? '', value: Number(r.id) })) ) as any[]

  return [
    {
      title: 'ID',
      dataIndex: 'id',
      width: '80px',
      sorter: (a: any, b: any) => Number(a.id ?? 0) - Number(b.id ?? 0),
      sortDirections: ['descend', 'ascend'] as any,
      filters: [
        { text: 'ID < 100', value: 'lt-100' },
        { text: '100 ≤ ID < 1000', value: 'between-100-999' },
        { text: 'ID ≥ 1000', value: 'gte-1000' },
      ],
      onFilter: (value: any, record: any) => {
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
      title: '角色',
      dataIndex: 'roles',
      width: '210px',
      // 根据 allRoles 生成筛选选项
      filters: roleFilters,
      onFilter: (value: any, record: any) => {
        const id = Number(value)
        const roles = record.roles ?? []
        return roles.some((rr: any) => Number(rr.id) === id)
      },
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
      width: '125px',
      filters: [
        { text: '启用', value: 1 },
        { text: '禁用', value: 0 },
      ],
      onFilter: (value: any, record: any) => {
        const target = Number(value)
        return (record.status ?? 0) === target
      },
    },
    {
      title: '在线状态',
      dataIndex: 'onlineStatus',
      width: '110px',
      filters: [
        { text: '在线', value: 'online' },
        { text: '离线', value: 'offline' },
      ],
      onFilter: (value: any, record: any) => {
        const isOnline = Boolean(record.onlineStatus)
        return value === 'online' ? isOnline : !isOnline
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: '180px',
      sorter: (a: any, b: any) => dayjs(a.createdAt).valueOf() - dayjs(b.createdAt).valueOf(),
      customRender: ({ text }: { text: any }) => formatTime(text),
      sortDirections: ['descend', 'ascend'] as any,
      filters: [
        { text: '最近 7 天', value: '7d' },
        { text: '最近 30 天', value: '30d' },
        { text: '今年', value: 'year' },
      ],
      onFilter: (value: any, record: any) => {
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
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      width: '130px',
      sorter: (a: any, b: any) => dayjs(a.updatedAt).valueOf() - dayjs(b.updatedAt).valueOf(),
      sortDirections: ['descend', 'ascend'] as any,
      filters: [
        { text: '最近 7 天', value: '7d' },
        { text: '最近 30 天', value: '30d' },
        { text: '今年', value: 'year' },
      ],
      customRender: ({ text }: { text: any }) => formatTime(text),

      onFilter: (value: any, record: any) => {
        const target = dayjs(record.updatedAt)
        if (!target.isValid()) return false
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
}) as unknown as any

// rawRows 保存 LocalRow[]，包含可选的 roles
const rawRows = ref<LocalRow[]>([])
const dataSource = ref<any[]>([])
const editableFields = ['username', 'email', 'phone', 'status', 'roles']
const onlineStatusMap = ref<Record<string, boolean>>({})
const onlineStatusLoading = ref(false)
// 所有可选角色（从后端获取）
const allRoles = ref<roleType[]>([])

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
  // 将本地行转换为供表格使用的 userType 行，同时注入 onlineStatus
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

// 支持后端返回 userType[] 或 userListType[] 两种格式，统一提取出 LocalRow 存入 rawRows
const setTableRows = (rows: (userType | userListType)[] = []) => {
  const normalized: LocalRow[] = rows.map((item: userType | userListType) => {
    if ((item as any).user) {
      const ul = item as userListType
      return { ...(ul.user as userType), roles: ul.roles }
    }
    return item as LocalRow
  })
  rawRows.value = normalized.map((item) => ({ ...item }))
  applyOnlineStatus()
  refreshOnlineStatus()
}

watch(
  () => store.pagedList,
  (list) => {
    // store.pagedList 可能是 userListType[] 或 userType[]，按上面逻辑传入
    setTableRows((list as any) ?? [])
  },
  { immediate: true, deep: true },
)

onMounted(async () => {
  await store.fetchPage()
  loadRoles()
})

const handleSearch = async (keyword: string) => {
  const trimmed = keyword.trim()
  if (!trimmed) {
    await store.fetchPage()
    return
  }
  await store.search({ column: 'username', keyword: trimmed } as any)
  setTableRows((store.searchResults as any) ?? [])
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
  try {
    // 新增用户默认赋予角色 id = 2
    const payload: any = { username: generateUsername(), status: 1, roles: [{ id: 2 }] }
    await createUserWithRoles(payload)
    await store.fetchPage()
  } catch (e) {
    console.error('添加用户失败', e)
  }
}

const handleSave = async (record: any) => {
  try {
    await updateUserWithRoles(record)
    await store.fetchPage()
  } catch (e) {
    console.error('保存用户失败', e)
  }
}

const handleRowDelete = async (id: string | number) => {
  try {
    await store.remove([Number(id)])
    await store.fetchPage()
  } catch (e) {
    console.error('删除用户失败', e)
  }
}

const handleBatchDelete = async ({ keys }: { keys: (string | number)[] }) => {
  try {
    const ids = keys.map((k) => Number(k))
    await store.remove(ids)
    await store.fetchPage()
  } catch (e) {
    console.error('批量删除用户失败', e)
  }
}

const handleSelectionChange = ({ rows }: { keys: (string | number)[]; rows: userType[] }) => {
  store.onSelectionChange(rows as any)
}

// 加载角色列表
const loadRoles = async () => {
  try {
    await roleStore.fetchAll().then(() => {
      allRoles.value = roleStore.list as roleType[]
    })
  } catch (e) {
    console.error('加载角色失败', e)
  }
}

// 编辑时角色选择变化处理：将选中的 role id 列表映射为 role 对象数组放回 editableData
const onRolesChange = (editableDataRef: any, key: string, selectedIds: (string | number)[]) => {
  const ed = editableDataRef[key]
  if (!ed) return
  const roles = allRoles.value.filter((r) => selectedIds.includes(r.id as any))
  ed.roles = roles
}

</script>

<style scoped>
.online-status-cell {
  display: flex;
  align-items: center;
  min-height: 24px;
}
</style>
