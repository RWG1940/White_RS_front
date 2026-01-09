<template>
    <ScrollContent>
        <template #content>

            <div class="share-page">
                <a-card :title="shareTitle" class="share-card">
                    <template #extra>
                        <div v-if="fileSharing.expirationTime">
                            <a-tag :color="isExpired ? 'red' : 'green'">
                                {{ isExpired ? '已过期' : `有效期至 ${formatTime(fileSharing.expirationTime)}` }}
                            </a-tag>
                        </div>
                    </template>

                    <div v-if="loading" class="loading-container">
                        <a-spin size="large" />
                        <div style="margin-top: 16px">正在加载分享文件...</div>
                    </div>

                    <div v-else-if="error" class="error-container">
                        <a-result status="error" :title="error">
                            <template #extra>
                                <a-button type="primary" @click="loadShareFiles">重试</a-button>
                            </template>
                        </a-result>
                    </div>

                    <div v-else-if="!fileSharing.shareId">
                        <a-result status="404" title="分享不存在">
                            <template #extra>
                                <a-button type="primary" @click="$router.push('/')">返回首页</a-button>
                            </template>
                        </a-result>
                    </div>

                    <div v-else>
                        <div class="share-info">
                            <a-descriptions :column="1" size="small">
                                <a-descriptions-item label="分享人">
                                    {{ shareUserName }}
                                </a-descriptions-item>
                            </a-descriptions>
                        </div>

                        <div v-if="!isPwd" class="file-list-container">
                            <!-- 批量操作工具栏 -->
                            <div v-if="fileList.length > 0" class="batch-toolbar">
                                <a-space>
                                    <a-checkbox v-model:checked="selectAll" @change="handleSelectAll">
                                        全选
                                    </a-checkbox>
                                    <span>已选择 {{ selectedFileKeys.length }} 个文件</span>
                                    <a-button type="primary" :disabled="selectedFileKeys.length === 0 || isExpired"
                                        @click="batchDownload" :loading="batchDownloading">
                                        批量下载 ({{ selectedFileKeys.length }})
                                    </a-button>
                                    <a-button @click="clearSelection">清空选择</a-button>
                                </a-space>
                            </div>

                            <div class="table-wrapper">
                                <a-table :dataSource="fileList" :columns="columns" :pagination="false" rowKey="id"
                                    size="middle" :scroll="{ x: 800 }"
                                    :row-selection="{ selectedRowKeys: selectedFileKeys, onChange: onSelectChange }">
                                    <template #bodyCell="{ column, record }">
                                        <template v-if="column.key === 'fileName'">
                                            <div class="file-name-cell">
                                                <file-outlined />
                                                <span class="file-name">{{ record.fileName }}</span>
                                            </div>
                                        </template>
                                        <template v-else-if="column.key === 'fileSize'">
                                            {{ formatFileSize(record.fileSize) }}
                                        </template>
                                        <template v-else-if="column.key === 'fileType'">
                                            <a-tag>{{ record.fileExt?.toUpperCase() || '未知' }}</a-tag>
                                        </template>
                                        <template v-else-if="column.key === 'createTime'">
                                            {{ formatTime(record.createTime) }}
                                        </template>
                                        <template v-else-if="column.key === 'actions'">
                                            <div class="action-buttons">
                                                <a-button type="primary" size="small" @click="downloadFile(record)"
                                                    :disabled="isExpired">
                                                    下载
                                                </a-button>
                                                <a-button style="margin-left: 8px;" size="small"
                                                    @click="previewFile(record)" :disabled="isExpired">
                                                    预览
                                                </a-button>
                                            </div>
                                        </template>
                                    </template>
                                </a-table>
                            </div>
                        </div>
                        <div v-else class="password-container">
                            <div class="password-form">
                                <a-result title="请输入提取码" sub-title="此分享需要输入提取码才能查看文件">
                                    <template #icon>
                                        <lock-outlined style="font-size: 64px; color: #1890ff;" />
                                    </template>
                                    <template #extra>
                                        <div class="password-input-wrapper">
                                            <a-input-password v-model:value="password" placeholder="请输入提取码" size="large"
                                                style="width: 300px; margin-bottom: 16px;"
                                                @pressEnter="verifyPassword" />
                                            <a-button type="primary" size="large" @click="verifyPassword"
                                                :loading="verifying">
                                                确认
                                            </a-button>
                                        </div>
                                    </template>
                                </a-result>
                            </div>
                        </div>

                        <div v-if="fileList.length === 0" class="empty-container">
                            <a-empty description="暂无文件" />
                        </div>
                    </div>
                </a-card>
            </div>
        </template>
    </ScrollContent>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, h } from 'vue'
