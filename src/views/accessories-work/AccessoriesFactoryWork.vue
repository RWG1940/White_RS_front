<template>
  <div>
    <div v-if="isMobile">
      <ASMobileTable />
    </div>
    <div v-else>
      <ASTable
        v-model:openImport="openImport"
        v-model:open-export="openExport"
        v-model:openHistory="openHistory"
      />
    </div>

    <!-- 导入弹窗：放在模板外层，桌面和移动端都可见 -->
    <a-modal
      v-model:open="openImport"
      title="导入订单表"
      ok-text="导入"
      cancel-text="取消"
      @ok="handleExcelImportOk"
      @cancel="handleExcelImportCancel"
      :confirmLoading="excelImportLoading"
    >
      <a-form layout="vertical">
        <a-form-item label="选择表格文件" required>
          <a-upload
            :before-upload="beforeExcelUpload"
            :max-count="1"
            :file-list="uploadExcelList"
            list-type="picture-card"
            accept=".xlsx,.xls"
            @preview="handlePreview"
            @remove="handleDelete"
          >
            <div v-if="uploadExcelList.length < 1">
              <PlusOutlined />
              <div style="margin-top: 8px">点击上传</div>
            </div>
          </a-upload>
          <div style="margin-top: 8px; color: #999; font-size: 12px">
            支持格式：.xlsx, .xls，文件大小不超过100MB
          </div>
        </a-form-item>
        <a-form-item label="批次" required>
          <a-select
            v-model:value="importId"
            :options="options"
            mode="multiple"
            placeholder="选择导入批次"
            style="width: 100%"
          ></a-select>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 导出弹窗：放在模板外层，桌面和移动端都可见 -->
    <a-modal
      v-model:open="openExport"
      title="导出订单表"
      width="50%"
      wrap-class-name="full-modal"
      ok-text="导出"
      cancel-text="取消"
      @ok="handleExcelExportOk"
      @cancel="handleExcelExportCancel"
      :confirmLoading="excelImportLoading"
    >
      <a-form-item label="批次" required>
        <a-row>
          <a-select
            v-model:value="exportIds"
            :options="options"
            mode="multiple"
            placeholder="请选择导出批次名"
            style="width: 100%"
          ></a-select>
        </a-row>
      </a-form-item>
      <a-form-item label="排序方式">
        <a-row>
          <a-radio-group v-model:value="sortOrder">
            <a-radio-button value="asc">升序</a-radio-button>
            <a-radio-button value="desc">降序</a-radio-button>
          </a-radio-group>
        </a-row>
      </a-form-item>
    </a-modal>

    <!-- 订单管理弹窗 -->
    <Modal :visible="openHistory" @update:visible="openHistory = $event" title="订单管理">
      <div class="batch-header">
        <div class="batch-controls">
          <a-input-search
            v-if="viewMode === 'batch'"
            v-model:value="searchText"
            placeholder="搜索批次名称"
            style="width: 200px; margin-right: 12px"
            allow-clear
            size="small"
          />
          <a-input-search
            v-if="viewMode === 'season'"
            v-model:value="seasonSearchText"
            placeholder="搜索季度名称"
            style="width: 200px; margin-right: 12px"
            allow-clear
            size="small"
          />
          <a-radio-group
            v-if="viewMode === 'batch'"
            v-model:value="filterStatus"
            button-style="solid"
            size="small"
            style="margin-right: 12px"
          >
            <a-radio-button value="all">全部</a-radio-button>
            <a-radio-button value="visible">只看未隐藏</a-radio-button>
            <a-radio-button value="hidden">只看隐藏</a-radio-button>
          </a-radio-group>
          <a-radio-group
            v-model:value="viewMode"
            button-style="solid"
            size="small"
            style="margin-right: 12px"
          >
            <a-radio-button value="batch">按批次</a-radio-button>
            <a-radio-button value="season">按季度</a-radio-button>
          </a-radio-group>
          <a-radio-group
            v-if="viewMode === 'season'"
            v-model:value="seasonFilterStatus"
            button-style="solid"
            size="small"
            style="margin-right: 12px"
          >
            <a-radio-button value="all">全部</a-radio-button>
            <a-radio-button value="visible">只看未隐藏</a-radio-button>
            <a-radio-button value="hidden">只看隐藏</a-radio-button>
          </a-radio-group>
          <a-radio-group v-model:value="batchSortOrder" button-style="solid" size="small">
            <a-radio-button value="asc">升序</a-radio-button>
            <a-radio-button value="desc">降序</a-radio-button>
          </a-radio-group>
        </div>
      </div>

      <div class="batch-container">
        <!-- 按批次视图 -->
        <template v-if="viewMode === 'batch'">
          <div
            v-for="batch in filteredBatches"
            :key="batch.id"
            class="batch-card"
            :class="{ 'hidden-batch': batch.status === 0 }"
          >
            <div class="batch-content">
              <div>
                <div class="batch-name">
                  <span class="name-text">
                    {{ batch.fileName }}
                    <a-tag v-if="batch.status === 0" color="default" style="margin-left: 8px"
                      >已隐藏</a-tag
                    >
                  </span>
                </div>
                <div class="batch-id">批次ID: {{ batch.id }}</div>
              </div>
              <div class="batch-note" v-if="(batch as any).showNote">
                <div class="note-header">填写笔记：</div>
                <a-textarea
                  v-model:value="(batch as any).noteContent"
                  :auto-size="{ minRows: 3, maxRows: 6 }"
                  placeholder="请输入笔记内容"
                  style="margin-bottom: 8px"
                ></a-textarea>
                <div class="note-actions">
                  <a-button type="primary" size="small" @click="handleSaveNote(batch)">
                    保存
                  </a-button>
                  <a-button size="small" @click="handleCancelNote(batch)"> 取消 </a-button>
                </div>
              </div>
              <div v-else-if="batch.remark" class="batch-remarks">
                <div class="note-header">笔记内容：</div>
                <div class="note-text">{{ batch.remark }}</div>
              </div>
            </div>
            <div class="batch-actions">
              <a-button
                v-if="batch.status === 1"
                type="default"
                size="small"
                @click="handleToggleBatchStatus(batch.id!, 0)"
              >
                隐藏
              </a-button>
              <a-button
                v-else
                type="primary"
                size="small"
                @click="handleToggleBatchStatus(batch.id!, 1)"
              >
                显示
              </a-button>
              <a-button type="link" size="small" @click="handleEditNote(batch)">
                {{ (batch as any).showNote ? '取消编辑' : batch.remark ? '编辑笔记' : '添加笔记' }}
              </a-button>
              <a-button
                v-if="batch.remark"
                type="link"
                size="small"
                @click="handleDeleteNote(batch)"
                danger
                >删除笔记</a-button
              >
            </div>
          </div>
        </template>

        <!-- 按季度视图 -->
        <template v-else-if="viewMode === 'season'">
          <div
            v-for="season in filteredQuarters"
            :key="season.name"
            class="batch-card"
            :class="{ 'hidden-batch': season.status === 0 }"
          >
            <div class="batch-content">
              <div class="batch-name">
                <span class="name-text">
                  {{ season.name }}
                  <a-tag v-if="season.status === 0" color="default" style="margin-left: 8px"
                    >已隐藏</a-tag
                  >
                </span>
              </div>
            </div>
            <div class="batch-actions">
              <a-button
                v-if="season.status === 1"
                type="default"
                size="small"
                @click="handleToggleQuarterStatus(season.name!, 0)"
              >
                隐藏
              </a-button>
              <a-button
                v-else
                type="primary"
                size="small"
                @click="handleToggleQuarterStatus(season.name!, 1)"
              >
                显示
              </a-button>
            </div>
          </div>
        </template>

        <div v-if="tableImportStore.list.length === 0" class="empty-state">
          <p>暂无批次数据</p>
        </div>
      </div>
      <div class="batch-footer">
        <span class="batch-count" v-if="viewMode === 'batch'"
          >批次总数: {{ filteredBatches.length }}</span
        >
        <span class="batch-count" v-else>季度总数: {{ filteredQuarters.length }}</span>
        <span class="visible-count" v-if="viewMode === 'batch'"
          >已隐藏: {{ hiddenBatchCount }}</span
        >
        <span class="visible-count" v-else>已隐藏: {{ hiddenSeasonCount }}</span>
      </div>
    </Modal>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { message } from 'ant-design-vue'
