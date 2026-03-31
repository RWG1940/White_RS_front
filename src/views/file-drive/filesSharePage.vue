<template>
  <div class="share-page-mobile">
    <div v-if="loading" class="loading-container">
      <a-spin size="large" />
      <div class="loading-text">正在加载分享文件...</div>
    </div>

    <div v-else-if="error" class="error-container">
      <a-result status="error" :title="error">
        <template #extra>
          <a-button type="primary" @click="loadShareFiles">重试</a-button>
        </template>
      </a-result>
    </div>

    <div v-else-if="!fileSharing.shareId" class="not-found-container">
      <a-result status="404" title="分享不存在">
        <template #extra>
          <a-button type="primary" @click="$router.push('/')">返回首页</a-button>
        </template>
      </a-result>
    </div>

    <div v-else class="content-container">
      <div class="share-header">
        <div class="header-left">
          <div class="share-icon">
            <share-alt-outlined />
          </div>
          <div class="header-info">
            <div class="share-title">{{ shareTitle }}</div>
            <div class="share-meta">
              <span class="share-user">
                <user-outlined />
                {{ shareUserName }}
              </span>
              <a-tag v-if="fileSharing.expirationTime" :color="isExpired ? 'red' : 'green'" class="expiry-tag">
                {{ isExpired ? '已过期' : `有效期至 ${formatTime(fileSharing.expirationTime)}` }}
              </a-tag>
            </div>
          </div>
        </div>
      </div>

      <div v-if="isPwd" class="password-container">
        <div class="password-card">
          <lock-outlined class="lock-icon" />
          <div class="password-title">请输入提取码</div>
          <div class="password-subtitle">此分享需要输入提取码才能查看文件</div>
          <div class="password-input-wrapper">
            <a-input-password
              v-model:value="password"
              placeholder="请输入提取码"
              size="large"
              class="password-input"
              @pressEnter="verifyPassword"
            />
            <a-button type="primary" size="large" @click="verifyPassword" :loading="verifying" block>
              确认
            </a-button>
          </div>
        </div>
      </div>

      <div v-else class="file-list-container">
        <div v-if="fileList.length > 0" class="file-list">
          <div
            v-for="file in fileList"
            :key="file.id"
            class="file-item"
            :class="{ 'selected': selectedFileKeys.includes(file.id!) }"
            @click="toggleFileSelection(file.id!)"
          >
            <div class="file-main">
              <div class="file-icon">
                <file-outlined />
              </div>
              <div class="file-info">
                <div class="file-name" :title="file.fileName">{{ file.fileName }}</div>
                <div class="file-meta">
                  <span class="file-size">{{ formatFileSize(file.fileSize!) }}</span>
                  <a-tag size="small" class="file-type">{{ file.fileExt?.toUpperCase() || '未知' }}</a-tag>
                  <span class="file-time">{{ formatTime(file.createTime!) }}</span>
                </div>
              </div>
              <div class="file-checkbox">
                <a-checkbox :checked="selectedFileKeys.includes(file.id!)" @click.stop @change="(e:any) => handleFileSelect(file.id!, e.target.checked)" />
              </div>
            </div>
            <div class="file-actions">
              <a-button type="primary" size="small" @click.stop="downloadFile(file)" :disabled="isExpired" class="action-btn">
                <template #icon>
                  <download-outlined />
                </template>
                下载
              </a-button>
              <a-button size="small" @click.stop="previewFile(file)" :disabled="isExpired" class="action-btn">
                <template #icon>
                  <eye-outlined />
                </template>
                预览
              </a-button>
            </div>
          </div>
        </div>

        <div v-else class="empty-container">
          <a-empty description="暂无文件" />
        </div>
      </div>

      <div v-if="!isPwd && fileList.length > 0 && selectedFileKeys.length > 0" class="batch-actions-bar">
        <div class="batch-info">
          <a-checkbox v-model:checked="selectAll" @change="handleSelectAll" class="select-all">
            全选
          </a-checkbox>
          <span class="selected-count">已选择 {{ selectedFileKeys.length }} 个文件</span>
        </div>
        <a-button type="primary" @click="batchDownload" :loading="batchDownloading" size="small">
          <template #icon>
            <download-outlined />
          </template>
          批量下载
        </a-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, h } from 'vue'
import { useRoute } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import {
  FileOutlined,
  LockOutlined,
  UserOutlined,
  DownloadOutlined,
  EyeOutlined,
  ShareAltOutlined
} from '@ant-design/icons-vue'
import { getSharedFiles } from '@/stores/fileResource-store'
import { downloadFile as downloadFileApi } from '@/api/services/fileResource-api'
import type { FileResourceType } from '@/types/fileResource-type'
import { appConfig } from '@/config'
import { getUserNameById } from '@/api/services/auth-api'

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