import { useRoute } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import { FileOutlined, LockOutlined } from '@ant-design/icons-vue'
import { getSharedFiles } from '@/stores/fileResource-store'
import { downloadFile as downloadFileApi } from '@/api/services/fileResource-api'
import type { FileResourceType } from '@/types/fileResource-type'
import { userApi } from '@/api/services/user-api'
import type { userType } from '@/types/user-type'
import { appConfig } from '@/config'
import ScrollContent from '@/components/scrollContent.vue'

interface FileSharing {
    shareId?: number
    ownerId?: number
    sharedWithUserId?: number | null
    shareLink?: string
    sharePassword?: string
    shareType?: string
    shareTime?: string
    expirationTime?: string
}

const route = useRoute()
const shareUrl = ref<string>('')
const fileSharing = ref<FileSharing>({})
const fileList = ref<FileResourceType[]>([])
const loading = ref(false)
const error = ref('')
const shareUserName = ref('')
const isPwd = ref(false)
const password = ref('')
const verifying = ref(false)
const selectedFileKeys = ref<number[]>([])
const selectAll = ref(false)
const batchDownloading = ref(false)

// 表格列配置
const columns = [
    {
        title: '文件名',
        dataIndex: 'fileName',
        key: 'fileName',
        ellipsis: true,
        width: 300,
        fixed: 'left',
    },
    {
        title: '大小',
        dataIndex: 'fileSize',
        key: 'fileSize',
        width: 100,
    },
    {
        title: '操作',
        key: 'actions',
        width: 75,
        fixed: 'right',
    },
]

// 计算分享标题
const shareTitle = computed(() => {
    if (fileList.value.length === 0) return '文件分享'
    if (fileList.value.length === 1) return `收到分享：${fileList.value[0]!.fileName}`
    return `收到分享：${fileList.value.length} 个文件`
})

// 计算是否已过期
const isExpired = computed(() => {
    if (!fileSharing.value.expirationTime) return false
    return new Date(fileSharing.value.expirationTime) < new Date()
})

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
    if (!bytes) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 格式化时间
const formatTime = (timeString: string): string => {
    if (!timeString) return ''
    return new Date(timeString).toLocaleString('zh-CN')
}

// 下载文件
const downloadFile = async (file: FileResourceType) => {
    if (!file.fileKey) {
        message.warning('文件路径不存在')
        return
    }
    try {
        const response = await downloadFileApi(file.fileKey)
        // 创建下载链接
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', file.fileName || 'download')
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
        message.success('下载开始')
    } catch (error) {
        console.error('下载文件失败:', error)
        message.error('下载文件失败')
    }
}

// 预览文件
const previewFile = (file: FileResourceType) => {
    if (!file.fileKey) {
        message.warning('文件路径不存在')
        return
    }

    // 根据文件类型选择预览方式
    const fileType = file.fileType?.toLowerCase() || ''
    const fileName = file.fileName?.toLowerCase() || ''

    // 图片文件预览
    if (isImageFile(fileType, fileName)) {
        showImagePreview(file)
        return
    }

    // Excel文件预览
    if (isExcelFile(fileType, fileName)) {
        showExcelPreview(file)
        return
    }

    // PDF文件预览
    if (isPdfFile(fileType, fileName)) {
        showPdfPreview(file)
        return
    }

    // 其他文件类型使用默认预览方式
    showDefaultPreview(file)
}

// 判断是否为图片文件
const isImageFile = (fileType: string, fileName: string): boolean => {
    const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg']
    const imageFileTypeKeywords = ['image', 'img']

    return imageTypes.some(type =>
        fileType.includes(type) || fileName.endsWith('.' + type)
    ) || imageFileTypeKeywords.some(keyword =>
        fileType.includes(keyword)
    )
}

// 判断是否为Excel文件
const isExcelFile = (fileType: string, fileName: string): boolean => {
    const excelTypes = ['xls', 'xlsx', 'csv']
    const excelFileTypeKeywords = ['excel', 'spreadsheet']

    return excelTypes.some(type =>
        fileType.includes(type) || fileName.endsWith('.' + type)
    ) || excelFileTypeKeywords.some(keyword =>
        fileType.includes(keyword)
    )
}