import ASTable from './components/ASTable.vue'
import ASMobileTable from './components/ASMobileTable.vue'
import Modal from '@/components/Modal.vue'
import { importExcel, exportExcel } from '@/api/services/acc-api'
import { PlusOutlined } from '@ant-design/icons-vue'
import { accStore } from '@/stores/acc-store'
import { tableImportStore } from '@/stores/tableImport-store'
import {
  fetchPageByGuestId,
  deleteByImportId,
  quarters,
  getQuarters,
  currentGuestId,
  visibleBatches,
} from '@/stores/acc-store'
import type { tableImportType } from '@/types/tableImport-type'
import { userConfiguresStore, removeConfigureByE } from '@/stores/userConfigures-store'
import { useAuthStore } from '@/stores/auth-store'

// 响应式判断是否为移动端（宽度 <= 768px）
const isMobile = ref(false)

const updateIsMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

onMounted(() => {
  updateIsMobile()
  window.addEventListener('resize', updateIsMobile)

  // 加载季度列表
  getQuarters()

  // 加载可用的表格批次
  tableImportStore.fetchAll().then(() => {
    // 排除掉隐藏的批次，只显示可见的批次
    options.value = visibleBatches.value.map((item: any) => {
      const fileName = item.fileName || ''
      const remark = item.remark || ''
      // 如果有备注，在文件名后显示备注
      const label = remark ? `${fileName} (${remark})` : fileName
      return {
        value: item.id,
        label,
      }
    })
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', updateIsMobile)
})

const authStore = useAuthStore()
const openImport = ref<boolean>(false)
const openExport = ref<boolean>(false)
const openHistory = ref<boolean>(false)
const options = ref<any[]>([])

// 订单管理相关状态
const batchSortOrder = ref<'asc' | 'desc'>('desc')
const viewMode = ref<'batch' | 'season'>('batch')
const searchText = ref<string>('')
const filterStatus = ref<'all' | 'visible' | 'hidden'>('all')
const seasonFilterStatus = ref<'all' | 'visible' | 'hidden'>('all')
const seasonSearchText = ref<string>('')

// Excel 导入相关状态
const excelImportLoading = ref(false)
const uploadExcelFile = ref<File | null>(null)
const uploadExcelList = ref<any>([])
const importId = ref()
const exportIds = ref<string[]>([])
const sortBy = ref<string>('')
const sortOrder = ref<string>('asc')

// Excel 上传相关方法
const beforeExcelUpload = async (file: File) => {
  // 检查文件类型
  const allowedTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
  ]

  if (!allowedTypes.includes(file.type)) {
    message.error('只能上传 Excel 文件 (.xlsx, .xls)')
    return false
  }

  // 检查文件大小（限制 10MB）
  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    message.error('文件大小不能超过 10MB')
    return false
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    uploadExcelList.value = [
      {
        uid: String(Date.now()),
        name: file.name,
        status: 'done',
        url: e.target?.result as string,
        originFileObj: file,
      },
    ]
  }
  reader.readAsDataURL(file)

  uploadExcelFile.value = file
  return false // 阻止自动上传
}

