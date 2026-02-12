<template>
  <ScrollContent>
    <template #content>
      <a-row :gutter="10" class="header-row">
        <!-- 左侧标题 -->
        <a-col>
          <p class="file-list-title">📁文件列表</p>
        </a-col>

        <!-- 右侧进度条 -->
        <a-col class="progress-col">
          <a-progress
            :percent="storageUsagePercent"
            :size="[300, 20]"
            :stroke-color="{
              '0%': '#87d068',
              '100%': '#ff4d4f',
            }"
          />
        </a-col>
        <a-col>
          <div class="storage-info">
            <p>
              &ensp;&ensp;总空间：{{ formatFileSize(totalStorageSpace) }}&ensp;已用空间：{{
                formatFileSize(filesTotalSize)
              }}&ensp;可用空间：{{ formatFileSize(availableStorageSpace) }}
            </p>
          </div>
        </a-col>
      </a-row>
      <a-row>
        <ManagePage
          class="manage-page"
          :data-source="store.pagedList as FileResourceType[]"
          :columns="columns"
          row-key="id"
          :is-bordered="isbordered"
          :search-select-options="[{ label: '文件名', value: 'file_name' }]"
          v-model:total="store.total"
          v-model:currentPage="store.currentPage"
          v-model:pageSize="store.pageSize"
          search-placeholder="搜索文件名"
          @search="handleSearch"
          @row-delete="handleDelete"
          @add="showUploadModal"
          @batch-delete="handleBatchDelete"
          @selection-change="store.onSelectionChange"
          @update:currentPage="pageChange"
          @update:pageSize="pageSizeChange"
        >
          <template #custom-tool>
            <a-row style="margin-left: 0px" :gutter="[5, 5]">
              <a-col>
                <a-button
                  :disabled="store.selectedIds.length == 0"
                  type="primary"
                  @click="showShareModal"
                >
                  <ShareAltOutlined />分享(已选择{{ store.selectedIds.length }}个文件)
                </a-button>
              </a-col>
              <a-col>
                <a-button
                  :disabled="store.selectedIds.length == 0"
                  type="primary"
                  @click="
                    () => {
                      message.info('该功能还未实现，正在做...')
                    }
                  "
                >
                  通过Excel分发
                </a-button>
              </a-col>
            </a-row>
          </template>

          <!-- 自定义操作列 -->
          <template #operation="{ record }">
            <div class="file-actions">
              <a-button size="small" @click="handleDownload(record)">
                <DownloadOutlined />
                下载
              </a-button>
              <a-button size="small" @click="handlePreview(record)">
                <EyeOutlined />
                预览
              </a-button>
              <a-button size="small" danger @click="() => handleDelete(record.id!)">
                <DeleteOutlined />
                删除
              </a-button>
            </div>
          </template>
        </ManagePage>
      </a-row>
      <uploadModal
        v-model="uploadModalVisible"
        :available-storage-space="availableStorageSpace"
        :total-storage-space="totalStorageSpace"
        :files-total-size="filesTotalSize"
        @upload-success="handleUploadSuccess"
      />

      <filesShareModal
        :visible="shareModalVisible"
        :selected-file-ids="store.selectedIds"
        @update:visible="(val) => (shareModalVisible = val)"
        @share-success="handleShareSuccess"
      />
    </template>
  </ScrollContent>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, watch, h } from 'vue'
import { message, Modal } from 'ant-design-vue'
import {
  DownloadOutlined,
  EyeOutlined,
  DeleteOutlined,
  ShareAltOutlined,
} from '@ant-design/icons-vue'
import ScrollContent from '@/components/scrollContent.vue'
import ManagePage from '@/components/ManagePage.vue'
import uploadModal from './file-drive/uploadModal.vue'
import filesShareModal from './file-drive/filesShareModal.vue'
import {
  fileResourceStore,
  fetchFilesByBiz,
  fetchTotalFileSize,
  filesTotalSize,
} from '@/stores/fileResource-store'
import { downloadFile } from '@/api/services/fileResource-api'
import type { FileResourceType } from '@/types/fileResource-type'
import { formatTime } from '@/utils/formatTime'
import dayjs from 'dayjs'
import { appConfig } from '@/config'
import * as pdfjsLib from 'pdfjs-dist'