// 判断是否为PDF文件
const isPdfFile = (fileType: string, fileName: string): boolean => {
    return fileType.includes('pdf') || fileName.endsWith('.pdf')
}

// 显示图片预览
const showImagePreview = (record: FileResourceType) => {
    // 构建完整的图片URL
    const fullImageUrl = `${appConfig.backendUrl}/api/files/download/${record.fileKey}`

    Modal.info({
        title: `图片预览 - ${record.fileName}`,
        width: '80%',
        maskClosable: true,
        content: h('div', { style: { textAlign: 'center', padding: '20px', height: '70vh' } }, [
            h('img', {
                src: fullImageUrl,
                style: {
                    maxWidth: '100%',
                    maxHeight: '65vh',
                    objectFit: 'contain'
                },
                alt: record.fileName
            })
        ]),
        okText: '关闭',
    })
}

// 显示Excel预览（需要后端支持或使用第三方服务）
const showExcelPreview = (record: FileResourceType) => {
    // 构建完整的文件URL用于预览
    const fileUrl = `${appConfig.backendUrl}/api/files/download/${record.fileKey}`

    // 方案1：使用Google Sheets预览（需要文件可公开访问）
    const googleSheetsUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`

    // 方案2：使用Microsoft Office Online预览
    const officeUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`

    Modal.info({
        title: `Excel预览 - ${record.fileName}`,
        width: '80%',
        maskClosable: true,
        content: h('div', { style: { height: '70vh' } }, [
            h('iframe', {
                src: officeUrl,
                style: {
                    width: '100%',
                    height: '100%',
                    border: 'none'
                },
                frameborder: '0'
            })
        ]),
        okText: '关闭',
        onOk() {
            console.log('关闭Excel预览')
        }
    })
}

// 显示PDF预览
const showPdfPreview = async (record: FileResourceType) => {
    // 构建完整的PDF文件URL
    const pdfUrl = `${appConfig.backendUrl}/api/files/download/${record.fileKey}`

    try {
        // 下载PDF文件
        const response = await downloadFileApi(record.fileKey!)
        const blob = new Blob([response.data], { type: 'application/pdf' })
        const blobUrl = URL.createObjectURL(blob)

        // 使用iframe预览PDF
        Modal.info({
            title: `PDF预览 - ${record.fileName}`,
            width: '80%',
            maskClosable: true,
            content: h('div', { style: { height: '70vh' } }, [
                h('iframe', {
                    src: blobUrl,
                    style: {
                        width: '100%',
                        height: '100%',
                        border: 'none'
                    },
                    frameborder: '0'
                })
            ]),
            okText: '关闭',
            onOk() {
                // 清理Blob URL
                URL.revokeObjectURL(blobUrl)
                console.log('关闭PDF预览')
            },
            afterClose() {
                // 确保在关闭后清理Blob URL
                URL.revokeObjectURL(blobUrl)
            }
        })
    } catch (error) {
        console.error('PDF预览失败:', error)
        message.error('PDF预览失败，请尝试下载文件')
    }
}

// 默认预览方式（下载或直接打开）
const showDefaultPreview = (record: FileResourceType) => {
    // 对于不支持直接预览的文件类型，提供下载选项
    Modal.confirm({
        title: '文件预览',
        content: `文件类型"${record.fileType}"不支持在线预览，是否下载该文件？`,
        okText: '下载',
        cancelText: '取消',
        onOk() {
            downloadFile(record)
        }
    })
}

// 加载分享文件
const loadShareFiles = async () => {
    if (!shareUrl.value) return
    loading.value = true
    error.value = ''
    try {
        const result = await getSharedFiles(shareUrl.value)
        // 兼容旧的数据结构
        fileSharing.value = result.fileSharing || {}
        fileList.value = result.fileResourceList || []
        getShareUserName(fileSharing.value.ownerId!)

        if (!fileSharing.value.shareId) {
            error.value = '分享链接无效或已过期'
        }

        // 检查是否需要密码验证
        if (fileSharing.value.sharePassword && fileSharing.value.sharePassword !== '') {
            isPwd.value = true
        }
    } catch (err: any) {
        error.value = err.message || '加载分享文件失败'
        message.error(error.value)
    } finally {
        loading.value = false
    }
}

