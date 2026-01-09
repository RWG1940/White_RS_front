<template>
    <div>
        <ManagePage v-model:data-source="dataSource" :columns="columns" :editable-fields="editableFields" row-key="id"
            :show-operation="true" :show-add="true" :show-batch-delete="true" v-model:total="store.total"
            v-model:currentPage="store.currentPage" v-model:pageSize="store.pageSize" search-placeholder="搜索角色"
            @search="handleSearch" @add="handleAdd" @save="handleSave" @row-delete="handleRowDelete"
            @batch-delete="handleBatchDelete" @selection-change="handleSelectionChange" @update:currentPage="pageChange"
            @update:pageSize="pageSizeChange">
            <template #cell-status="{ record, isEditing, editableData, getInternalKey }">
                <template v-if="!isEditing">
                    <a-tag :color="record.status === 1 ? 'blue' : 'red'">
                        {{ record.status === 1 ? '正常' : '停用' }}
                    </a-tag>
                </template>
                <template v-else>
                    <a-select v-model:value="editableData[getInternalKey(record)]!.status" size="small"
                        style="width:120px">
                        <a-select-option :value="1">正常</a-select-option>
                        <a-select-option :value="0">停用</a-select-option>
                    </a-select>
                </template>
            </template>
        </ManagePage>
    </div>
</template>
<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import type { TableColumnType } from 'ant-design-vue'
import ManagePage from '@/components/ManagePage.vue'
import { roleStore } from '@/stores/role-store'
import type { roleType } from '@/types/role-type'
import { formatTime } from '@/utils/formatTime'
// 角色数据存储
const store = roleStore
// 分页大小
const PAGE_SIZE = 10
// 分页大小
store.pageSize = PAGE_SIZE
// 表格列
const columns: TableColumnType<any>[] = [
    { title: '角色名', dataIndex: 'name', width: '180px' },
    { title: '角色编码', dataIndex: 'code', width: '120px' },
    { title: '角色描述', dataIndex: 'description', width: '100px' },
    { title: '状态', dataIndex: 'status', width: '160px' },
    { title: '创建时间', dataIndex: 'createdAt', width: '220px', customRender: ({ text }) => formatTime(text) },
]
// 表格原始数据
const rawRows = ref<roleType[]>([])
// 表格数据
const dataSource = ref<any[]>([])
// 可编辑字段
const editableFields = ['name', 'code', 'description', 'status']
// 设置表格数据
const setTableRows = (rows: roleType[]) => {
    rawRows.value = (rows || []).map((r) => ({ ...r }))
    dataSource.value = rawRows.value.map((r) => ({ ...r }))
}
// 监听数据
watch(
    () => store.pagedList,
    (list) => {
        setTableRows((list as roleType[]) || [])
    },
    { immediate: true, deep: true },
)
// 获取数据
onMounted(async () => {
    await store.fetchPage()
})
// 搜索
const handleSearch = async (keyword: string) => {
    const trimmed = keyword.trim()
    if (!trimmed) {
        await store.fetchPage()
        return
    }
    await store.search({ column: 'name', keyword: trimmed } as any)
    setTableRows((store.searchResults as roleType[]) || [])
}
// 生成随机名称
const generateName = (): string => {
    try {
        return crypto.randomUUID().replace(/-/g, '').slice(0, 6)
    } catch (e) {
        return Math.random().toString(36).slice(2, 8)
    }
}
// 添加
const handleAdd = async () => {
    const payload: any = { name: `新角色-${generateName()}`, status: 1, code: generateName() }
    await store.create(payload)
    await store.fetchPage()
}
// 保存
const handleSave = async (record: any) => {
    await store.update(record)
    await store.fetchPage()
}
// 单个删除
const handleRowDelete = async (id: string | number) => {
    await store.remove([Number(id)])
    await store.fetchPage()
}
// 批量删除
const handleBatchDelete = async ({ keys }: { keys: (string | number)[] }) => {
    const ids = keys.map((k) => Number(k))
    await store.remove(ids)
    await store.fetchPage()
}
// 监听多选
const handleSelectionChange = ({ rows }: { keys: (string | number)[]; rows: roleType[] }) => {
    store.onSelectionChange(rows as any)
}

const pageChange = (val: number) => {
    store.currentPage = val
    store.fetchPage()
}
const pageSizeChange = (val: number) => {
    store.pageSize = val
    store.fetchPage()
}
</script>

<style scoped></style>