// 配置PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.4.530/pdf.worker.min.js'

// 表格样式调整
const isbordered = ref(false)
// 上传框状态
const uploadModalVisible = ref(false)
// 分享框状态
const shareModalVisible = ref(false)
// 文件列表数据
const fileList = ref<FileResourceType[]>([])
// 获取 store 实例
const store = fileResourceStore
// 总存储空间（10GB，单位：字节）
const totalStorageSpace = ref(10 * 1024 * 1024 * 1024)

// 计算可用存储空间
const availableStorageSpace = computed(() => {
  return Math.max(0, totalStorageSpace.value - filesTotalSize.value)
})

// 计算存储使用百分比
const storageUsagePercent = computed(() => {
  if (totalStorageSpace.value === 0) return 0
  const percent = (filesTotalSize.value / totalStorageSpace.value) * 100
  return Math.min(100, Math.max(0, Math.round(percent * 100) / 100)) // 限制在0-100之间，保留两位小数
})

// 表格列配置
const columns = [
  {
    title: '文件名',
    dataIndex: 'fileName',
    key: 'fileName',
    width: 250,
    ellipsis: true,
  },
  {
    title: '文件大小',
    dataIndex: 'fileSize',
    key: 'fileSize',
    width: 100,
    customRender: ({ text }: { text: number }) => formatFileSize(text || 0),
  },
  {
    title: '文件类型',
    dataIndex: 'fileType',
    key: 'fileType',
    width: 80,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    width: '120px',
    sorter: (a: any, b: any) => dayjs(a.createTime).valueOf() - dayjs(b.createTime).valueOf(),
    customRender: ({ text }: { text: any }) => formatTime(text),
    sortDirections: ['descend', 'ascend'] as any,
    filters: [
      { text: '最近 7 天', value: '7d' },
      { text: '最近 30 天', value: '30d' },
      { text: '今年', value: 'year' },
    ],
    onFilter: (value: any, record: any) => {
      const target = dayjs(record.createTime)
      if (!target.isValid()) {
        return false
      }
      const now = dayjs()
      switch (value) {
        case '7d':
          return target.isAfter(now.subtract(7, 'day'), 'day')
        case '30d':
          return target.isAfter(now.subtract(30, 'day'), 'day')
        case 'year':
          return target.year() === now.year()
        default:
          return true
      }
    },
  },
  {
    title: '上传者',
    dataIndex: 'creatorId',
    key: 'creatorId',
    width: 80,
  },
]
// 加载文件列表
const loadFileList = async () => {
  try {
    await fetchFilesByBiz('drive_file', 2, 0, 0)
    fileList.value = store.pagedList as any
  } catch (error) {
    console.error('加载文件列表失败:', error)
  }
}

// 监听上传成功事件
const handleUploadSuccess = () => {
  loadFileList() // 重新加载文件列表
  fetchTotalFileSize() // 重新获取总文件大小
  message.success('文件上传成功')
}



// 搜索
const handleSearch = async (payload: Record<string, string>) => {
  const searchConditions = {
    ...payload,
    biz_type: 'drive_file',
  }
  await store.handleSearch(searchConditions)
}
// 删除文件
const handleDelete = async (fileId: string | number) => {
  try {
    await store.remove([Number(fileId)])
    loadFileList() // 重新加载列表
  } catch (error) {
    console.error('删除文件失败:', error)
  }
}

// 分页变化事件
const pageChange = async (val: number) => {
  store.currentPage = val
  await fetchFilesByBiz('drive_file', 2, store.currentPage, store.pageSize)
  fileList.value = store.pagedList as any
}
// 每页条数变化事件
const pageSizeChange = async (val: number) => {
  store.pageSize = val
  await fetchFilesByBiz('drive_file', 2, store.currentPage, store.pageSize)
  fileList.value = store.pagedList as any
}
// 批量删除文件
const handleBatchDelete = async ({ keys }: { keys: (string | number)[] }) => {
  try {
    const ids = keys.map((k) => Number(k))
    await store.remove(ids)
    await fetchFilesByBiz('drive_file', 2, store.currentPage, store.pageSize)
  } catch (e) {
    console.error('批量删除用户失败', e)
  }
}

