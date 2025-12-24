<template>
    <div>
        <ManagePage v-model:data-source="filteredDataSource" :columns="columns" :editable-fields="editableFields"
            row-key="id" :page-size="PAGE_SIZE" search-placeholder="搜索sku" @search="handleSearch" @add="handleAdd"
            @save="handleSave" @row-delete="handleRowDelete" @batch-delete="handleBatchDelete" :show-add="false"
            :show-batch-delete="false" @selection-change="handleSelectionChange" :show-delete="false">

            <template #custom-tool>
                <a-select v-model="selectedBatchId" :options="batchOptions" style="margin-left: 5px;" placeholder="选择批次"
                    @change="handleBatchChange" />
                <a-button style="margin-left: 8px;" @click="handleEditClick" :disabled="isEditButtonDisabled">编辑
                </a-button>
            </template>

            <template #cell-washPriority="{ record }">
                <div style="display: flex;justify-content: center;align-items: center;">
                    <div v-show="record.tagPriority == 2"
                        style="border-radius: 15px;background-color: red;width: 15px;height: 15px;box-shadow: 1px 1px 15px red;">
                    </div>
                    <div v-show="record.tagPriority == 0"
                        style="border-radius: 15px;background-color: lightgreen;width: 15px;height: 15px;box-shadow: 1px 1px 15px lightgreen;">
                    </div>
                    <div v-show="record.tagPriority == 1"
                        style="border-radius: 15px;background-color: gold;width: 15px;height: 15px;box-shadow: 1px 1px 15px gold;">
                    </div>
                </div>
            </template>

            <template #cell-washStatus="{ record, isEditing, editableData, getInternalKey }">
                <!-- 显示状态 -->
                <template v-if="!isEditing">
                    <a-tag
                        :color="record.washStatus == 0 ? 'lightgrey' : record.washStatus == 1 ? 'orange' : record.washStatus == 2 ? 'pink' : record.washStatus == 3 ? 'green' : ''">
                        {{ record.washStatus == 0 ? '未下单' : record.washStatus == 1 ? '做货中' : record.washStatus == 2 ?
                            '货好等付款'
                            : record.washStatus == 3 ? '已出货' : '' }}
                    </a-tag>
                </template>
                <!-- 编辑状态 -->
                <template v-else>
                    <a-select v-model:value="editableData[getInternalKey(record)]!.washStatus" size="small"
                        style="width:120px">
                        <a-select-option :value="0">未下单</a-select-option>
                        <a-select-option :value="1">做货中</a-select-option>
                        <a-select-option :value="2">货好等付款</a-select-option>
                        <a-select-option :value="3">已出货</a-select-option>
                    </a-select>
                </template>
            </template>

            <template #cell-tagPriority="{ record }">
                <div style="display: flex;justify-content: center;align-items: center;">
                    <div v-show="record.tagPriority == 2"
                        style="border-radius: 15px;background-color: red;width: 15px;height: 15px;box-shadow: 1px 1px 15px red;">
                    </div>
                    <div v-show="record.tagPriority == 0"
                        style="border-radius: 15px;background-color: lightgreen;width: 15px;height: 15px;box-shadow: 1px 1px 15px lightgreen;">
                    </div>
                    <div v-show="record.tagPriority == 1"
                        style="border-radius: 15px;background-color: gold;width: 15px;height: 15px;box-shadow: 1px 1px 15px gold;">
                    </div>
                </div>
            </template>

            <template #cell-tagStatus="{ record, isEditing, editableData, getInternalKey }">
                <template v-if="!isEditing">
                    <a-tag
                        :color="record.tagStatus == 0 ? 'lightgrey' : record.tagStatus == 1 ? 'orange' : record.tagStatus == 2 ? 'pink' : record.tagStatus == 3 ? 'green' : ''">
                        {{ record.tagStatus == 0 ? '未下单' : record.tagStatus == 1 ? '做货中' : record.tagStatus == 2 ?
                            '货好等付款'
                            : record.tagStatus == 3 ? '已出货' : '' }}
                    </a-tag>
                </template>
                <template v-else>
                    <a-select v-model:value="editableData[getInternalKey(record)]!.tagStatus" size="small"
                        style="width:120px">
                        <a-select-option :value="0">未下单</a-select-option>
                        <a-select-option :value="1">做货中</a-select-option>
                        <a-select-option :value="2">货好等付款</a-select-option>
                        <a-select-option :value="3">已出货</a-select-option>
                    </a-select>
                </template>
            </template>

            <!-- 洗标出货时间选择器 -->
            <template #cell-washShipTime="{ record, isEditing, editableData, getInternalKey }">
                <template v-if="isEditing">
                    <a-date-picker show-time style="width: 100%;" placeholder="Select Time"
                        :value="editableData[getInternalKey(record)]!.washShipTime ? dayjs(editableData[getInternalKey(record)]!.washShipTime) : null"
                        @change="(val: any) => editableData[getInternalKey(record)]!.washShipTime = val ? val.toISOString() : null"
                        @ok="(val: any) => editableData[getInternalKey(record)]!.washShipTime = val ? val.toISOString() : null" />
                </template>
            </template>
            <!-- 吊牌出货时间选择器 -->
            <template #cell-tagShipTime="{ record, isEditing, editableData, getInternalKey }">
                <template v-if="isEditing">
                    <a-date-picker show-time style="width: 100%;" placeholder="Select Time"
                        :value="editableData[getInternalKey(record)]!.tagShipTime ? dayjs(editableData[getInternalKey(record)]!.tagShipTime) : null"
                        @change="(val: any) => editableData[getInternalKey(record)]!.tagShipTime = val ? val.toISOString() : null"
                        @ok="(val: any) => editableData[getInternalKey(record)]!.tagShipTime = val ? val.toISOString() : null" />
                </template>
            </template>
        </ManagePage>

        <!-- 编辑弹窗 模态框 -->
        <a-modal v-model:open="openEditModal" title="编辑记录" ok-text="确认" cancel-text="取消" @ok="handleEditSave"
            @cancel="handleEditCancelBtn" :confirmLoading="editUploadLoading">
            <!-- 编辑弹窗中动态生成表单项 -->
            <a-form layout="vertical" style="height: 450px; overflow-y: scroll;">
                <a-form-item v-for="field in editableFields" :key="field"
                    :label="columns.find((col: any) => col.dataIndex === field)?.title">
                    <!-- 普通输入 -->
                    <a-input v-if="field !== 'status' && !field.includes('Time')" :value="editForm[field]"
                        @update:value="(val: any) => editForm[field] = val" />
                    <!-- 下拉选择 -->
                    <a-select v-else-if="field === 'status'" :value="editForm[field]"
                        @update:value="(val: any) => editForm[field] = val">
                        <a-select-option :value="0">未下单</a-select-option>
                        <a-select-option :value="1">做货中</a-select-option>
                        <a-select-option :value="2">货好等付款</a-select-option>
                        <a-select-option :value="3">已出货</a-select-option>
                    </a-select>
                    <!-- 日期时间选择器 -->
                    <a-date-picker v-else-if="field.includes('Time')" show-time style="width: 100%;"
                        placeholder="Select Time" :value="editForm[field] ? dayjs(editForm[field]) : null"
                        @change="(val: any) => editForm[field] = val ? val.toISOString() : null"
                        @ok="(val: any) => editForm[field] = val ? val.toISOString() : null" />
                </a-form-item>
            </a-form>
        </a-modal>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, reactive, computed, nextTick } from 'vue'
