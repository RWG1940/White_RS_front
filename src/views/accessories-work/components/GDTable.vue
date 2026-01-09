<template>
    <div>
        <ManagePage v-model:data-source="filteredDataSource" :columns="columns" :editable-fields="editableFields"
            row-key="id" :page-size="PAGE_SIZE" search-placeholder="搜索sku" @search="handleSearch" @add="handleAdd"
            @save="handleSave" @row-delete="handleRowDelete" @batch-delete="handleBatchDelete" :show-add="false"
            :show-batch-delete="false" :show-delete="false" @selection-change="handleSelectionChange">
            <template #custom-tool>
                <a-select v-model="selectedBatchId" :options="batchOptions" style="margin-left: 5px;width:150px" placeholder="选择批次"
                    @change="handleBatchChange" />
            </template>
            <template #cell-__index__="{ index }">
                <span>{{ (index ?? 0) + 1 }}</span>
            </template>
            <template #cell-washPriority="{ record }">
                <div style="display: flex;justify-content: center;align-items: center;">
                    <div v-show="record.washPriority == 2"
                        style="border-radius: 15px;background-color: red;width: 15px;height: 15px;box-shadow: 1px 1px 15px red;">
                    </div>
                    <div v-show="record.washPriority == 0"
                        style="border-radius: 15px;background-color: lightgreen;width: 15px;height: 15px;box-shadow: 1px 1px 15px lightgreen;">
                    </div>
                    <div v-show="record.washPriority == 1"
                        style="border-radius: 15px;background-color: gold;width: 15px;height: 15px;box-shadow: 1px 1px 15px gold;">
                    </div>
                </div>
            </template>
            <template #cell-washStatus="{ record }">
                <a-tag
                    :color="record.washStatus == 0 ? 'lightgrey' : record.washStatus == 1 ? 'orange' : record.washStatus == 2 ? 'pink' : record.washStatus == 3 ? 'green' : ''">
                    {{ record.washStatus == 0 ? '未下单' : record.washStatus == 1 ? '做货中' : record.washStatus == 2 ?
                        '货好等付款'
                        : record.washStatus == 3 ? '已出货' : '' }}
                </a-tag>
            </template>
            <template #cell-tagPriority="{ record }">
                <div style="display: flex;justify-content: center;align-items: center;">
                    <div v-show="record.washPriority == 2"
                        style="border-radius: 15px;background-color: red;width: 15px;height: 15px;box-shadow: 1px 1px 15px red;">
                    </div>
                    <div v-show="record.washPriority == 0"
                        style="border-radius: 15px;background-color: lightgreen;width: 15px;height: 15px;box-shadow: 1px 1px 15px lightgreen;">
                    </div>
                    <div v-show="record.washPriority == 1"
                        style="border-radius: 15px;background-color: gold;width: 15px;height: 15px;box-shadow: 1px 1px 15px gold;">
                    </div>
                </div>
            </template>
            <template #cell-tagStatus="{ record }">
                <a-tag
                    :color="record.tagStatus == 0 ? 'lightgrey' : record.tagStatus == 1 ? 'orange' : record.tagStatus == 2 ? 'pink' : record.tagStatus == 3 ? 'green' : ''">
                    {{ record.tagStatus == 0 ? '未下单' : record.tagStatus == 1 ? '做货中' : record.tagStatus == 2 ? '货好等付款'
                        : record.tagStatus == 3 ? '已出货' : '' }}
                </a-tag>
            </template>
            <template #cell-imageUrl="{ record }">
                <Transition name="fade">
                    <a-row>
                        <template v-if="record.imageUrl">
                            <a-image :width="60" :height="60" :src="getImageUrl(record.imageUrl, record.updatedAt)" alt=""
                                style="border-radius: 5px;">
                                <template #previewMask>
                                    <EyeOutlined />
                                </template>
                            </a-image>
                        </template>
                        <template v-else>
                            <div
                                style="width: 60px; height: 60px; border-radius: 5px; background: #f5f5f5; display: flex; align-items: center; justify-content: center; border: 1px dashed #d9d9d9;">
                                <span style="color: #999; font-size: 12px;">暂无图片</span>
                            </div>
                        </template>
                    </a-row>
                </Transition>
            </template>
            <!-- 自定义操作列 -->
            <template #operation="{ record, isEditing, save, cancel, edit, remove }">
                <div class="editable-row-operations">
                    <span v-if="isEditing">
                        <a-typography-link @click="save(record.id)">保存</a-typography-link>
                        <a style="margin-left: 8px" @click="cancel(record.id)">取消</a>
                        <a-popconfirm title="确认删除?" ok-text="是" cancel-text="否" @confirm="remove(record.id)">
                            <a style="margin-left: 8px">删除</a>
                        </a-popconfirm>
                    </span>
                    <span v-else>
                        <a-button size="small" :disabled="record.status === 3"
                            :title="record.status === 3 ? '已出货的记录不能修改' : ''"
                            @click="canEditRow(record) ? edit(record.id) : message.warning('已出货的记录不能修改')">
                            编辑
                        </a-button>
                    </span>
                </div>
            </template>
        </ManagePage>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { message } from 'ant-design-vue'
import ManagePage from '@/components/ManagePage.vue'
import { accStore, editFormData } from '@/stores/acc-store'
import type { AccPurchaseContractType } from '@/types/acc-type'
import { formatTime } from '@/utils/formatTime'
import { getBackendUrl } from '@/utils/api'
import { EyeOutlined } from '@ant-design/icons-vue'
import { addFileWithInfo, updateFileWithInfo } from '@/api/services/acc-api'
import { tableImportStore } from '@/stores/tableImport-store'
import { useAuthStore } from '@/stores/auth-store'
import { noticeGroup } from '@/api/services/webhookTableImport-api'