// Excel 导入确认
const handleExcelImportOk = async () => {
  if (!uploadExcelFile.value) {
    message.warning('请选择要导入的 Excel 文件')
    return
  }
  if (!importId.value) {
    message.warning('请填写导入id')
    return
  }
  try {
    excelImportLoading.value = true
    const form = new FormData()
    form.append('file', uploadExcelFile.value)
    form.append('importId', importId.value)
    await importExcel(form)
    message.success('Excel 导入成功')
    // 重置状态
    handleExcelImportCancel()
    await accStore.fetchPage()
    await tableImportStore.fetchAll()
  } catch (error) {
    message.error('Excel 导入失败，请检查文件格式')
  } finally {
    excelImportLoading.value = false
  }
}
// Excel 导出确认
const handleExcelExportOk = async () => {
  try {
    excelImportLoading.value = true
    const form = new FormData()
    // 将数组中的每个元素单独添加到FormData中
    exportIds.value.forEach((id) => {
      form.append('exportIds', id)
    })
    form.append('sortBy', sortBy.value)
    form.append('sortOrder', sortOrder.value)

    const response = await exportExcel(form)

    // 从 AxiosResponse 中提取 Blob 数据
    const blob = new Blob([response.data], { type: 'application/vnd.ms-excel' })
    const url = window.URL.createObjectURL(blob)

    // 获取当前日期并格式化为 YYYY-MM-DD
    const currentDate = new Date().toISOString().split('T')[0]
    const fileName = `导出文件-${currentDate}.xlsx`

    // 创建一个隐藏的 <a> 元素并触发下载
    const link = document.createElement('a')
    link.href = url
    link.download = fileName // 设置下载的文件名
    document.body.appendChild(link)
    link.click()

    // 清理 URL 和 DOM
    window.URL.revokeObjectURL(url)
    document.body.removeChild(link)

    message.success('Excel 导出成功')
    handleExcelExportCancel()
    await accStore.fetchPage()
  } catch (error) {
    message.error('Excel 导出失败，请检查文件格式')
  } finally {
    excelImportLoading.value = false
  }
}
// Excel 导入取消
const handleExcelImportCancel = () => {
  uploadExcelFile.value = null
  uploadExcelList.value = []
  importId.value = ''
  openImport.value = false
}
// Excel 导出取消
const handleExcelExportCancel = () => {
  openExport.value = false
  exportIds.value = []
}
// 预览
const handlePreview = (file: any) => {
  message.info('预览功能暂未实现')
}
// 删除
const handleDelete = (record: any) => {
  uploadExcelFile.value = null
  uploadExcelList.value = []
}