import { message } from 'ant-design-vue'
import ManagePage from '@/components/ManagePage.vue'
import { accStore, editFormData } from '@/stores/acc-store'
import type { AccPurchaseContractType } from '@/types/acc-type'
import { formatTime } from '@/utils/formatTime'
import { updateFileWithInfo } from '@/api/services/acc-api'
import { tableImportStore } from '@/stores/tableImport-store'
import dayjs from 'dayjs'
import {  noticeGroup } from '@/api/services/webhookTableImport-api'


const editForm = reactive<Record<string, any>>({})
const editUploadLoading = ref(false)
const editUploadFile = ref<File | null>(null)
const editUploadFileList = ref<any>([])
const editUploadFileName = ref('')
const store = accStore
const PAGE_SIZE = 100
store.pageSize = PAGE_SIZE

const rawRows = ref<AccPurchaseContractType[]>([])
const dataSource = ref<AccPurchaseContractType[]>([])

const factoryOptions = computed(() => {
    const factories = new Set<string>()
    rawRows.value.forEach(row => {
        if (row.factory) {
            factories.add(row.factory)
        }
    })
    return Array.from(factories)
        .sort()
        .map(factory => ({ text: factory, value: factory }))
})

const followerOptions = computed(() => {
    const followers = new Set<string>()
    rawRows.value.forEach(row => {
        if (row.follower) {
            followers.add(row.follower)
        }
    })
    return Array.from(followers)
        .sort()
        .map(follower => ({ text: follower, value: follower }))
})

