<template>
  <Modal
    v-model:visible="visible"
    title="支付信息管理"
    :closeOnClickOverlay="false"
    @close="handleClose"
  >
    <ManagePage
      v-model:data-source="dataSource"
      row-key="id"
      :columns="columns"
      :editable-fields="editableFields"
      :show-operation="true"
      :show-add="true"
      :show-batch-delete="true"
      :isBordered="false"
      :search-select-options="searchSelectOptions"
      search-placeholder="搜索支付信息"
      v-model:total="store.total"
      v-model:currentPage="store.currentPage"
      v-model:pageSize="store.pageSize"
      v-model:loading="store.loading"
      @search="store.handleSearch"
      @add="handleAdd"
      @save="handleSave"
      @row-delete="store.handleRowDelete"
      @batch-delete="store.removeSelected"
      @selection-change="store.onSelectionChange"
      @update:currentPage="store.pageChange"
      @update:pageSize="store.pageSizeChange"
    >
      <!-- 状态列自定义渲染 -->
      <template #cell-status="{ record, isEditing, editableData, getInternalKey }">
        <template v-if="!isEditing">
          <a-tag :color="record.status == 1 ? 'blue' : 'red'">
            {{ record.status == 1 ? '启用' : '禁用' }}
          </a-tag>
        </template>
        <template v-else>
          <a-select v-model:value="editableData[getInternalKey(record)]!.status" size="small">
            <a-select-option :value="1">启用</a-select-option>
            <a-select-option :value="0">禁用</a-select-option>
          </a-select>
        </template>
      </template>

      <!-- 微信好友二维码列 - 支持图片上传和预览 -->
      <template #cell-wechatQr="{ record, isEditing, editableData, getInternalKey }">
        <div class="image-cell">
          <template v-if="!isEditing">
            <div v-if="record.wechatQr" class="image-preview">
              <a-image
                :src="getImageUrl(record.wechatQr)"
                :width="60"
                :height="60"
                :preview="{
                  src: getImageUrl(record.wechatQr),
                }"
              />
              <div class="image-tip">微信好友二维码</div>
            </div>
            <span v-else style="color: #999">无</span>
          </template>
          <template v-else>
            <div class="image-upload-cell">
              <!-- 显示服务器已有图片或用户新选择的预览图片 -->
              <div v-if="wechatQrFileList[getInternalKey(record)]?.[0]?.url" class="image-preview">
                <a-image
                  :src="wechatQrFileList[getInternalKey(record)]![0]!.url"
                  :width="60"
                  :height="60"
                  :preview="{
                    src: wechatQrFileList[getInternalKey(record)]![0]!.url,
                  }"
                />
                <div class="image-tip">微信好友二维码</div>
                <div class="pending-save-text">待保存</div>
              </div>
              <div v-else-if="editableData[getInternalKey(record)]?.wechatQr" class="image-preview">
                <a-image
                  :src="getImageUrl(editableData[getInternalKey(record)]?.wechatQr)"
                  :width="60"
                  :height="60"
                  :preview="{
                    src: getImageUrl(editableData[getInternalKey(record)]?.wechatQr),
                  }"
                />
                <div class="image-tip">微信好友二维码</div>
              </div>
              <a-upload
                v-model:file-list="wechatQrFileList[getInternalKey(record)]!"
                :before-upload="(file: any) => handleBeforeUpload(file, record, 'wechatQr')"
                :show-upload-list="false"
                accept="image/*"
                class="image-upload"
              >
                <a-button size="small" type="link">
                  {{ (editableData[getInternalKey(record)]?.wechatQr || (wechatQrFileList[getInternalKey(record)]?.length || 0) > 0) ? '重新上传' : '上传图片' }}
                </a-button>
              </a-upload>
            </div>
          </template>
        </div>
      </template>

      <!-- 微信收款码列 - 支持图片上传和预览 -->
      <template #cell-wechatPay="{ record, isEditing, editableData, getInternalKey }">
        <div class="image-cell">
          <template v-if="!isEditing">
            <div v-if="record.wechatPay" class="image-preview">
              <a-image
                :src="getImageUrl(record.wechatPay)"
                :width="60"
                :height="60"
                :preview="{
                  src: getImageUrl(record.wechatPay),
                }"
              />
              <div class="image-tip">微信收款码</div>
            </div>
            <span v-else style="color: #999">无</span>
          </template>
          <template v-else>
            <div class="image-upload-cell">
              <!-- 显示服务器已有图片或用户新选择的预览图片 -->
              <div v-if="wechatPayFileList[getInternalKey(record)]?.[0]?.url" class="image-preview">
                <a-image
                  :src="wechatPayFileList[getInternalKey(record)]![0]!.url"
                  :width="60"
                  :height="60"
                  :preview="{
                    src: wechatPayFileList[getInternalKey(record)]![0]!.url,
                  }"
                />
                <div class="image-tip">微信收款码</div>
                <div class="pending-save-text">待保存</div>
              </div>
              <div v-else-if="editableData[getInternalKey(record)]?.wechatPay" class="image-preview">
                <a-image
                  :src="getImageUrl(editableData[getInternalKey(record)]?.wechatPay)"
                  :width="60"
                  :height="60"
                  :preview="{
                    src: getImageUrl(editableData[getInternalKey(record)]?.wechatPay),
                  }"
                />
                <div class="image-tip">微信收款码</div>
              </div>
              <a-upload
                v-model:file-list="wechatPayFileList[getInternalKey(record)]"
                :before-upload="(file: any) => handleBeforeUpload(file, record, 'wechatPay')"
                :show-upload-list="false"
                accept="image/*"
                class="image-upload"
              >
                <a-button size="small" type="link">
                  {{ (editableData[getInternalKey(record)]?.wechatPay || (wechatPayFileList[getInternalKey(record)]?.length || 0) > 0) ? '重新上传' : '上传图片' }}
                </a-button>
              </a-upload>
            </div>
          </template>
        </div>
      </template>

      <!-- 支付宝收款码列 - 支持图片上传和预览 -->
      <template #cell-aliPay="{ record, isEditing, editableData, getInternalKey }">
        <div class="image-cell">
          <template v-if="!isEditing">
            <div v-if="record.aliPay" class="image-preview">
              <a-image
                :src="getImageUrl(record.aliPay)"
                :width="60"
                :height="60"
                :preview="{
                  src: getImageUrl(record.aliPay),
                }"
              />
              <div class="image-tip">支付宝收款码</div>
            </div>
            <span v-else style="color: #999">无</span>
          </template>
          <template v-else>
            <div class="image-upload-cell">
              <!-- 显示服务器已有图片或用户新选择的预览图片 -->
              <div v-if="aliPayFileList[getInternalKey(record)]?.[0]?.url" class="image-preview">
                <a-image
                  :src="aliPayFileList[getInternalKey(record)]![0]!.url"
                  :width="60"
                  :height="60"
                  :preview="{
                    src: aliPayFileList[getInternalKey(record)]![0]!.url,
                  }"
                />
                <div class="image-tip">支付宝收款码</div>
                <div class="pending-save-text">待保存</div>
              </div>
              <div v-else-if="editableData[getInternalKey(record)]?.aliPay" class="image-preview">
                <a-image
                  :src="getImageUrl(editableData[getInternalKey(record)]?.aliPay)"
                  :width="60"
                  :height="60"
                  :preview="{
                    src: getImageUrl(editableData[getInternalKey(record)]?.aliPay),
                  }"
                />
                <div class="image-tip">支付宝收款码</div>
              </div>
              <a-upload
                v-model:file-list="aliPayFileList[getInternalKey(record)]"
                :before-upload="(file: any) => handleBeforeUpload(file, record, 'aliPay')"
                :show-upload-list="false"
                accept="image/*"
                class="image-upload"
              >
                <a-button size="small" type="link">
                  {{ (editableData[getInternalKey(record)]?.aliPay || (aliPayFileList[getInternalKey(record)] && aliPayFileList[getInternalKey(record)]!.length > 0)) ? '重新上传' : '上传图片' }}
                </a-button>
              </a-upload>
            </div>
          </template>
        </div>
      </template>

      <!-- 操作列自定义插槽（可选） -->
      <template #operation="{ record, isEditing, save, cancel, edit, remove }">
        <div class="editable-row-operations">
          <span v-if="isEditing">
            <a-typography-link @click="save(getRowKeyValue(record))">保存</a-typography-link>
            <a style="margin-left: 8px" @click="cancel(getRowKeyValue(record))">取消</a>
            <a-popconfirm
              title="确认删除?"
              ok-text="是"
              cancel-text="否"
              @confirm="remove(getRowKeyValue(record))"
            >
              <a style="margin-left: 8px">删除</a>
            </a-popconfirm>
          </span>
          <span v-else>
            <div style="display: flex; align-items: center; justify-content: center">
              <a-button size="small" @click="edit(getRowKeyValue(record))"> 编辑 </a-button>
            </div>
          </span>
        </div>
      </template>
    </ManagePage>

    <!-- 添加/编辑弹窗 -->
    <a-modal
      v-model:open="formVisible"
      :title="formTitle"
      :width="600"
      :footer="null"
      :bodyStyle="{ maxHeight: '70vh', overflowY: 'auto', overflowX: 'hidden' }"
      @cancel="handleFormCancel"
    >
      <a-form  ref="formRef" :model="formData" :rules="formRules" layout="vertical">
        <a-row  :gutter="[16, 16]">
          <a-col :span="12">
            <a-form-item label="银行卡号" name="bankNum">
              <a-input v-model:value="formData.bankNum" placeholder="请输入银行卡号" allow-clear />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="银行名称" name="bankName">
              <a-input v-model:value="formData.bankName" placeholder="请输入银行名称" allow-clear />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="户名" name="huName">
              <a-input v-model:value="formData.huName" placeholder="请输入户名" allow-clear />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="辅料工厂名称" name="asName">
              <a-input
                v-model:value="formData.asName"
                placeholder="请输入辅料工厂名称"
                allow-clear
              />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="微信好友二维码" name="wechatQr">
              <div class="modal-image-upload">
                <div class="modal-image-container">
                  <a-row v-if="formData.wechatQr && !wechatQrUploadFile" class="modal-image-row">
                    <a-image
                      :width="80"
                      :height="80"
                      :src="getImageUrl(formData.wechatQr)"
                      alt="微信好友二维码"
                      class="modal-image-preview"
                    >
                      <template #previewMask>
                        <EyeOutlined />
                      </template>
                    </a-image>
                  </a-row>
                  <a-row v-if="wechatQrUploadFile" class="modal-image-row">
                    <a-image
                      :width="80"
                      :height="80"
                      :src="modalWechatQrFileList[0]?.url"
                      alt="微信好友二维码"
                      class="modal-image-preview"
                    >
                    </a-image>
                    <span class="pending-save-text">待保存</span>
                  </a-row>
                  <a-upload
                    :before-upload="(file: any) => handleModalImageUpload(file, 'wechatQr')"
                    :max-count="1"
                    :file-list="modalWechatQrFileList"
                    list-type="text"
                    @remove="() => handleModalImageRemove('wechatQr')"
                  >
                    <a-button>{{ formData.wechatQr ? '更换图片' : '选择图片' }}</a-button>
                  </a-upload>
                </div>
              </div>
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="微信收款码" name="wechatPay">
              <div class="modal-image-upload">
                <div class="modal-image-container">
                  <a-row v-if="formData.wechatPay && !wechatPayUploadFile" class="modal-image-row">
                    <a-image
                      :width="80"
                      :height="80"
                      :src="getImageUrl(formData.wechatPay)"
                      alt="微信收款码"
                      class="modal-image-preview"
                    >
                      <template #previewMask>
                        <EyeOutlined />
                      </template>
                    </a-image>
                  </a-row>
                  <a-row v-if="wechatPayUploadFile" class="modal-image-row">
                    <a-image
                      :width="80"
                      :height="80"
                      :src="modalWechatPayFileList[0]?.url"
                      alt="微信收款码"
                      class="modal-image-preview"
                    >
                    </a-image>
                    <span class="pending-save-text">待保存</span>
                  </a-row>
                  <a-upload
                    :before-upload="(file: any) => handleModalImageUpload(file, 'wechatPay')"
                    :max-count="1"
                    :file-list="modalWechatPayFileList"
                    list-type="text"
                    @remove="() => handleModalImageRemove('wechatPay')"
                  >
                    <a-button>{{ formData.wechatPay ? '更换图片' : '选择图片' }}</a-button>
                  </a-upload>
                </div>
              </div>
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="支付宝收款码" name="aliPay">
              <div class="modal-image-upload">
                <div class="modal-image-container">
                  <a-row v-if="formData.aliPay && !aliPayUploadFile" class="modal-image-row">
                    <a-image
                      :width="80"
                      :height="80"
                      :src="getImageUrl(formData.aliPay)"
                      alt="支付宝收款码"
                      class="modal-image-preview"
                    >
                      <template #previewMask>
                        <EyeOutlined />
                      </template>
                    </a-image>
                  </a-row>
                  <a-row v-if="aliPayUploadFile" class="modal-image-row">
                    <a-image
                      :width="80"
                      :height="80"
                      :src="modalAliPayFileList[0]?.url"
                      alt="支付宝收款码"
                      class="modal-image-preview"
                    >
                    </a-image>
                    <span class="pending-save-text">待保存</span>
                  </a-row>
                  <a-upload
                    :before-upload="(file: any) => handleModalImageUpload(file, 'aliPay')"
                    :max-count="1"
                    :file-list="modalAliPayFileList"
                    list-type="text"
                    @remove="() => handleModalImageRemove('aliPay')"
                  >
                    <a-button>{{ formData.aliPay ? '更换图片' : '选择图片' }}</a-button>
                  </a-upload>
                </div>
              </div>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="状态" name="status">
              <a-select v-model:value="formData.status" placeholder="请选择状态">
                <a-select-option :value="1">启用</a-select-option>
                <a-select-option :value="0">禁用</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="备注" name="remark">
              <a-textarea
                v-model:value="formData.remark"
                placeholder="请输入备注"
                :rows="3"
                show-count
                :maxlength="500"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <div style="text-align: right; margin-top: 16px">
          <a-button style="margin-right: 8px" @click="handleFormCancel"> 取消 </a-button>
          <a-button type="primary" @click="handleFormSubmit" :loading="formLoading">
            确定
          </a-button>
        </div>
      </a-form>
    </a-modal>
  </Modal>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { message } from 'ant-design-vue'
