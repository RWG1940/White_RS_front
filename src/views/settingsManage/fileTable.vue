<template>
    <div>
        <ManagePage v-model:data-source="dataSource" :columns="columns" :editable-fields="editableFields" row-key="id"
            :show-operation="true" :show-add="true" :show-batch-delete="true" v-model:total="store.total"
            v-model:currentPage="store.currentPage" v-model:pageSize="store.pageSize" search-placeholder="搜索文件名"
            @search="handleSearch" @add="handleAdd" @save="handleSave" @row-delete="handleRowDelete"
            @batch-delete="handleBatchDelete" @selection-change="handleSelectionChange" @update:currentPage="pageChange"
            @update:pageSize="pageSizeChange">
            <template #custom-tool>
                <a-button type="primary" :disabled="selectedKeys.length === 0" @click="handleReupload">重新上传</a-button>
            </template>
        </ManagePage>
        <!-- 上传文件 模态框 -->
        <a-modal v-model:open="openUpload" title="上传文件" ok-text="确认上传" cancel-text="取消" @ok="handleOk"
            @cancel="handleCancel" :confirmLoading="uploadLoading">
            <a-form layout="vertical">
                <a-form-item label="选择文件" required>
                    <a-upload :before-upload="beforeUpload" :max-count="1" :file-list="uploadFileList"
                        :on-remove="removeFile" :show-upload-list="false">
                        <a-button>
                            <UploadOutlined />
                        </a-button>
                        <span style="margin-left:8px">{{ uploadFileName || '未选择文件' }}</span>
                    </a-upload>
                </a-form-item>

                <a-form-item label="业务类型">
                    <a-input v-model:value="bizType" placeholder="可选，示例: invoice" />
                </a-form-item>

                <a-form-item label="业务ID">
                    <a-input-number v-model:value="bizId" style="width: 100%" />
                </a-form-item>
            </a-form>
        </a-modal>
        <!-- 文件修改 模态框 -->
        <a-modal v-model:open="openEdit" title="重新上传（替换文件）" ok-text="确认替换" cancel-text="取消" @ok="handleEditOk"
            @cancel="handleEditCancel" :confirmLoading="editUploadLoading">
            <a-form layout="vertical">
                <a-form-item label="当前选中文件">
                    <div>{{ selectedRows[0]?.fileName || '-' }} （key: {{ selectedRows[0]?.fileKey || '-' }}）</div>
                </a-form-item>
                <a-form-item label="选择新文件" required>
                    <a-upload :before-upload="beforeEditUpload" :max-count="1" :file-list="editUploadFileList"
                        :on-remove="removeEditFile" :show-upload-list="false">
                        <a-button>
                            <UploadOutlined />
                        </a-button>
                        <span style="margin-left:8px">{{ editUploadFileName || '未选择文件' }}</span>
                    </a-upload>
                </a-form-item>
            </a-form>
        </a-modal>

    </div>
</template>
<script setup lang="ts">
import { ref, watch, onMounted, h } from 'vue'
import type { TableColumnType } from 'ant-design-vue'
import { Tooltip } from 'ant-design-vue'
import ManagePage from '@/components/ManagePage.vue'
import { fileResourceStore } from '../../stores/fileResource-store'
import type { FileResourceType } from '@/types/fileResource-type'
import { formatTime } from '@/utils/formatTime'
import { appConfig } from '@/config'
import { message } from 'ant-design-vue'
import { uploadFileWithInfo, updateFileWithInfo } from '@/api/services/fileResource-api'
import { useAuthStore } from '@/stores/auth-store'
import { UploadOutlined } from '@ant-design/icons-vue'

const authStore = useAuthStore()
// 上传弹窗状态
const openUpload = ref(false)
// 文件资源数据存储
const store = fileResourceStore
// 分页大小
const PAGE_SIZE = 10
// 设置分页大小
store.pageSize = PAGE_SIZE