// 下载文件
const handleDownload = async (record: FileResourceType) => {
  if (!record.fileKey) {
    message.warning('文件路径不存在')
    return
  }
  try {
    const response = await downloadFile(record.fileKey)
    // 创建下载链接
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', record.fileName || 'download')
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
    message.success('下载开始')
  } catch (error) {
    console.error('下载文件失败:', error)
  }
}

// 预览文件
const handlePreview = (record: FileResourceType) => {
  if (!record.fileUrl) {
    message.warning('文件预览链接不存在')
    return
  }

  // 根据文件类型选择预览方式
  const fileType = record.fileType?.toLowerCase() || ''
  const fileName = record.fileName?.toLowerCase() || ''

  // 图片文件预览
  if (isImageFile(fileType, fileName)) {
    showImagePreview(record)
    return
  }

  // Excel文件预览
  if (isExcelFile(fileType, fileName)) {
    showExcelPreview(record)
    return
  }

  // PDF文件预览
  if (isPdfFile(fileType, fileName)) {
    showPdfPreview(record)
    return
  }

  // 其他文件类型使用默认预览方式
  showDefaultPreview(record)
}

// 判断是否为图片文件
const isImageFile = (fileType: string, fileName: string): boolean => {
  const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg']
  const imageFileTypeKeywords = ['image', 'img']

  return (
    imageTypes.some((type) => fileType.includes(type) || fileName.endsWith('.' + type)) ||
    imageFileTypeKeywords.some((keyword) => fileType.includes(keyword))
  )
}

// 判断是否为Excel文件
const isExcelFile = (fileType: string, fileName: string): boolean => {
  const excelTypes = ['xls', 'xlsx', 'csv']
  const excelFileTypeKeywords = ['excel', 'spreadsheet']

  return (
    excelTypes.some((type) => fileType.includes(type) || fileName.endsWith('.' + type)) ||
    excelFileTypeKeywords.some((keyword) => fileType.includes(keyword))
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
          objectFit: 'contain',
        },
        alt: record.fileName,
      }),
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
          border: 'none',
        },
        frameborder: '0',
      }),
    ]),
    okText: '关闭',
    onOk() {
      console.log('关闭Excel预览')
    },
  })
}

// 显示PDF预览
const showPdfPreview = async (record: FileResourceType) => {
  // 构建完整的PDF文件URL
  const pdfUrl = `${appConfig.backendUrl}/api/files/download/${record.fileKey}`

  try {
    // 下载PDF文件
    const response = await downloadFile(record.fileKey!)
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
            border: 'none',
          },
          frameborder: '0',
        }),
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
      },
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
      handleDownload(record)
    },
  })
}

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 上传框显示函数
const showUploadModal = () => {
  uploadModalVisible.value = true
}

// 分享框显示函数
const showShareModal = () => {
  if (store.selectedIds.length === 0) {
    message.warning('请先选择要分享的文件')
    return
  }
  shareModalVisible.value = true
}

// 分享成功处理
const handleShareSuccess = () => {
  message.success('文件分享成功！')
  // 可以在这里添加分享成功后的逻辑，比如刷新列表等
}

// 组件挂载时加载数据
onMounted(() => {
  loadFileList()
  fetchTotalFileSize()
})
</script>
<style scoped>
/* 头部行样式 */
.header-row {
  border-bottom: solid 2px gainsboro;
  margin-bottom: 10px;
}

/* 文件列表标题样式 */
.file-list-title {
  font-size: large;
  font-weight: bold;
  color: gray;
  margin-bottom: 10px;
}

/* 进度条列样式 */
.progress-col {
  width: 150px;
}

/* 存储信息样式 */
.storage-info {
  padding: 3px;
  color: rgb(159, 159, 159);
}

/* 管理页面样式 */
.manage-page {
  width: 100%;
}

/* 工具行样式 */
.tool-row {
  margin-left: 1px;
}

/* 文件操作按钮样式 */
.file-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.file-actions .ant-btn-link {
  padding: 0;
  height: auto;
}
</style>