const shareTitle = computed(() => {
  if (fileList.value.length === 0) return '文件分享'
  if (fileList.value.length === 1) return `收到分享：${fileList.value[0]!.fileName}`
  return `收到分享：${fileList.value.length} 个文件`
})

const isExpired = computed(() => {
  if (!fileSharing.value.expirationTime) return false
  return new Date(fileSharing.value.expirationTime) < new Date()
})

const formatFileSize = (bytes: number): string => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatTime = (timeString: string): string => {
  if (!timeString) return ''
  return new Date(timeString).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const downloadFile = async (file: FileResourceType) => {
  if (!file.fileKey) {
    message.warning('文件路径不存在')
    return
  }
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
    message.success('下载开始')
  } catch (error) {
    console.error('下载文件失败:', error)
    message.error('下载文件失败')
  }
}

const previewFile = (file: FileResourceType) => {
  if (!file.fileKey) {
    message.warning('文件路径不存在')
    return
  }

  const fileType = file.fileType?.toLowerCase() || ''
  const fileName = file.fileName?.toLowerCase() || ''

  if (isImageFile(fileType, fileName)) {
    showImagePreview(file)
    return
  }

  if (isExcelFile(fileType, fileName)) {
    showExcelPreview(file)
    return
  }

  if (isPdfFile(fileType, fileName)) {
    showPdfPreview(file)
    return
  }

  showDefaultPreview(file)
}

const isImageFile = (fileType: string, fileName: string): boolean => {
  const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg']
  const imageFileTypeKeywords = ['image', 'img']

  return imageTypes.some(type =>
    fileType.includes(type) || fileName.endsWith('.' + type)
  ) || imageFileTypeKeywords.some(keyword =>
    fileType.includes(keyword)
  )
}

const isExcelFile = (fileType: string, fileName: string): boolean => {
  const excelTypes = ['xls', 'xlsx', 'csv']
  const excelFileTypeKeywords = ['excel', 'spreadsheet']

  return excelTypes.some(type =>
    fileType.includes(type) || fileName.endsWith('.' + type)
  ) || excelFileTypeKeywords.some(keyword =>
    fileType.includes(keyword)
  )
}

const isPdfFile = (fileType: string, fileName: string): boolean => {
  return fileType.includes('pdf') || fileName.endsWith('.pdf')
}