import type { FormInstance, UploadFile } from 'ant-design-vue'
import { EyeOutlined } from '@ant-design/icons-vue'
import Modal from '@/components/Modal.vue'
import ManagePage from '@/components/ManagePage.vue'
import {
  useAsPayInfoStore,
  columns,
  editableFields,
  addFormData,
  editFormData,
} from '@/stores/asPayInfo-store'
import type { AsPayInfoType } from '@/types/asPayInfo-type'
import { createAsPayInfoWithImages, updateAsPayInfoWithImages } from '@/api/services/asPayInfo-api'
import { getBackendUrl } from '@/utils/getApiUrl'

// 弹窗状态
const visible = defineModel<boolean>('visible', { default: false })

// Store实例
const store = useAsPayInfoStore()

// 数据源
const dataSource = computed(() => store.pagedList as any[])

// 搜索选项
const searchSelectOptions = computed(() => store.searchSelectOptions || [])

// 初始化搜索选项
store.searchSelectOptions = [
  { label: 'ID', value: 'id' },
  { label: '银行卡号', value: 'bankNum' },
  { label: '银行名称', value: 'bankName' },
  { label: '户名', value: 'huName' },
  { label: '辅料工厂名称', value: 'asName' },
  { label: '备注', value: 'remark' },
]