const columns = computed(() => {
    return [

        { title: '货号', dataIndex: 'sku', width: '125px' },
        { title: '颜色', dataIndex: 'color', width: '100px' },
        { title: '品牌', dataIndex: 'brand', width: '115px' },
        { title: '洗标颜色', dataIndex: 'washLabelColor', width: '80px' },
        { title: '洗标种类', dataIndex: 'washLabelType', width: '100px' },
        {
            title: '工厂',
            dataIndex: 'factory',
            width: '110px',
            filters: factoryOptions.value,
            onFilter: (value: any, record: any) => {
                return record.factory === value
            }
        },
        { title: '地址', dataIndex: 'address', width: '125px' },
        {
            title: '跟单',
            dataIndex: 'follower',
            width: '100px',
            filters: followerOptions.value,
            onFilter: (value: any, record: any) => {
                return record.follower === value
            }
        },
        { title: '数量', dataIndex: 'quantity', width: '100px' },
        { title: '洗标单价', dataIndex: 'washUnitPrice', width: '130px' },
        { title: '洗标总价', dataIndex: 'washTotalPrice', width: '130px' },
        { title: '吊牌单价', dataIndex: 'tagUnitPrice', width: '130px' },
        { title: '吊牌总价', dataIndex: 'tagTotalPrice', width: '130px' },
        { title: '洗标优先级', dataIndex: 'washPriority', width: '90px' },
        { title: '洗标状态', dataIndex: 'washStatus', width: '90px' },
        {
            title: '洗标确认时间',
            dataIndex: 'washConfirmTime',
            width: '140px',
            customRender: ({ text }: any) => formatTime(text)
        },
        {
            title: '洗标出货时间',
            dataIndex: 'washShipTime',
            width: '140px',
            customRender: ({ text }: any) => formatTime(text)
        },
        { title: '洗标实际出货数量', dataIndex: 'washShipQuantity', width: '130px' },
        { title: '洗标快递单号', dataIndex: 'washExpressNo', width: '120px' },

        { title: '吊牌优先级', dataIndex: 'tagPriority', width: '90px' },
        { title: '吊牌状态', dataIndex: 'tagStatus', width: '90px' },
        {
            title: '吊牌确认时间',
            dataIndex: 'tagConfirmTime',
            width: '140px',
            customRender: ({ text }: any) => formatTime(text)
        },
        {
            title: '吊牌出货时间',
            dataIndex: 'tagShipTime',
            width: '140px',
            customRender: ({ text }: any) => formatTime(text)
        },
        { title: '吊牌实际出货数量', dataIndex: 'tagShipQuantity', width: '140px' },
        { title: '吊牌快递单号', dataIndex: 'tagExpressNo', width: '120px' },
        { title: '英文品名', dataIndex: 'nameEn', width: '160px' },
        { title: '大面材料', dataIndex: 'materialMain', width: '160px' },
        { title: '里衬材质', dataIndex: 'materialLining', width: '160px' },
        {
            title: '创建时间',
            dataIndex: 'createdAt',
            width: '140px',
            sorter: (a: any, b: any) =>
                (new Date(a.createdAt ?? '').getTime() || 0) -
                (new Date(b.createdAt ?? '').getTime() || 0),
            customRender: ({ text }: any) => formatTime(text)
        },
        {
            title: '修改时间',
            dataIndex: 'updatedAt',
            width: '140px',
            sorter: (a: any, b: any) =>
                (new Date(a.updatedAt ?? '').getTime() || 0) -
                (new Date(b.updatedAt ?? '').getTime() || 0),
            customRender: ({ text }: any) => formatTime(text)
        },
        { title: '备注', dataIndex: 'remark', width: '180px' },
        { title: '批次id', dataIndex: 'importId', width: '120px' },
    ]
})

// 允许修改的字段
const editableFields = [
    'washUnitPrice',
    'tagUnitPrice',
    'tagTotalPrice',
    'washStatus',
    'washShipQuantity',
    'washShipTime',
    'washExpressNo',
    'tagStatus',
    'tagShipTime',
    'tagShipQuantity',
    'tagExpressNo',
    'remark',
]