// 验证密码
const verifyPassword = async () => {
    if (!password.value.trim()) {
        message.warning('请输入提取码')
        return
    }

    verifying.value = true
    try {
        // 这里需要调用后端API验证密码
        // 暂时使用前端验证，后续需要对接后端
        if (password.value === fileSharing.value.sharePassword) {
            isPwd.value = false
            message.success('密码验证成功')
        } else {
            message.error('提取码错误，请重新输入')
            password.value = ''
        }
    } catch (err: any) {
        message.error('密码验证失败：' + (err.message || '未知错误'))
    } finally {
        verifying.value = false
    }
}

// 获取分享人姓名
const getShareUserName = async (shareId: number) => {
    const res = await userApi.get(shareId)
    const user = res.data.data.user as userType
    shareUserName.value = user.username || '未知'
}

// 选择变化处理
const onSelectChange = (selectedKeys: number[]) => {
    selectedFileKeys.value = selectedKeys
    selectAll.value = selectedKeys.length === fileList.value.length && fileList.value.length > 0
}

// 全选处理
const handleSelectAll = (e: any) => {
    if (e.target.checked) {
        selectedFileKeys.value = fileList.value.map(file => file.id!)
    } else {
        selectedFileKeys.value = []
    }
    selectAll.value = e.target.checked
}

// 清空选择
const clearSelection = () => {
    selectedFileKeys.value = []
    selectAll.value = false
}

// 批量下载文件
const batchDownload = async () => {
    if (selectedFileKeys.value.length === 0) {
        message.warning('请选择要下载的文件')
        return
    }

    const selectedFiles = fileList.value.filter(file => selectedFileKeys.value.includes(file.id!))

    // 如果只选择了一个文件，直接下载单个文件
    if (selectedFiles.length === 1) {
        await downloadFile(selectedFiles[0]!)
        return
    }

    batchDownloading.value = true

    try {
        // 逐个下载文件
        for (const file of selectedFiles) {
            if (!file.fileKey) continue

            try {
                const response = await downloadFileApi(file.fileKey)
                const url = window.URL.createObjectURL(new Blob([response.data]))
                const link = document.createElement('a')
                link.href = url
                link.setAttribute('download', file.fileName || 'download')
                document.body.appendChild(link)
                link.click()
                link.remove()
                window.URL.revokeObjectURL(url)

                // 添加小延迟，避免浏览器同时下载多个文件导致阻塞
                await new Promise(resolve => setTimeout(resolve, 100))
            } catch (error) {
                console.error(`下载文件 ${file.fileName} 失败:`, error)
                message.error(`下载文件 ${file.fileName} 失败`)
            }
        }

        message.success(`已开始下载 ${selectedFiles.length} 个文件`)

        // 下载完成后清空选择
        clearSelection()
    } catch (error) {
        console.error('批量下载失败:', error)
        message.error('批量下载失败')
    } finally {
        batchDownloading.value = false
    }
}

onMounted(() => {
    shareUrl.value = route.params.shareUrl as string
    if (shareUrl.value) {
        loadShareFiles()
    } else {
        error.value = '分享链接无效'
    }
})


</script>

<style scoped>
.share-page {
    padding: 24px;
    min-height: 100vh;
    background-color: #f5f5f5;
}

.share-card {
    max-width: 1200px;
    margin: 0 auto;
}

.loading-container,
.error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 0;
}

.share-info {
    margin-bottom: 24px;
    padding: 16px;
    background-color: #f8f9fa;
    border-radius: 6px;
    border: 1px solid #e8e8e8;
}

.share-link {
    font-family: 'Courier New', monospace;
    background-color: #f0f0f0;
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 12px;
}

.file-list-container {
    margin-top: 24px;
}

.batch-toolbar {
    margin-bottom: 16px;
    padding: 12px 16px;
    background-color: #f8f9fa;
    border: 1px solid #e8e8e8;
    border-radius: 6px;
}

.file-name-cell {
    display: flex;
    align-items: center;
    gap: 8px;
}

.file-name {
    max-width: 280px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.empty-container {
    padding: 60px 0;
}

.password-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 300px;
    padding: 40px 0;
}

.password-form {
    width: 100%;
    max-width: 500px;
    text-align: center;
}

.password-input-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
}

:deep(.ant-descriptions-item-label) {
    font-weight: 600;
}
</style>