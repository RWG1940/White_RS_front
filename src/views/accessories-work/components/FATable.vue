<template>
    <div>
        <ManagePage v-model:data-source="dataSource" :columns="columns" :editable-fields="editableFields" row-key="id" :show-operation="false" :show-add="false" :show-batch-delete="false"
            :page-size="PAGE_SIZE" search-placeholder="搜索辅料/款式/颜色" @search="handleSearch" @add="handleAdd"
            @save="handleSave" @row-delete="handleRowDelete" @batch-delete="handleBatchDelete"
            @selection-change="handleSelectionChange">
      
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
import { accStore } from '@/stores/acc-store'
import type { AccPurchaseContractType } from '@/types/acc-type'
import { formatTime } from '@/utils/formatTime'

const store = accStore
const PAGE_SIZE = 10
store.pageSize = PAGE_SIZE

const columns: TableColumnType<any>[] = [
    { title: '产品名', dataIndex: 'productName', width: '180px' },
    { title: '款式', dataIndex: 'style', width: '120px' },
    { title: '颜色', dataIndex: 'color', width: '100px' },
    { title: '洗标种类', dataIndex: 'washlabelType', width: '140px' },
    { title: '吊牌出货时间', dataIndex: 'hangtagShipTime', width: '190px', customRender: ({ text }) => formatTime(text) },
    { title: '洗标出货时间', dataIndex: 'washlabelShipTime', width: '190px', customRender: ({ text }) => formatTime(text) },
    { title: '配套吊牌文件确认时间', dataIndex: 'hangtagFileConfirmTime', width: '190px', customRender: ({ text }) => formatTime(text) },
    { title: '状态', dataIndex: 'status', width: '160px' },
    { title: '备注', dataIndex: 'remark', width: '220px' },
    { title: '优先级', dataIndex: 'priority', width: '120px' },

]

const rawRows = ref<AccPurchaseContractType[]>([])
const dataSource = ref<any[]>([])
const editableFields = ['productName', 'style', 'color', 'quantity', 'unitPrice', 'status', 'remark', 'priority', 'address', 'hangtagShipTime', 'washlabelShipTime', 'hangtagFileConfirmTime', 'extraJson', 'actualMaterial', 'liningMaterial', 'washlabelType', 'follower', 'totalPrice', 'actualShipQuantity']

const setTableRows = (rows: AccPurchaseContractType[]) => {
    rawRows.value = (rows || []).map((r) => ({ ...r }))
    dataSource.value = rawRows.value.map((r) => ({ ...r }))
    // 调试：打印首条记录查看字段名和内容
    if (rawRows.value.length) {
        console.debug('[YDTable] setTableRows sample record:', JSON.parse(JSON.stringify(rawRows.value[0])))
    } else {
        console.debug('[YDTable] setTableRows: no rows')
    }
}

watch(
    () => store.pagedList,
    (list) => {
        setTableRows((list as AccPurchaseContractType[]) || [])
    },
    { immediate: true, deep: true },
)

onMounted(async () => {
    await store.fetchPage()
    console.debug('[YDTable] store.pagedList sample:', JSON.parse(JSON.stringify(store.pagedList?.[0] ?? null)))
})

const handleSearch = async (keyword: string) => {
    const trimmed = keyword.trim()
    if (!trimmed) {
        await store.fetchPage()
        return
    }
    await store.search({ column: 'product_name', keyword: trimmed } as any)
    setTableRows((store.searchResults as AccPurchaseContractType[]) || [])
}

const generateName = (): string => {
    try {
        return crypto.randomUUID().replace(/-/g, '').slice(0, 6)
    } catch (e) {
        return Math.random().toString(36).slice(2, 8)
    }
}

const handleAdd = async () => {
    try {
        const payload: any = { productName: `新产品-${generateName()}`, status: 1 }
        await store.create(payload)
        await store.fetchPage()
    } catch (e) {
        console.error('添加失败', e)
    }
}

const handleSave = async (record: any) => {
    try {
        await store.update(record)
        await store.fetchPage()
    } catch (e) {
        console.error('保存失败', e)
    }
}

const handleRowDelete = async (id: string | number) => {
    try {
        await store.remove([Number(id)])
        await store.fetchPage()
    } catch (e) {
        console.error('删除失败', e)
    }
}

const handleBatchDelete = async ({ keys }: { keys: (string | number)[] }) => {
    try {
        const ids = keys.map((k) => Number(k))
        await store.remove(ids)
        await store.fetchPage()
    } catch (e) {
        console.error('批量删除失败', e)
    }
}

const handleSelectionChange = ({ rows }: { keys: (string | number)[]; rows: AccPurchaseContractType[] }) => {
    store.onSelectionChange(rows as any)
}


</script>

<style scoped>
/* 根据需要添加样式 */
</style>
