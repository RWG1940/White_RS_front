<template>
    <a-modal title="客户管理" :visible="guestTableVisible" width="900px" :footer="null" @cancel="handleClose">
        <ManagePage v-show="iscard" v-model:data-source="dataSource" :columns="columns"
            :editable-fields="editableFields" :is-bordered="false" row-key="id" :show-operation="true" :show-add="true"
            :show-batch-delete="true" v-model:total="store.total" v-model:currentPage="store.currentPage"
            v-model:pageSize="store.pageSize" search-placeholder="搜索角色" @search="handleSearch" @add="handleAdd"
            @save="handleSave" @row-delete="handleRowDelete" @batch-delete="handleBatchDelete"
            @selection-change="handleSelectionChange" @update:currentPage="pageChange"
            @update:pageSize="pageSizeChange">
            <template #custom-tool>
                <a-button type="primary" :disabled="store.selectedIds.length !== 1"
                    @click="handleSetBatch">设置批次关联</a-button>
            </template>
            <template #cell-status="{ record, isEditing, editableData, getInternalKey }">
                <template v-if="!isEditing">
                    <a-tag :color="record.status === 1 ? 'blue' : 'red'">
                        {{ record.status === 1 ? '正常' : '停用' }}
                    </a-tag>
                </template>
                <template v-else>
                    <a-select v-model:value="editableData[getInternalKey(record)]!.status" size="small"
                        style="width: 120px">
                        <a-select-option :value="1">正常</a-select-option>
                        <a-select-option :value="0">停用</a-select-option>
                    </a-select>
                </template>
            </template>
        </ManagePage>
        <div v-show="!iscard">
            <a-button @click="handleBack" style="margin-bottom: 10px;">返回</a-button>
            <GuestImportIdSetCard :guest-id="selectedGuestId" />
        </div>
    </a-modal>
</template>
<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import type { TableColumnType } from 'ant-design-vue'
import ManagePage from '@/components/ManagePage.vue'
import { guestStore } from '@/stores/guest-store'
import type { GuestType } from '@/types/guest-type'
import { formatTime } from '@/utils/formatTime'
import GuestImportIdSetCard from './GuestImportIdSetCard.vue'



const guestTableVisible = ref(false)
const iscard = ref(true)
const selectedGuestId = ref<number | null>(null)
const store = guestStore
// 分页大小
const PAGE_SIZE = 10
// 分页大小
store.pageSize = PAGE_SIZE
// 表格列
const columns: TableColumnType<any>[] = [
    { title: '客户名', dataIndex: 'name', width: '100px' },
    { title: '电话', dataIndex: 'phone', width: '120px' },
    { title: '地址', dataIndex: 'address', width: '120px' },
    { title: '邮箱', dataIndex: 'email', width: '120px' },
    { title: '描述', dataIndex: 'description', width: '150px' },
    { title: '状态', dataIndex: 'status', width: '70px' },
    { title: '创建时间', dataIndex: 'createdAt', width: '220px', customRender: ({ text }) => formatTime(text) },
    { title: '更新时间', dataIndex: 'updatedAt', width: '220px', customRender: ({ text }) => formatTime(text) },
]
// 表格原始数据
const rawRows = ref<GuestType[]>([])
// 表格数据
const dataSource = ref<any[]>([])
// 可编辑字段
const editableFields = ['name', 'phone', 'address', 'email', 'description']
// 设置表格数据
const setTableRows = (rows: GuestType[]) => {
    rawRows.value = (rows || []).map((r) => ({ ...r }))
    dataSource.value = rawRows.value.map((r) => ({ ...r }))
}
// 监听数据
watch(
    () => store.pagedList,
    (list) => {
        setTableRows((list as GuestType[]) || [])
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
    setTableRows((store.searchResults as GuestType[]) || [])
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
    const payload: any = { name: `新客户-${generateName()}` }
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
const handleSelectionChange = ({ rows }: { keys: (string | number)[]; rows: GuestType[] }) => {
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

// 设置批次关联
const handleSetBatch = () => {
    if (store.selectedIds.length === 1) {
        selectedGuestId.value = store.selectedIds[0] as number
        iscard.value = false
    }
}

// 返回按钮
const handleBack = () => {
    iscard.value = true
    selectedGuestId.value = null
}

// 监听弹窗关闭，重置状态
const handleClose = () => {
    iscard.value = true
    selectedGuestId.value = null
    // 重置store状态，清除多选等数据
    store.reset()
    // 重新获取数据，确保下次打开时数据是最新的
    store.fetchPage()
}

</script>

<style scoped></style>