// 文件大小格式化
const formatFileSize = (size?: number) => {
    if (size === undefined || size === null) return ''
    if (size === 0) return '0 B'
    const units = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(size) / Math.log(1024))
    const v = size / Math.pow(1024, i)
    return v.toFixed(2) + ' ' + (units[i] || 'B')
}

// 是否删除格式化
const formatDeleted = (v?: number) => {
    if (v === undefined || v === null) return '-'
    return v === 1 ? '已删除' : '正常'
}

// 表格列
const columns: TableColumnType<any>[] = [
    { title: 'ID', dataIndex: 'id', width: '80px', ellipsis: true },
    { title: '文件名', dataIndex: 'fileName', width: '260px', ellipsis: true },
    { title: '对象路径', dataIndex: 'fileKey', width: '260px', ellipsis: true },
    {
        title: '链接', dataIndex: 'fileUrl', width: '140px', customRender: ({ text }) => {
            if (!text) return '-'
            return h(
                Tooltip,
                { title: String(text) },
                {
                    default: () => h(
                        'a',
                        {
                            href: appConfig.backendUrl + String(text),
                            target: '_blank',
                            rel: 'noopener',
                            style: {
                                display: 'inline-block',
                                maxWidth: '120px',
                                overflow: 'hidden',
                                whiteSpace: 'nowrap',
                                textOverflow: 'ellipsis',
                            },
                        },
                        '下载',
                    ),
                },
            )
        }, ellipsis: true
    },
    { title: '大小', dataIndex: 'fileSize', width: '120px', customRender: ({ text }) => formatFileSize(text) },
    { title: '类型', dataIndex: 'fileType', width: '140px', ellipsis: true },
    { title: '扩展名', dataIndex: 'fileExt', width: '100px' },
    { title: 'Bucket', dataIndex: 'bucket', width: '140px' },
    { title: '业务类型', dataIndex: 'bizType', width: '120px' },
    { title: '业务ID', dataIndex: 'bizId', width: '100px' },
    { title: '上传者', dataIndex: 'creatorId', width: '100px' },
    { title: '是否删除', dataIndex: 'isDeleted', width: '100px', customRender: ({ text }) => formatDeleted(text) },
    { title: '创建时间', dataIndex: 'createTime', width: '180px', customRender: ({ text }) => formatTime(text) },
    { title: '更新时间', dataIndex: 'updateTime', width: '180px', customRender: ({ text }) => formatTime(text) },
]

// 表格原始数据
const rawRows = ref<FileResourceType[]>([])
// 表格数据
const dataSource = ref<any[]>([])
// 可编辑字段（按需填写可编辑的字段名）
const editableFields: string[] = ['fileName', 'fileSize', 'fileType', 'fileExt', 'bucket', 'bizType', 'bizId', 'creatorId', 'isDeleted', 'createTime', 'updateTime']

// 设置表格数据
const setTableRows = (rows: FileResourceType[]) => {
    rawRows.value = (rows || []).map((r) => ({ ...r }))
    dataSource.value = rawRows.value.map((r) => ({ ...r }))
}