// 订单管理相关方法

// 编辑笔记
const handleEditNote = (batch: any) => {
  if ((batch as any).showNote) {
    // 取消编辑
    handleCancelNote(batch)
  } else {
    // 显示编辑框
    ;(batch as any).showNote = true
    ;(batch as any).noteContent = batch.remarks || ''
  }
}

// 保存笔记
const handleSaveNote = async (batch: any) => {
  try {
    const content = (batch as any).noteContent || ''
    await tableImportStore.update({
      id: batch.id,
      remark: content,
    })
    batch.remark = content
    ;(batch as any).showNote = false
  } catch (error) {
    message.error('笔记保存失败')
  }
}

// 取消笔记
const handleCancelNote = (batch: any) => {
  ;(batch as any).showNote = false
  ;(batch as any).noteContent = ''
}

// 删除笔记
const handleDeleteNote = async (batch: any) => {
  try {
    await tableImportStore.update({
      id: batch.id,

      remark: '',
    })

    batch.remark = ''
  } catch (error) {
    message.error('笔记删除失败')
  }
}

// 计算过滤后的批次列表
const filteredBatches = computed(() => {
  let list = tableImportStore.list as tableImportType[]

  // 按筛选状态过滤
  if (filterStatus.value === 'visible') {
    list = list.filter((batch) => batch.status === 1)
  } else if (filterStatus.value === 'hidden') {
    list = list.filter((batch) => batch.status === 0)
  }

  // 按搜索文本过滤
  if (searchText.value) {
    const search = searchText.value.toLowerCase()
    list = list.filter((batch) => (batch.fileName || '').toLowerCase().includes(search))
  }

  // 排序
  const sorted = [...list]
  if (batchSortOrder.value === 'asc') {
    sorted.sort((a, b) => (a.id || 0) - (b.id || 0))
  } else {
    sorted.sort((a, b) => (b.id || 0) - (a.id || 0))
  }
  return sorted
})

// 计算隐藏的批次数量
const hiddenBatchCount = computed(() => {
  return (tableImportStore.list as tableImportType[]).filter((batch) => batch.status === 0).length
})

// 计算过滤后的季度列表
const filteredQuarters = computed(() => {
  let list = quarters.value

  // 按筛选状态过滤
  if (seasonFilterStatus.value === 'visible') {
    list = list.filter((quarter) => quarter.status !== 0)
  } else if (seasonFilterStatus.value === 'hidden') {
    list = list.filter((quarter) => quarter.status === 0)
  }

  // 按搜索文本过滤
  if (seasonSearchText.value) {
    const search = seasonSearchText.value.toLowerCase()
    list = list.filter((quarter) => (quarter.name || '').toLowerCase().includes(search))
  }

  return list
})

// 计算隐藏的季度数量
const hiddenSeasonCount = computed(() => {
  return quarters.value.filter((quarter) => quarter.status === 0).length
})

// 隐藏或显示批次
const handleToggleBatchStatus = async (batchId: number, status: number) => {
  try {
    if (status === 0) {
      // 隐藏
      await userConfiguresStore.create({
        uId: authStore.user?.id,
        configureName: 'hiddenBatches',
        configureValue: batchId,
        type: 1,
        status: 1,
        remarks: '隐藏批次',
      })
      // 设置该条数据
      const foundItem = tableImportStore.list.find((item: any) => item.id === batchId)
      if (foundItem) {
        ;(foundItem as any).status = 0
      }
    } else {
      // 启用
      await removeConfigureByE({
        uId: authStore.user?.id,
        configureName: 'hiddenBatches',
        configureValue: batchId,
      })
      // 设置该条数据
      const foundItem = tableImportStore.list.find((item: any) => item.id === batchId)
      if (foundItem) {
        ;(foundItem as any).status = 1
      }
      message.success('启用成功')
    }
  } catch (error) {
    message.error('操作失败，请重试')
    return
  }

  // 刷新批次
  await tableImportStore.fetchAll()
  // 刷新数据
  await fetchPageByGuestId(currentGuestId.value!, 0, accStore.currentPage, accStore.pageSize, '')
}

