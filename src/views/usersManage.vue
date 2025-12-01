<template>
  <div>
    <ManagePage
      v-model:data-source="dataSource"
      :columns="columns"
      :editable-fields="editableFields"
      row-key="id"
      search-placeholder="搜索用户名"
      @search="handleSearch"
      @add="handleAddUser"
      @save="handleSave"
      @row-delete="handleRowDelete"
      @batch-delete="handleBatchDelete"
      @selection-change="handleSelectionChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import type { TableColumnType } from 'ant-design-vue'
import ManagePage from '@/components/ManagePage.vue'
import { cooperaMsgStore } from '@/stores/user-store'
import type { userType } from '@/types/user-type'

const store = cooperaMsgStore

const columns: TableColumnType<userType>[] = [
  {
    title: 'ID',
    dataIndex: 'id',
    width: '80px',
  },
  {
    title: '用户名',
    dataIndex: 'username',
    width: '20%',
  },
  {
    title: '邮箱',
    dataIndex: 'email',
    width: '25%',
  },
  {
    title: '手机号',
    dataIndex: 'phone',
    width: '20%',
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: '10%',
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    width: '20%',
  },
]

const dataSource = ref<userType[]>([])
const editableFields = ['username', 'email', 'phone', 'status']

watch(
  () => store.pagedList,
  (list) => {
    dataSource.value = list as userType[]
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
  dataSource.value = store.searchResults as userType[]
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

<style scoped></style>