// 图片URL处理，基于更新时间戳防止缓存
const getImageUrl = (imageUrl: string, updatedAt?: string | number) => {
    if (!imageUrl) return ''
    const baseUrl = getBackendUrl()
    if (updatedAt) {
        const timestamp = new Date(updatedAt).getTime()
        return `${baseUrl}${imageUrl}?t=${timestamp}`
    }
    return `${baseUrl}${imageUrl}`
}

const uploadFile = ref<File | null>(null)
const editUploadFile = ref<File | null>(null)
const uploadFileList = ref<any>([])
const editUploadFileList = ref<any>([])
const uploadFileName = ref('')
const editUploadFileName = ref('')
const store = accStore
const PAGE_SIZE = 10
store.pageSize = PAGE_SIZE
const rawRows = ref<AccPurchaseContractType[]>([])
const dataSource = ref<any[]>([])

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

const columns = computed(() => {
    return [
        {
            title: '序号',
            dataIndex: '__index__',
            width: '60px',
            fixed: true
        },
        { title: '季度', dataIndex: 'quarter', width: '65px' },
        {
            title: '图片',
            dataIndex: 'imageUrl',
            width: '75px',
        },
        { title: '货号', dataIndex: 'sku', width: '125px' },
        { title: '颜色', dataIndex: 'color', width: '80px' },
        { title: '品牌', dataIndex: 'brand', width: '100px' },
        { title: '英文品名', dataIndex: 'nameEn', width: '105px' },
        { title: '大面材料', dataIndex: 'materialMain', width: '120px' },
        { title: '里衬材质', dataIndex: 'materialLining', width: '95px' },
        { title: '洗标颜色', dataIndex: 'washLabelColor', width: '75px' },
        { title: '洗标种类', dataIndex: 'washLabelType', width: '100px' },
        {
            title: '工厂',
            dataIndex: 'factory',
            width: '95px',
            filters: factoryOptions.value,
            onFilter: (value: any, record: any) => {
                return record.factory === value
            }
        },
        { title: '地址', dataIndex: 'address', width: '110px' },
        { title: '跟单', dataIndex: 'follower', width: '80px' },
        { title: '数量', dataIndex: 'quantity', width: '75px' },
        { title: '洗标实际出货数量', dataIndex: 'washShipQuantity', width: '130px' },
        { title: '吊牌实际出货数量', dataIndex: 'tagShipQuantity', width: '140px' },
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

        { title: '洗标快递单号', dataIndex: 'washExpressNo', width: '110px' },

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

        { title: '吊牌快递单号', dataIndex: 'tagExpressNo', width: '110px' },
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
        { title: '批次id', dataIndex: 'importId', width: '75px' },
    ]
}) as unknown as any

const editableFields = [
    'factory',
    'address'
]

const setTableRows = (rows: AccPurchaseContractType[]) => {
    const safeRows = rows ? rows.slice() : []
    rawRows.value = safeRows
    dataSource.value = safeRows.slice()
}

watch(
    () => store.pagedList,
    (list) => {
        setTableRows((list as AccPurchaseContractType[]) || [])
    },
    { immediate: true },
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
    await store.search({ column: 'sku', keyword: trimmed } as any)
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

// 检查是否可以编辑该行（已出货的行不能编辑工厂和地址）
const canEditRow = (record: any): boolean => {
    if (record.washStatus == 3 || record.tagStatus == 3) {
        return false
    }
    return true
}

// 接收父组件的 openImport、openExport、openInfo、openHistory（双向绑定）并提供触发事件
const props = defineProps<{
    openImport?: boolean,
    openExport?: boolean,
    openInfo?: boolean,
    openHistory?: boolean
}>()
const emit = defineEmits(['update:openImport', 'update:openExport', 'update:openInfo', 'update:openHistory'])

// 新的保存方法
const handleSave = async (record: any) => {
    try {
        // 检查：如果状态为已出货(3)，禁止修改工厂和地址
        if (record.washStatus == 3 || record.tagStatus == 3) {
            // 检查是否修改了工厂或地址
            const originalRecord = store.pagedList.find((r: any) => r.id === record.id) as any
            if (originalRecord && (record.factory !== originalRecord.factory || record.address !== originalRecord.address)) {
                message.error('已出货的记录不能修改工厂和地址')
                return
            }
        }
        // 新增文件
        if (uploadFile.value) {

            const form = new FormData()
            form.append("file", uploadFile.value)
            form.append("acc", new Blob([JSON.stringify(record)], { type: "application/json" }))
            await addFileWithInfo(form)
            // 重置上传缓存
            uploadFile.value = null
            uploadFileList.value = []
            uploadFileName.value = ''
        }
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
            await noticeGroup(record.importId, record.sku)

        }
        if (!editUploadFile.value && editFormData.value) {

            await accStore.update(record)
            await noticeGroup(record.importId, record.sku)
        }
        // 无论如何都刷新数据
        await store.fetchPage()
    } catch (e) {
        console.error("保存失败", e)
    }
}

const selectedBatchId = ref<number | null>(null)
const filteredDataSource = computed(() => {
    if (selectedBatchId.value == null) {
        return dataSource.value.filter(row => row.follower == useAuthStore()!.user!.username)
    }
    return dataSource.value.filter(row => row.importId === selectedBatchId.value && row.follower == useAuthStore()!.user!.username)
})
const batchOptions = computed(() => {
    return tableImportStore.list.map((batch: any) => ({
        label: `批次：${batch.id}`,
        value: batch.id
    }))
})
const handleBatchChange = (value: number) => {
    selectedBatchId.value = value
}

</script>

<style scoped>
/* 根据需要添加样式 */
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
