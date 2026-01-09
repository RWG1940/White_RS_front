<template>
    <div class="yd-table-container">
        <ManagePage v-model:data-source="filteredDataSource" :columns="columns" :editable-fields="editableFields"
            row-key="id" :page-size="PAGE_SIZE" search-placeholder="搜索sku" @search="handleSearch" @add="handleAdd"
            @save="handleSave" @row-delete="handleRowDelete" @batch-delete="handleBatchDelete"
            @selection-change="handleSelectionChange">
            <template #custom-tool>
                <a-button class="custom-tool-btn" type="primary" @click="onImportClick">导入</a-button>
                <a-button class="custom-tool-btn" type="primary" @click="onExportClick">导出</a-button>
                <a-button class="custom-tool-btn" type="primary" @click="onHistoryClick">历史</a-button>
                <a-select v-model="selectedBatchId" :options="batchOptions" class="batch-select" placeholder="选择批次"
                    @change="handleBatchChange" />
                <a-button class="edit-btn" @click="handleEditClick" :disabled="isEditButtonDisabled">编辑</a-button>
            </template>

            <template #cell-__index__="{ index }">
                <span>{{ (index ?? 0) + 1 }}</span>
            </template>

            <template #cell-washPriority="{ record, isEditing, editableData, getInternalKey }">
                <template v-if="!isEditing">
                    <div class="priority-container">
                        <div v-show="record.washPriority == 2" class="priority-dot urgent"></div>
                        <div v-show="record.washPriority == 0" class="priority-dot normal"></div>
                        <div v-show="record.washPriority == 1" class="priority-dot medium"></div>
                    </div>
                </template>
                <template v-else>
                    <a-select v-model:value="editableData[getInternalKey(record)]!.washPriority" size="small"
                        class="priority-select">
                        <a-select-option :value="0">正常做</a-select-option>
                        <a-select-option :value="1">有点着急</a-select-option>
                        <a-select-option :value="2">非常着急安排优先</a-select-option>
                    </a-select>
                </template>
            </template>

            <template #cell-washStatus="{ record }">
                <a-tag
                    :color="record.washStatus == 0 ? 'lightgrey' : record.washStatus == 1 ? 'orange' : record.washStatus == 2 ? 'pink' : record.washStatus == 3 ? 'green' : ''">
                    {{ record.washStatus == 0 ? '未下单' : record.washStatus == 1 ? '做货中' : record.washStatus == 2 ?
                        '货好等付款'
                        : record.washStatus == 3 ? '已出货' : '' }}
                </a-tag>
            </template>

            <template #cell-tagPriority="{ record, isEditing, editableData, getInternalKey }">
                <template v-if="!isEditing">
                    <div class="priority-container">
                        <div v-show="record.tagPriority == 2" class="priority-dot urgent"></div>
                        <div v-show="record.tagPriority == 0" class="priority-dot normal"></div>
                        <div v-show="record.tagPriority == 1" class="priority-dot medium"></div>
                    </div>
                </template>
                <template v-else>
                    <a-select v-model:value="editableData[getInternalKey(record)]!.tagPriority" size="small"
                        class="priority-select">
                        <a-select-option :value="0">正常做</a-select-option>
                        <a-select-option :value="1">有点着急</a-select-option>
                        <a-select-option :value="2">非常着急安排优先</a-select-option>
                    </a-select>
                </template>
            </template>

            <template #cell-tagStatus="{ record }">
                <a-tag
                    :color="record.tagStatus == 0 ? 'lightgrey' : record.tagStatus == 1 ? 'orange' : record.tagStatus == 2 ? 'pink' : record.tagStatus == 3 ? 'green' : ''">
                    {{ record.tagStatus == 0 ? '未下单' : record.tagStatus == 1 ? '做货中' : record.tagStatus == 2 ? '货好等付款'
                        : record.tagStatus == 3 ? '已出货' : '' }}
                </a-tag>
            </template>

            <template #cell-imageUrl="{ record, isEditing }">
                <template v-if="!isEditing">
                    <Transition name="fade">
                        <a-row>
                            <template v-if="record.imageUrl">
                                <a-image :width="60" :height="60" :src="getImageUrl(record.imageUrl, record.updatedAt)" alt=""
                                    class="image-preview">
                                    <template #previewMask>
                                        <EyeOutlined />
                                    </template>
                                </a-image>
                            </template>
                            <template v-else>
                                <div class="no-image-placeholder">
                                    <span class="no-image-text">暂无图片</span>
                                </div>
                            </template>
                        </a-row>
                    </Transition>
                </template>
                <template v-else>
                    <Transition name="fade">
                        <a-row>
                            <img v-show="record.imageUrl && !editUploadFile" :src="getImageUrl(record.imageUrl, record.updatedAt)" alt=""
                                class="editable-image" />
                            <img v-show="editUploadFile" :src="editUploadFileList[0]?.url" alt=""
                                class="editable-image" />
                            <!-- 当这行已有图片时展示更换文字 -->
                            <a v-show="record.imageUrl" @click="openEdit = true" class="changeImgA">
                                {{ editUploadFile ? '待保存' : '更换' }}
                            </a>
                            <!-- 当这行没有图片时展示上传文字 -->
                            <a-button v-show="!record.imageUrl" @click="openUpload = true">
                                {{ uploadFile ? '重传' : '上传' }}
                            </a-button>
                            <!-- 上传后显示小的缩略图 -->
                            <a-row v-show="uploadFile" class="upload-preview-row">
                                <a-col :span="16" class="upload-preview-text">
                                    已传：
                                </a-col>
                                <a-col :span="8">
                                    <a-image :width="20" :src="uploadFileList[0]?.url" />
                                </a-col>
                            </a-row>
                        </a-row>
                    </Transition>
                </template>
            </template>

        </ManagePage>
        <!-- 上传图片 模态框 -->
        <a-modal v-model:open="openUpload" title="上传图片" ok-text="确认" cancel-text="取消" @ok="handleAddOk"
            @cancel="handleAddCancel" :confirmLoading="uploadLoading">
            <a-form layout="vertical">
                <a-form-item label="选择图片" required>
                    <a-upload :before-upload="beforeUpload" :max-count="1" :file-list="uploadFileList"
                        list-type="picture-card" @preview="handlePreview" @remove="handleRemove">
                        <div v-if="uploadFileList.length < 1">
                            <plus-outlined />
                            <div style="margin-top: 8px">点我上传</div>
                        </div>
                    </a-upload>
                    <a-modal :open="previewVisible" :title="previewTitle" @cancel="handleCancel" :footer="null">
                        <img style="width: 100%" :src="previewImage" />
                    </a-modal>
                </a-form-item>
            </a-form>
        </a-modal>

        <!-- 图片修改 模态框 -->
        <a-modal v-model:open="openEdit" title="修改图片" ok-text="确认" cancel-text="取消" @ok="handleEditOk"
            @cancel="handleEditCancel" :confirmLoading="editUploadLoading">
            <a-form layout="vertical">
                <a-form-item label="选择图片" required>
                    <a-upload :before-upload="beforeEditUpload" :max-count="1" :file-list="editUploadFileList"
                        list-type="picture-card" @preview="handlePreview" @remove="handleRemove">
                        <div v-if="editUploadFileList.length < 1">
                            <plus-outlined />
                            <div style="margin-top: 8px">点我上传</div>
                        </div>
                    </a-upload>
                    <a-modal :open="previewVisible" :title="previewTitle" @cancel="handleCancel" :footer="null">
                        <img style="width: 100%" :src="previewImage" />
                    </a-modal>
                </a-form-item>
            </a-form>
        </a-modal>

        <!-- 编辑弹窗 模态框 -->
        <a-modal v-model:open="openEditModal" title="编辑记录" ok-text="确认" cancel-text="取消" @ok="handleEditSave"
            @cancel="handleEditCancelBtn" :confirmLoading="editUploadLoading">
            <!-- 编辑弹窗中动态生成表单项 -->
            <a-form layout="vertical" class="edit-modal-form">
                <a-form-item v-for="field in editableFields" :key="field"
                    :label="columns.find((col: any) => col.dataIndex === field)?.title">

                    <!-- 洗标状态 -->
                    <a-select v-if="field === 'washStatus'" :value="editForm[field]"
                        @update:value="(val: any) => editForm[field] = val" class="status-select">
                        <a-select-option :value="0">未下单</a-select-option>
                        <a-select-option :value="1">做货中</a-select-option>
                        <a-select-option :value="2">货好等付款</a-select-option>
                        <a-select-option :value="3">已出货</a-select-option>
                    </a-select>

                    <!-- 吊牌状态 -->
                    <a-select v-else-if="field === 'tagStatus'" :value="editForm[field]"
                        @update:value="(val: any) => editForm[field] = val" class="status-select">
                        <a-select-option :value="0">未下单</a-select-option>
                        <a-select-option :value="1">做货中</a-select-option>
                        <a-select-option :value="2">货好等付款</a-select-option>
                        <a-select-option :value="3">已出货</a-select-option>
                    </a-select>

                    <!-- 洗标优先级 -->
                    <a-select v-else-if="field === 'washPriority'" :value="editForm[field]"
                        @update:value="(val: any) => editForm[field] = val" class="status-select">
                        <a-select-option :value="0">正常做</a-select-option>
                        <a-select-option :value="1">有点着急</a-select-option>
                        <a-select-option :value="2">非常着急安排优先</a-select-option>
                    </a-select>

                    <!-- 吊牌优先级 -->
                    <a-select v-else-if="field === 'tagPriority'" :value="editForm[field]"
                        @update:value="(val: any) => editForm[field] = val" class="status-select">
                        <a-select-option :value="0">正常做</a-select-option>
                        <a-select-option :value="1">有点着急</a-select-option>
                        <a-select-option :value="2">非常着急安排优先</a-select-option>
                    </a-select>

                    <!-- 图片上传 -->
                    <div v-else-if="field === 'imageUrl'" class="modal-image-upload">
                        <div class="modal-image-container">
                            <a-row v-if="editForm.imageUrl && !modalEditUploadFile" class="modal-image-row">
                                <a-image :width="60" :height="60" :src="getImageUrl(editForm.imageUrl, editForm.updatedAt)" alt=""
                                    class="modal-image-preview">
                                    <template #previewMask>
                                        <EyeOutlined />
                                    </template>
                                </a-image>
                            </a-row>
                            <a-row v-if="modalEditUploadFile" class="modal-image-row">
                                <a-image :width="60" :height="60" :src="modalEditUploadFileList[0]?.url" alt=""
                                    class="modal-image-preview">
                                </a-image>
                                <span class="pending-save-text">待保存</span>
                            </a-row>
                            <a-upload :before-upload="beforeModalEditUpload" :max-count="1"
                                :file-list="modalEditUploadFileList" list-type="text" @remove="handleModalEditRemove">
                                <a-button>选择图片</a-button>
                            </a-upload>
                        </div>
                    </div>

                    <!-- 普通输入 -->
                    <a-input v-else-if="!field.includes('Time')" :value="editForm[field]"
                        @update:value="(val: any) => editForm[field] = val" />
                </a-form-item>
            </a-form>
        </a-modal>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, reactive, computed, nextTick } from 'vue'