// 监听数据
watch(
    () => store.pagedList,
    (list) => {
        setTableRows((list as FileResourceType[]) || [])
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
    await store.search({ column: 'file_name', keyword: trimmed } as any)
    setTableRows((store.searchResults as FileResourceType[]) || [])
}

// 生成随机名称
const generateName = (): string => {
    try {
        return crypto.randomUUID().replace(/-/g, '').slice(0, 6)
    } catch (e) {
        return Math.random().toString(36).slice(2, 8)
    }
}

// 添加弹窗显示
const handleAdd = async () => {
    openUpload.value = true
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

// 选中行状态（由 ManagePage 的 selection-change 填充）
const selectedKeys = ref<(string | number)[]>([])
const selectedRows = ref<FileResourceType[]>([])

// 重新上传（编辑）相关状态
const openEdit = ref(false)
const editUploadFile = ref<File | null>(null)
const editUploadFileList = ref<any[]>([])
const editUploadFileName = ref<string>('')
const editUploadLoading = ref(false)

// ManagePage selection-change 监听（覆盖之前的实现，保留调用 store.onSelectionChange）
const handleSelectionChange = ({ keys, rows }: { keys: (string | number)[]; rows: FileResourceType[] }) => {
    selectedKeys.value = keys
    selectedRows.value = rows as FileResourceType[]
    store.onSelectionChange(rows as any)
}

// 点击重新上传按钮
const handleReupload = () => {
    if (selectedKeys.value.length === 0) return
    if (selectedKeys.value.length > 1) {
        message.warning('请仅选择一条记录进行重新上传')
        return
    }
    openEdit.value = true
}

// 编辑上传的 beforeUpload
const beforeEditUpload = (file: File) => {
    editUploadFile.value = file
    editUploadFileName.value = file.name
    editUploadFileList.value = [file as any]
    return false
}
const removeEditFile = () => {
    editUploadFile.value = null
    editUploadFileList.value = []
    editUploadFileName.value = ''
}

const handleEditCancel = () => {
    openEdit.value = false
    removeEditFile()
}

const handleEditOk = async () => {
    if (!editUploadFile.value) {
        message.error('请先选择要上传的文件')
        return
    }
    if (!selectedRows.value || selectedRows.value.length === 0) {
        message.error('未找到选中的记录')
        return
    }
    const target = selectedRows.value[0]
    if (!target || !target.fileKey) {
        message.error('选中记录缺少 fileKey，无法更新')
        return
    }
    editUploadLoading.value = true
    try {
        const form = new FormData()
        form.append('file', editUploadFile.value)
        // 可选：保留 bizType/bizId
        if (target.bizType) form.append('bizType', String(target.bizType))
        if (target.bizId !== undefined && target.bizId !== null) form.append('bizId', String(target.bizId))

        await updateFileWithInfo(String(target.fileKey), form)
        message.success('替换成功')
        handleEditCancel()
        await store.fetchPage()
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error('update file error', e)
        message.error('替换失败')
    } finally {
        editUploadLoading.value = false
    }
}

// 上传相关状态
const uploadFile = ref<File | null>(null)
const uploadFileList = ref<any[]>([])
const uploadFileName = ref<string>('')
const bizType = ref<string | undefined>(undefined)
const bizId = ref<number | undefined>(undefined)
const creatorId = ref<number | undefined>(undefined)
const uploadLoading = ref(false)

// beforeUpload: 拦截文件，保存到 state 中，阻止默认自动上传
const beforeUpload = (file: File) => {
    uploadFile.value = file
    uploadFileName.value = file.name
    uploadFileList.value = [file as any]
    return false // 阻止 a-upload 自动上传
}

const removeFile = () => {
    uploadFile.value = null
    uploadFileList.value = []
    uploadFileName.value = ''
}

const handleCancel = () => {
    openUpload.value = false
    removeFile()
    bizType.value = undefined
    bizId.value = undefined
    creatorId.value = undefined
}

const handleOk = async () => {
    if (!uploadFile.value) {
        message.error('请先选择要上传的文件')
        return
    }
    uploadLoading.value = true
    try {
        const form = new FormData()
        form.append('file', uploadFile.value)
        if (bizType.value) form.append('bizType', bizType.value)
        if (bizId.value !== undefined && bizId.value !== null) form.append('bizId', String(bizId.value))
        if (authStore.user != null) {
            form.append('creatorId', String(authStore.user.id))
        }
        await uploadFileWithInfo(form).then(async (res) => {
            message.success('上传成功')
            handleCancel()
            await store.fetchPage()
        })
    } catch (e) {
        console.error('upload error', e)
        message.error('上传失败')
    } finally {
        uploadLoading.value = false
    }
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
<style></style>