// 图片URL处理，基于更新时间戳防止缓存
const getImageUrl = (imageUrl: string | undefined) => {
  if (!imageUrl) return ''
  const baseUrl = getBackendUrl()
  // 检查是否是完整的URL
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://') || imageUrl.startsWith('data:')) {
    return imageUrl
  }
  return `${baseUrl}${imageUrl}`
}

// 表单弹窗状态
const formVisible = ref(false)
const formTitle = ref('添加支付信息')
const formLoading = ref(false)
const formRef = ref<FormInstance>()
const formData = reactive<AsPayInfoType>({
  bankNum: '',
  bankName: '',
  huName: '',
  asName: '',
  wechatQr: '',
  wechatPay: '',
  aliPay: '',
  status: 1,
  remark: '',
})

// 表单验证规则
const formRules = {
  bankNum: [{ required: true, message: '请输入银行卡号', trigger: 'blur' }],
  bankName: [{ required: true, message: '请输入银行名称', trigger: 'blur' }],
  huName: [{ required: true, message: '请输入户名', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
}

// 图片上传相关状态（用于表格行内编辑）
const wechatQrFileList = ref<Record<string, UploadFile[]>>({})
const wechatPayFileList = ref<Record<string, UploadFile[]>>({})
const aliPayFileList = ref<Record<string, UploadFile[]>>({})

// 弹窗图片上传相关状态（用于添加/编辑弹窗）
const wechatQrUploadFile = ref<File | null>(null)
const wechatPayUploadFile = ref<File | null>(null)
const aliPayUploadFile = ref<File | null>(null)

// 弹窗图片文件列表（单独定义，避免类型冲突）
const modalWechatQrFileList = ref<UploadFile[]>([])
const modalWechatPayFileList = ref<UploadFile[]>([])
const modalAliPayFileList = ref<UploadFile[]>([])

// 获取行主键值
const getRowKeyValue = (record: AsPayInfoType) => record.id || ''

// 关闭弹窗
const handleClose = () => {
  visible.value = false
}

// 打开弹窗
const open = () => {
  visible.value = true
}

// 添加支付信息
const handleAdd = () => {
  formTitle.value = '添加支付信息'
  Object.assign(formData, {
    id: undefined,
    bankNum: '',
    bankName: '',
    huName: '',
    asName: '',
    wechatQr: '',
    wechatPay: '',
    aliPay: '',
    status: 1,
    remark: '',
  })

  // 重置上传状态
  wechatQrUploadFile.value = null
  wechatPayUploadFile.value = null
  aliPayUploadFile.value = null
  modalWechatQrFileList.value = []
  modalWechatPayFileList.value = []
  modalAliPayFileList.value = []

  formVisible.value = true
}

// 图片上传前处理 - 仅预览，不上传
const handleBeforeUpload = async (
  file: any,
  record: AsPayInfoType,
  imageType: 'wechatQr' | 'wechatPay' | 'aliPay',
) => {
  const actualFile = file as File
  const recordKey = getRowKeyValue(record)
  
  try {
    // 创建FileReader来读取图片并预览
    const reader = new FileReader()
    
    reader.onload = (e) => {
      // 创建预览图片的URL
      const previewUrl = e.target?.result as string
      
      console.log(`图片预览创建成功: ${imageType}, 文件名: ${actualFile.name}`)
      
      // 根据图片类型存储到对应的文件列表
      if (imageType === 'wechatQr') {
        wechatQrFileList.value[recordKey] = [{
          uid: String(Date.now()),
          name: actualFile.name,
          status: 'done' as const,
          url: previewUrl,
          originFileObj: actualFile as any,
        }]
      } else if (imageType === 'wechatPay') {
        wechatPayFileList.value[recordKey] = [{
          uid: String(Date.now()),
          name: actualFile.name,
          status: 'done' as const,
          url: previewUrl,
          originFileObj: actualFile as any,
        }]
      } else if (imageType === 'aliPay') {
        aliPayFileList.value[recordKey] = [{
          uid: String(Date.now()),
          name: actualFile.name,
          status: 'done' as const,
          url: previewUrl,
          originFileObj: actualFile as any,
        }]
      }
      
      // 显示成功消息
      message.success('图片已选择，请点击保存按钮上传')
    }
    
    reader.onerror = (error) => {
      console.error('图片预览失败:', error)
      message.error('图片预览失败')
    }
    
    // 读取文件为DataURL用于预览
    reader.readAsDataURL(actualFile)
    
  } catch (error) {
    console.error('图片处理失败:', error)
    message.error('图片处理失败')
  }

  return false // 阻止默认上传行为
}

// 获取表格数据引用
const tableData = ref<AsPayInfoType[]>([])

// 监听store数据变化，更新tableData
watch(
  () => store.pagedList,
  (list) => {
    tableData.value = list as AsPayInfoType[]
  },
  { immediate: true },
)

// 保存数据（包含图片）
const handleSave = async (record: AsPayInfoType) => {
  const recordKey = getRowKeyValue(record)
  
  try {
    // 创建FormData对象，包含所有数据和图片
    const formDataToSend = new FormData()
    
    // 添加基本信息
    if (record.bankNum) formDataToSend.append('bankNum', record.bankNum)
    if (record.bankName) formDataToSend.append('bankName', record.bankName)
    if (record.huName) formDataToSend.append('huName', record.huName)
    if (record.asName) formDataToSend.append('asName', record.asName)
    if (record.status) formDataToSend.append('status', record.status.toString())
    if (record.remark) formDataToSend.append('remark', record.remark)
    
    // 如果有ID，说明是编辑操作
    if (record.id) {
      formDataToSend.append('id', record.id.toString())
    }
    
    // 检查是否有微信好友二维码图片需要上传
    const wechatQrFiles = wechatQrFileList.value[recordKey]
    if (wechatQrFiles && wechatQrFiles.length > 0) {
      const fileObj = wechatQrFiles[0] as any
      if (fileObj.originFileObj) {
        formDataToSend.append('wechatQrFile', fileObj.originFileObj)
      }
    }
    
    // 检查是否有微信收款码图片需要上传
    const wechatPayFiles = wechatPayFileList.value[recordKey]
    if (wechatPayFiles && wechatPayFiles.length > 0) {
      const fileObj = wechatPayFiles[0] as any
      if (fileObj.originFileObj) {
        formDataToSend.append('wechatPayFile', fileObj.originFileObj)
      }
    }
    
    // 检查是否有支付宝收款码图片需要上传
    const aliPayFiles = aliPayFileList.value[recordKey]
    if (aliPayFiles && aliPayFiles.length > 0) {
      const fileObj = aliPayFiles[0] as any
      if (fileObj.originFileObj) {
        formDataToSend.append('aliPayFile', fileObj.originFileObj)
      }
    }
    
    console.log('开始保存数据，记录ID:', record.id, '包含图片数量:', 
      (wechatQrFiles && wechatQrFiles.length > 0 ? 1 : 0) + 
      (wechatPayFiles && wechatPayFiles.length > 0 ? 1 : 0) + 
      (aliPayFiles && aliPayFiles.length > 0 ? 1 : 0)
    )
    
    // 一次性上传所有数据
    let response
    if (record.id) {
      // 更新已有记录
      response = await updateAsPayInfoWithImages(formDataToSend)
    } else {
      // 创建新记录
      response = await createAsPayInfoWithImages(formDataToSend)
    }
    
    if (response.data) {
      // 重新加载数据
      await store.fetchPage()
      
      // 清空文件列表
      wechatQrFileList.value[recordKey] = []
      wechatPayFileList.value[recordKey] = []
      aliPayFileList.value[recordKey] = []
      
      message.success('数据保存成功')
    }
  } catch (error) {
    console.error('保存失败:', error)
    message.error('保存失败')
  }
}

// 表单取消
const handleFormCancel = () => {
  formVisible.value = false
  formRef.value?.resetFields()
}

// 弹窗图片上传处理
const handleModalImageUpload = async (
  file: any,
  imageType: 'wechatQr' | 'wechatPay' | 'aliPay',
) => {
  const actualFile = file as File
  const reader = new FileReader()

  reader.onload = (e) => {
    const fileList: any[] = [
      {
        uid: String(Date.now()),
        name: actualFile.name,
        status: 'done' as const,
        url: e.target?.result as string,
        originFileObj: actualFile,
      },
    ]

    if (imageType === 'wechatQr') {
      modalWechatQrFileList.value = fileList
      wechatQrUploadFile.value = actualFile
    } else if (imageType === 'wechatPay') {
      modalWechatPayFileList.value = fileList
      wechatPayUploadFile.value = actualFile
    } else if (imageType === 'aliPay') {
      modalAliPayFileList.value = fileList
      aliPayUploadFile.value = actualFile
    }
  }

  reader.readAsDataURL(actualFile)
  return false // 阻止自动上传
}

// 弹窗图片移除处理
const handleModalImageRemove = (imageType: 'wechatQr' | 'wechatPay' | 'aliPay') => {
  if (imageType === 'wechatQr') {
    modalWechatQrFileList.value = []
    wechatQrUploadFile.value = null
  } else if (imageType === 'wechatPay') {
    modalWechatPayFileList.value = []
    wechatPayUploadFile.value = null
  } else if (imageType === 'aliPay') {
    modalAliPayFileList.value = []
    aliPayUploadFile.value = null
  }
  return true
}

// 表单提交
const handleFormSubmit = async () => {
  try {
    await formRef.value?.validate()

    formLoading.value = true

    // 创建FormData对象，一次性上传所有数据
    const formDataToSend = new FormData()

    // 添加基本信息
    if (formData.bankNum) formDataToSend.append('bankNum', formData.bankNum)
    if (formData.bankName) formDataToSend.append('bankName', formData.bankName)
    if (formData.huName) formDataToSend.append('huName', formData.huName)
    if (formData.asName) formDataToSend.append('asName', formData.asName)
    if (formData.status) formDataToSend.append('status', formData.status.toString())
    if (formData.remark) formDataToSend.append('remark', formData.remark)
    
    // 如果有ID，说明是编辑操作
    if (formData.id) {
      formDataToSend.append('id', formData.id.toString())
    }

    // 添加图片文件
    if (wechatQrUploadFile.value) {
      formDataToSend.append('wechatQrFile', wechatQrUploadFile.value)
    }
    if (wechatPayUploadFile.value) {
      formDataToSend.append('wechatPayFile', wechatPayUploadFile.value)
    }
    if (aliPayUploadFile.value) {
      formDataToSend.append('aliPayFile', aliPayUploadFile.value)
    }

    console.log('开始上传数据，包含字段数:', Array.from(formDataToSend.keys()).length)
    console.log('包含图片数量:', 
      (wechatQrUploadFile.value ? 1 : 0) + 
      (wechatPayUploadFile.value ? 1 : 0) + 
      (aliPayUploadFile.value ? 1 : 0)
    )

    try {
      // 一次性上传所有数据
      if (formData.id) {
        // 编辑操作
        await updateAsPayInfoWithImages(formDataToSend)
      } else {
        // 添加操作
        await createAsPayInfoWithImages(formDataToSend)
      }
    } catch (uploadError) {
      console.error('数据上传失败:', uploadError)
      message.error('数据上传失败，请稍后重试')
      throw new Error('数据上传失败')
    }

    // 重新加载数据
    await store.fetchPage()

    message.success(formData.id ? '更新成功' : '添加成功')
    formVisible.value = false
    formRef.value?.resetFields()

    // 重置上传状态
    wechatQrUploadFile.value = null
    wechatPayUploadFile.value = null
    aliPayUploadFile.value = null
    modalWechatQrFileList.value = []
    modalWechatPayFileList.value = []
    modalAliPayFileList.value = []
  } catch (error) {
    console.error('表单提交失败:', error)
  } finally {
    formLoading.value = false
  }
}

// 监听弹窗打开，加载数据
watch(visible, async (val) => {
  if (val) {
    await store.fetchPage()
  }
})

// 监听表单弹窗打开，重置表单数据
watch(formVisible, (val) => {
  if (!val) {
    formRef.value?.resetFields()
  }
})

// 监听编辑表单数据变化
watch(
  editFormData,
  (val) => {
    if (val && val.id) {
      formTitle.value = '编辑支付信息'
      Object.assign(formData, val)
      formVisible.value = true
    }
  },
  { deep: true },
)

// 监听添加表单数据变化
watch(
  addFormData,
  (val) => {
    if (val) {
      formTitle.value = '添加支付信息'
      Object.assign(formData, val)
      formVisible.value = true
    }
  },
  { deep: true },
)

// 暴露方法给父组件
defineExpose({
  open,
})
</script>

<style scoped>
.image-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.image-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.image-tip {
  font-size: 12px;
  color: #999;
}

.image-upload-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.image-upload {
  margin-top: 4px;
}

/* 弹窗图片上传样式 */
.modal-image-upload {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.modal-image-container {
  flex: 1;
}

.modal-image-row {
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.modal-image-preview {
  border-radius: 6px;
  overflow: hidden;
  border: 2px solid #f0f0f0;
  transition: border-color 0.3s;
}

.modal-image-preview:hover {
  border-color: #1890ff;
}

.pending-save-text {
  font-size: 12px;
  color: orange;
  font-style: italic;
}

/* 弹窗表单调整 */
:deep(.ant-form-item) {
  margin-bottom: 16px;
}

:deep(.ant-col-24) .ant-form-item {
  margin-bottom: 24px;
}
</style>