import { message, type TableColumnType } from 'ant-design-vue'
import ManagePage from '@/components/ManagePage.vue'
import { accStore, editFormData } from '@/stores/acc-store'
import type { AccPurchaseContractType } from '@/types/acc-type'
import { formatTime } from '@/utils/formatTime'
import { getBackendUrl } from '@/utils/api'
import { EyeOutlined, PlusOutlined } from '@ant-design/icons-vue'
import { addFileWithInfo, updateFileWithInfo } from '@/api/services/acc-api'
import { uploadFileWithInfo } from '@/api/services/fileResource-api'
import { tableImportStore } from '@/stores/tableImport-store'
import { noticeGroup } from '@/api/services/webhookTableImport-api'

const editForm = reactive<Record<string, any>>({})
// 图片 URL 处理：只在后端数据变化时改变 URL，避免每次渲染都生成新地址导致整列图片频繁重渲染
const getImageUrl = (imageUrl: string, updatedAt?: string | number) => {
    if (!imageUrl) return ''
    const baseUrl = getBackendUrl()
    if (!updatedAt) {
        return `${baseUrl}${imageUrl}`
    }
    const ts = new Date(updatedAt).getTime() || 0
    return `${baseUrl}${imageUrl}?t=${ts}`
}

// 文件上传和修改状态
const openUpload = ref(false)
const openEdit = ref(false)
const uploadLoading = ref(false)
const editUploadLoading = ref(false)
const uploadFile = ref<File | null>(null)
const editUploadFile = ref<File | null>(null)
const uploadFileList = ref<any>([])
const editUploadFileList = ref<any>([])
const uploadFileName = ref('')
const editUploadFileName = ref('')
// 编辑弹窗中的图片上传状态
const modalEditUploadFile = ref<File | null>(null)
const modalEditUploadFileList = ref<any>([])