// 隐藏或显示季度
const handleToggleQuarterStatus = async (quarterStr: string, status: number) => {
  try {
    if (status === 0) {
      await userConfiguresStore.create({
        uId: authStore.user?.id,
        configureName: 'hiddenQuarters',
        configureValue: quarterStr,
        type: 1,
        status: 1,
        remarks: '隐藏季度',
      })
    } else {
      // 启用
      await removeConfigureByE({
        uId: authStore.user?.id,
        configureName: 'hiddenQuarters',
        configureValue: quarterStr,
      })
      message.success('启用成功')
    }
    // 设置该条数据
    const foundItem = quarters.value.find((item: any) => item.name === quarterStr)
    if (foundItem) {
      ;(foundItem as any).status = status
    }
  } catch (error) {
    message.error('操作失败，请重试')
    return
  }
  // 刷新数据
  if (currentGuestId.value) {
    await fetchPageByGuestId(currentGuestId.value!, 0, accStore.currentPage, accStore.pageSize, '')
  }
}

// 监听 visibleBatches 的变化，自动更新 options
watch(
  visibleBatches,
  (newBatches) => {
    options.value = newBatches.map((item: any) => {
      const fileName = item.fileName || ''
      const remark = item.remark || ''
      // 如果有备注，在文件名后显示备注
      const label = remark ? `${fileName} (${remark})` : fileName
      return {
        value: item.id,
        label,
      }
    })
  },
  { deep: true },
)
</script>
<style scoped>
.header {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.search-card {
  width: 100%;
  margin-bottom: 10px;
}

.process-card {
  width: 100%;
}

/* 订单管理弹窗样式 */
.batch-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 12px;
  border-radius: 16px;
}

.batch-controls {
  display: flex;
  gap: 8px;
}

.batch-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 8px;
  max-height: 60vh;
  overflow-y: auto;
  overflow-x: hidden;
}

.batch-footer {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  padding: 12px 8px 0;
  border-top: 1px solid #f0f0f0;
  flex-shrink: 0;
}

.batch-card {
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  padding: 16px;
  background-color: #fafafa;
  transition: all 0.3s ease;
  animation: slideIn 0.3s ease;
}

.batch-card.hidden-batch {
  border-color: #bfbfbf;
  background-color: #f5f5f5;
  opacity: 0.6;
}

.batch-card.hidden-batch:hover {
  opacity: 0.8;
}

.batch-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background-color: #fff;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.batch-content {
  margin-bottom: 12px;
  display: flex;
}

.batch-name {
  font-size: 16px;
  font-weight: 500;
  color: #1890ff;
  font-weight: bold;
  margin-bottom: 8px;
}

.name-text {
  display: block;
  word-break: break-word;
}

.batch-id {
  font-size: 12px;
  color: #8c8c8c;
}

.batch-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.batch-actions :deep(.ant-btn) {
  flex-shrink: 0;
}

.batch-note {
  margin-left: 10px;

  padding: 12px;
  background-color: #f0f7ff;
  border-radius: 4px;
  border: 1px solid #d6e4ff;
  animation: fadeIn 0.3s ease;
}

.batch-remarks {
  margin-left: 10px;
  padding: 12px;
  background-color: #fff7e6;
  border-radius: 4px;
  border: 1px solid #ffd591;
}

.note-header {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
}

.note-text {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  word-break: break-word;
}

.note-actions {
  display: flex;
  gap: 8px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #8c8c8c;
}

.empty-state p {
  font-size: 14px;
  margin: 0;
}

.batch-count,
.visible-count {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

/* 移动端响应式 */
@media (max-width: 768px) {
  .batch-container {
    gap: 12px;
    padding: 4px;
  }

  .batch-card {
    padding: 12px;
  }

  .batch-actions {
    gap: 6px;
  }

  .batch-actions :deep(.ant-btn) {
    font-size: 12px;
  }
}
</style>