// 设置表格数据
const setTableRows = (rows: AccPurchaseContractType[]) => {
    const newRows = (rows || []).map((r) => ({ ...r }))
    rawRows.value = newRows
    dataSource.value = newRows.map((r) => ({ ...r }))
    // 强制触发重新渲染 - 多重保障
    dataSource.value = [...dataSource.value]
    // 强制更新Vue的响应式系统
    nextTick(() => {
        // 再次触发更新，确保DOM重新渲染
        dataSource.value = [...dataSource.value]
        console.debug('[YDTable] nextTick: 强制更新dataSource完成')
    })
}
// 监听数据源改变
watch(
    () => store.pagedList,
    (list) => {
        setTableRows((list as AccPurchaseContractType[]) || [])
    },
    { immediate: true, deep: true },
)
// 初始化数据
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
    await store.search({ column: 'sku', keyword: trimmed } as any)
    setTableRows((store.searchResults as AccPurchaseContractType[]) || [])
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
    try {
        const payload: any = { productName: `新产品-${generateName()}`, status: 1 }
        await store.create(payload)
        await store.fetchPage()
    } catch (e) {
        console.error('添加失败', e)
    }
}
// 删除
const handleRowDelete = async (id: string | number) => {
    try {
        await store.remove([Number(id)])
        await store.fetchPage()
    } catch (e) {
        console.error('删除失败', e)
    }
}
// 批量删除
const handleBatchDelete = async ({ keys }: { keys: (string | number)[] }) => {
    try {
        const ids = keys.map((k) => Number(k))
        await store.remove(ids)
        await store.fetchPage()
    } catch (e) {
        console.error('批量删除失败', e)
    }
}

// 添加编辑按钮的逻辑
///
const selectedRow = ref();
const isEditButtonDisabled = computed(() => {
    return !selectedRow.value || Array.isArray(selectedRow.value) && selectedRow.value.length !== 1;
});
const openEditModal = ref(false);
const handleEditClick = () => {
    if (selectedRow.value) {
        Object.keys(editForm).forEach(k => delete editForm[k])
        Object.assign(editForm, selectedRow.value)
        openEditModal.value = true
    }
}
const handleEditSave = async () => {
    try {
        await store.update(editForm).then(() => {
            openEditModal.value = false
            store.fetchPage()
            // 重置表单
            Object.keys(editForm).forEach(k => delete editForm[k])
        })
    } catch (e) {
        message.error('修改失败')
        console.error(e)
    }
}
const handleEditCancelBtn = () => {
    openEditModal.value = false;
};
const handleSelectionChange = ({ rows }: { keys: (string | number)[]; rows: any[] }) => {
    selectedRow.value = rows.length === 1 ? rows[0] : null;
};
///
// 接收父组件的 openImport、openExport、openInfo、openHistory（双向绑定）并提供触发事件
const props = defineProps<{
    openImport?: boolean,
    openExport?: boolean,
    openInfo?: boolean,
    openHistory?: boolean
}>()
const emit = defineEmits(['update:openImport', 'update:openExport', 'update:openInfo', 'update:openHistory'])
// 保存方法
const handleSave = async (record: any) => {
    try {
        // 编辑替换文件
        if (editUploadFile.value) {
            const form = new FormData()
            form.append("file", editUploadFile.value)
            form.append("acc", new Blob([JSON.stringify(record)], { type: "application/json" }))
            await updateFileWithInfo(form)
            // 重置替换缓存
            editUploadFile.value = null
            editUploadFileList.value = []
            editUploadFileName.value = ''
            await noticeGroup(record.importId,record.sku)
        }
        if (!editUploadFile.value && editFormData.value) {
            await accStore.update(record)
            await noticeGroup(record.importId,record.sku)
        }
        // 无论如何都刷新数据
        await store.fetchPage()
        // 强制重新设置表格数据，确保更新
        setTimeout(() => {
            setTableRows(store.pagedList as AccPurchaseContractType[])
        }, 100)
    } catch (e) {
        console.error("保存失败", e)
    }
}

// 批次选择框
const selectedBatchId = ref<number | null>(null)
// 批次过滤后的数据源
const filteredDataSource = computed(() => {
    if (selectedBatchId.value === null) {
        return dataSource.value
    }
    return dataSource.value.filter(row => row.importId === selectedBatchId.value)
})
// 批次选择框的数据源
const batchOptions = computed(() => {
    return tableImportStore.list.map((batch: any) => ({
        label: `批次：${batch.id}`,
        value: batch.id
    }))
})
// 批次选择框的监听事件
const handleBatchChange = (value: number) => {
    selectedBatchId.value = value
}

</script>

<style scoped>
.changeImgA {
    margin-top: -40px;
    margin-left: 15px;
    color: white;
    text-shadow: 1px 1px 10px black;
}

.changeImgA:active {
    color: rgb(0, 0, 0);
    text-shadow: 1px 1px 10px rgb(255, 255, 255);
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s ease-in-out, transform 0.5s ease-in-out;
}

.fade-enter-from {
    opacity: 0;
    transform: scale(0.1);
}

.fade-enter-to {
    opacity: 1;
    transform: scale(1);
}

.fade-leave-from {
    opacity: 1;
    transform: scale(1);
}

.fade-leave-to {
    opacity: 0;
    transform: scale(0.1);
}

.fade-move {
    transition: transform 3s ease-in-out;
}
</style>