const showImagePreview = (record: FileResourceType) => {
  const fullImageUrl = `${appConfig.backendUrl}/api/files/download/${record.fileKey}`

  Modal.info({
    title: `图片预览 - ${record.fileName}`,
    width: '90%',
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

const showExcelPreview = (record: FileResourceType) => {
  const fileUrl = `${appConfig.backendUrl}/api/files/download/${record.fileKey}`
  const googleSheetsUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`
  const officeUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`

  Modal.info({
    title: `Excel预览 - ${record.fileName}`,
    width: '90%',
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

const showPdfPreview = async (record: FileResourceType) => {
  const pdfUrl = `${appConfig.backendUrl}/api/files/download/${record.fileKey}`

  try {
    const response = await downloadFileApi(record.fileKey!)
    const blob = new Blob([response.data], { type: 'application/pdf' })
    const blobUrl = URL.createObjectURL(blob)

    Modal.info({
      title: `PDF预览 - ${record.fileName}`,
      width: '90%',
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
        URL.revokeObjectURL(blobUrl)
        console.log('关闭PDF预览')
      },
      afterClose() {
        URL.revokeObjectURL(blobUrl)
      }
    })
  } catch (error) {
    console.error('PDF预览失败:', error)
    message.error('PDF预览失败，请尝试下载文件')
  }
}

const showDefaultPreview = (record: FileResourceType) => {
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

const loadShareFiles = async () => {
  if (!shareUrl.value) return
  loading.value = true
  error.value = ''
  try {
    const result = await getSharedFiles(shareUrl.value)
    fileSharing.value = result.fileSharing || {}
    fileList.value = result.fileResourceList || []
    getShareUserName(fileSharing.value.ownerId!)

    if (!fileSharing.value.shareId) {
      error.value = '分享链接无效或已过期'
    }

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

const verifyPassword = async () => {
  if (!password.value.trim()) {
    message.warning('请输入提取码')
    return
  }

  verifying.value = true
  try {
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

const getShareUserName = async (shareId: number) => {
  const res = await getUserNameById(shareId)
  shareUserName.value = res.data.data as string
}

const handleFileSelect = (fileId: number, checked: boolean) => {
  if (checked) {
    if (!selectedFileKeys.value.includes(fileId)) {
      selectedFileKeys.value.push(fileId)
    }
  } else {
    selectedFileKeys.value = selectedFileKeys.value.filter(id => id !== fileId)
  }
  selectAll.value = selectedFileKeys.value.length === fileList.value.length && fileList.value.length > 0
}

const toggleFileSelection = (fileId: number) => {
  const index = selectedFileKeys.value.indexOf(fileId)
  if (index > -1) {
    selectedFileKeys.value.splice(index, 1)
  } else {
    selectedFileKeys.value.push(fileId)
  }
  selectAll.value = selectedFileKeys.value.length === fileList.value.length && fileList.value.length > 0
}

const handleSelectAll = (e: any) => {
  if (e.target.checked) {
    selectedFileKeys.value = fileList.value.map(file => file.id!)
  } else {
    selectedFileKeys.value = []
  }
  selectAll.value = e.target.checked
}

const clearSelection = () => {
  selectedFileKeys.value = []
  selectAll.value = false
}

const batchDownload = async () => {
  if (selectedFileKeys.value.length === 0) {
    message.warning('请选择要下载的文件')
    return
  }

  const selectedFiles = fileList.value.filter(file => selectedFileKeys.value.includes(file.id!))

  if (selectedFiles.length === 1) {
    await downloadFile(selectedFiles[0]!)
    return
  }

  batchDownloading.value = true

  try {
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

        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (error) {
        console.error(`下载文件 ${file.fileName} 失败:`, error)
        message.error(`下载文件 ${file.fileName} 失败`)
      }
    }

    message.success(`已开始下载 ${selectedFiles.length} 个文件`)
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
.share-page-mobile {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 16px;
}

.loading-container,
.error-container,
.not-found-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  padding: 40px 16px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.loading-text {
  margin-top: 16px;
  font-size: 16px;
  color: #666;
}

.content-container {
  max-width: 600px;
  margin: 0 auto;
}

.share-header {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.share-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
  flex-shrink: 0;
}

.header-info {
  flex: 1;
  min-width: 0;
}

.share-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.share-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.share-user {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #666;
}

.expiry-tag {
  font-size: 12px;
  padding: 2px 8px;
}

.password-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 16px;
}

.password-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 32px 24px;
  text-align: center;
  width: 100%;
  max-width: 360px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

.lock-icon {
  font-size: 64px;
  color: #667eea;
  margin-bottom: 16px;
}

.password-title {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.password-subtitle {
  font-size: 14px;
  color: #999;
  margin-bottom: 24px;
}

.password-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.password-input {
  width: 100%;
  border-radius: 12px;
  height: 48px;
}

.file-list-container {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  min-height: 300px;
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.file-item {
  background: #f8f9fa;
  border: 2px solid transparent;
  border-radius: 12px;
  padding: 12px;
  transition: all 0.2s;
  cursor: pointer;
}

.file-item.selected {
  border-color: #667eea;
  background: #f0f3ff;
}

.file-main {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.file-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: white;
  flex-shrink: 0;
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-size: 15px;
  font-weight: 500;
  color: #1a1a1a;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #999;
  flex-wrap: wrap;
}

.file-size {
  color: #666;
}

.file-type {
  padding: 1px 6px;
  font-size: 11px;
  border-radius: 4px;
  background: #e8f4ff;
  color: #1890ff;
  border: none;
}

.file-time {
  color: #999;
}

.file-checkbox {
  flex-shrink: 0;
}

.file-actions {
  display: flex;
  gap: 8px;
  padding-left: 52px;
}

.action-btn {
  flex: 1;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.empty-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  color: #999;
}

.batch-actions-bar {
  position: sticky;
  bottom: 16px;
  background: rgba(255, 255, 255, 0.98);
  border-radius: 16px;
  padding: 12px 16px;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  backdrop-filter: blur(10px);
}

.batch-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.select-all {
  margin-right: 4px;
}

.selected-count {
  font-size: 14px;
  color: #666;
}

@media (max-width: 480px) {
  .share-page-mobile {
    padding: 12px;
  }

  .share-header {
    padding: 12px;
  }

  .share-icon {
    width: 40px;
    height: 40px;
    font-size: 20px;
  }

  .share-title {
    font-size: 14px;
  }

  .file-list-container {
    padding: 12px;
  }

  .file-item {
    padding: 10px;
  }

  .file-icon {
    width: 36px;
    height: 36px;
    font-size: 18px;
  }

  .file-name {
    font-size: 14px;
  }

  .batch-actions-bar {
    bottom: 12px;
    padding: 10px 12px;
  }
}

@media (min-width: 768px) {
  .share-page-mobile {
    padding: 32px 24px;
  }

  .content-container {
    max-width: 700px;
  }

  .share-header {
    padding: 20px;
  }

  .file-list-container {
    padding: 20px;
  }
}
</style>