const store = accStore
const PAGE_SIZE = 10
store.pageSize = PAGE_SIZE


const columns = computed(() => {
    return [
        {
            title: '序号',
            dataIndex: '__index__',
            width: '60px',
            fixed: true
        },
        { title: '季度', dataIndex: 'quarter', width: '65px', fixed: true },
        {
            title: '图片',
            dataIndex: 'imageUrl',
            width: '75px',
            fixed: true
        },

        { title: '货号', dataIndex: 'sku', width: '125px', fixed: true },
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
        {
            title: '跟单',
            dataIndex: 'follower',
            width: '80px',
            filters: followerOptions.value,
            onFilter: (value: any, record: any) => {
                return record.follower === value
            }
        },
        { title: '数量', dataIndex: 'quantity', width: '75px' },
        { title: '洗标实际出货数量', dataIndex: 'washShipQuantity', width: '130px' },
        { title: '吊牌实际出货数量', dataIndex: 'tagShipQuantity', width: '140px' },
        { title: '洗标单价', dataIndex: 'washUnitPrice', width: '75px' },
        { title: '洗标总价', dataIndex: 'washTotalPrice', width: '75px' },
        { title: '吊牌单价', dataIndex: 'tagUnitPrice', width: '75px' },
        { title: '吊牌总价', dataIndex: 'tagTotalPrice', width: '75px' },
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

const editableFields = [
    'imageUrl',
    'sku',
    'color',
    'brand',
    'nameEn',
    'materialMain',
    'materialLining',
    'washLabelColor',
    'washLabelType',
    'factory',
    'address',
    'follower',
    'quantity',
    // 'washUnitPrice',
    // 'washTotalPrice',
    // 'tagUnitPrice',
    // 'tagTotalPrice',
    'washPriority',
    //'washStatus',
    // 'washConfirmTime',
    // 'washShipQuantity',
    // 'washShipTime',
    // 'washExpressNo',
    'tagPriority',
    //'tagStatus',
    // 'tagConfirmTime',
    // 'tagShipTime',
    // 'tagShipQuantity',
    // 'tagExpressNo',
    // 'remark',
    // 'status',
    // 'priority',
    // 'createdAt',
    // 'updatedAt'
    'quarter',
    'importId'
]

const setTableRows = (rows: AccPurchaseContractType[]) => {
    // 只做必要的浅拷贝，避免多次强制刷新带来的性能开销
    const safeRows = rows ? rows.slice() : []
    rawRows.value = safeRows
    dataSource.value = safeRows.slice()
}

watch(
    () => store.pagedList,
    (list) => {
        setTableRows((list as AccPurchaseContractType[]) || [])
    },
    {
        immediate: true,
        // 只在引用变化时更新，避免深度监听造成的大量重渲染
        deep: false,
    },
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

// 接收父组件的 openImport、openExport、openInfo、openHistory（双向绑定）并提供触发事件
const props = defineProps<{
    openImport?: boolean,
    openExport?: boolean,
    openInfo?: boolean,
    openHistory?: boolean
}>()
const emit = defineEmits(['update:openImport', 'update:openExport', 'update:openInfo', 'update:openHistory'])
const onImportClick = () => {
    emit('update:openImport', true)
}
const onExportClick = () => {
    emit('update:openExport', true)
}
const onInfoClick = () => {
    emit('update:openInfo', true)
}
const onHistoryClick = () => {
    emit('update:openHistory', true)
}


// 文件上传和修改相关方法
// 文件暂存
const beforeUpload = async (file: File) => {
    const reader = new FileReader()

    reader.onload = e => {
        uploadFileList.value = [
            {
                uid: String(Date.now()),   // 必须
                name: file.name,           // 必须
                status: 'done',            // 必须（否则不展示）
                url: e.target?.result as string, // 必须（预览缩略图就靠它）
                originFileObj: file        // 必须
            }
        ]
    }
    reader.readAsDataURL(file)

    uploadFile.value = file
    return false  // 阻止自动上传
}


const beforeEditUpload = async (file: File) => {
    const reader = new FileReader()

    reader.onload = e => {
        editUploadFileList.value = [
            {
                uid: String(Date.now()),   // 必须
                name: file.name,           // 必须
                status: 'done',            // 必须（否则不展示）
                url: e.target?.result as string, // 必须（预览缩略图就靠它）
                originFileObj: file        // 必须
            }
        ]
    }
    reader.readAsDataURL(file)

    editUploadFile.value = file
    return false  // 阻止自动上传
}

// 新的保存方法
const handleSave = async (record: any) => {
    try {
        let hasFileOperation = false

        // 新增文件
        if (uploadFile.value) {
            hasFileOperation = true
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
            hasFileOperation = true
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

        // 无论如何都刷新数据，watch(store.pagedList) 会自动调用 setTableRows
        await store.fetchPage()

    } catch (e) {
        console.error("保存失败", e)
    }
}
const handleAddOk = () => {
    // 仅关闭弹窗，不上传
    openUpload.value = false
}

const handleAddCancel = () => {
    // 清空暂存数据
    uploadFile.value = null
    uploadFileList.value = []
    uploadFileName.value = ''
    openUpload.value = false
}


const handleEditOk = () => {
    // 仅关闭弹窗，不上传
    openEdit.value = false
}

const handleEditCancel = () => {
    // 清空暂存替换文件
    editUploadFile.value = null
    editUploadFileList.value = []
    editUploadFileName.value = ''
    openEdit.value = false
}
// 图片预览相关
const previewVisible = ref(false)
const previewImage = ref('')
const handlePreview = (file: any) => {
    previewImage.value = file.url
    previewVisible.value = true
}
const handleCancel = () => {
    previewVisible.value = false
}
const previewTitle = '图片预览'
const handleRemove = (file: any) => {
    uploadFileList.value = []
    uploadFile.value = null
    uploadFileName.value = ''
    editUploadFileList.value = []
    editUploadFile.value = null
    editUploadFileName.value = ''
    return true   // 必须返回 true，否则不会删
}

const selectedBatchId = ref<number | null>(null)

const filteredDataSource = computed(() => {
    if (selectedBatchId.value === null) {
        return dataSource.value
    }
    return dataSource.value.filter(row => row.importId === selectedBatchId.value)
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
        // 重置图片上传状态
        modalEditUploadFile.value = null
        modalEditUploadFileList.value = []
        openEditModal.value = true
    }
}

const handleEditSave = async () => {
    try {
        // 如果编辑弹窗中有新上传的图片
        if (modalEditUploadFile.value) {
            const form = new FormData()
            form.append("file", modalEditUploadFile.value)
            form.append("acc", new Blob([JSON.stringify(editForm)], { type: "application/json" }))
            await updateFileWithInfo(form)
            message.success("修改成功")
            // 重置上传状态
            modalEditUploadFile.value = null
            modalEditUploadFileList.value = []
        } else {
            // 没有上传图片，只更新文字信息
            await store.update(editForm)
            message.success("修改成功")
        }

        openEditModal.value = false
        await store.fetchPage()
        // 重置表单
        Object.keys(editForm).forEach(k => delete editForm[k])
        // 强制重新设置表格数据，确保更新
        setTimeout(() => {
            setTableRows(store.pagedList as AccPurchaseContractType[])
        }, 100)
    } catch (e) {
        message.error('修改失败')
        console.error(e)
    }
}



const handleEditCancelBtn = () => {
    openEditModal.value = false
    // 重置图片上传状态
    modalEditUploadFile.value = null
    modalEditUploadFileList.value = []
    // 重置表单
    Object.keys(editForm).forEach(k => delete editForm[k])
};
const handleSelectionChange = ({ rows }: { keys: (string | number)[]; rows: any[] }) => {
    selectedRow.value = rows.length === 1 ? rows[0] : null;
};
///

// 编辑弹窗中的图片上传方法
const beforeModalEditUpload = async (file: File) => {
    const reader = new FileReader()

    reader.onload = e => {
        modalEditUploadFileList.value = [
            {
                uid: String(Date.now()),
                name: file.name,
                status: 'done',
                url: e.target?.result as string,
                originFileObj: file
            }
        ]
    }
    reader.readAsDataURL(file)

    modalEditUploadFile.value = file
    return false
}

const handleModalEditRemove = () => {
    modalEditUploadFile.value = null
    modalEditUploadFileList.value = []
    return true
}
</script>

<style scoped>
.yd-table-container {
    width: 100%;
}

/* 工具按钮样式 */
.custom-tool-btn {
    margin-left: 5px;
}

.batch-select {
    margin-left: 5px;
    width: 150px;
}

.edit-btn {
    margin-left: 8px;
}

/* 优先级指示器样式 */
.priority-container {
    display: flex;
    justify-content: center;
    align-items: center;
}

.priority-dot {
    border-radius: 15px;
    width: 15px;
    height: 15px;
    box-shadow: 1px 1px 15px;
}

.priority-dot.urgent {
    background-color: red;
    box-shadow: 1px 1px 15px red;
}

.priority-dot.normal {
    background-color: lightgreen;
    box-shadow: 1px 1px 15px lightgreen;
}

.priority-dot.medium {
    background-color: gold;
    box-shadow: 1px 1px 15px gold;
}

.priority-select {
    width: 120px;
}

/* 图片相关样式 */
.image-preview {
    border-radius: 5px;
}

.no-image-placeholder {
    width: 60px;
    height: 60px;
    border-radius: 5px;
    background: #f5f5f5;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px dashed #d9d9d9;
}

.no-image-text {
    color: #999;
    font-size: 12px;
}

.editable-image {
    width: 60px;
    height: 60px;
    border-radius: 5px;
}

.upload-preview-row {
    margin-top: 5px;
}

.upload-preview-text {
    font-size: small;
    color: grey;
    font-style: italic;
}

/* 编辑弹窗样式 */
.edit-modal-form {
    height: 450px;
    overflow-y: scroll;
}

.status-select {
    width: 120px;
}

.modal-image-upload {
    display: flex;
    gap: 10px;
    align-items: center;
}

.modal-image-container {
    flex: 1;
}

.modal-image-row {
    margin-bottom: 10px;
}

.modal-image-preview {
    border-radius: 5px;
}

.pending-save-text {
    margin-left: 10px;
    color: orange;
}

/* 更换图片链接样式 */
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

/* 过渡动画 */
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
