<template>
  <div class="store-container">
    <!-- 头部 -->
    <div class="store-header">
      <div class="header-left">
        <button class="back-button" @click="handleBackClick">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
          <span>返回订单页</span>
        </button>
      </div>
      <div class="header-title">商品选购</div>
      <div class="header-right">
        <!-- 库存表按钮 -->
        <button class="restock-button" @click="openInventoryTable">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14,2 14,8 20,8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10,9 9,9 8,9" />
          </svg>
          <span>库存表</span>
        </button>
      </div>
    </div>

    <!-- 商品网格 -->
    <div class="store-main">
      <div class="products-grid" v-if="products.length > 0">
        <div
          class="product-card"
          v-for="product in products"
          :key="product.id"
          :class="{ disabled: !product.inventory || product.inventory <= 0 }"
        >
          <div class="product-image">
            <a-image :src="getImageUrl(product.imageUrl!, product.updatedAt)" alt="">
              <template #previewMask>
                <EyeOutlined />
              </template>
            </a-image>
            <div class="stock-badge" v-if="product.inventory !== undefined">
              <span :class="{ 'low-stock': (product.inventory || 0) < 10 }">
                {{
                  product.inventory && product.inventory > 0 ? `库存: ${product.inventory}` : '缺货'
                }}
              </span>
            </div>
          </div>

          <div class="product-info">
            <div class="product-sku">{{ product.sku || '暂无货号' }}</div>
            <div class="product-style">
              <span class="color-tag">{{ product.color || '未知' }}</span>
              <span class="brand-tag">{{ product.brand || '未知品牌' }}</span>
            </div>
            <div class="product-name">{{ product.nameEn || '暂无品名' }}</div>
          </div>

          <button
            class="select-button"
            :disabled="!product.inventory || product.inventory <= 0"
            @click="handleSelectProduct(product)"
          >
            {{ (product.inventory || 0) > 0 ? '选购' : '缺货' }}
          </button>
        </div>
      </div>
      <div class="empty-state" v-else>
        <div class="empty-icon">
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 01-8 0" />
          </svg>
        </div>
        <p>暂无商品数据</p>
      </div>
    </div>

    <!-- 底部 -->
    <div class="store-footer">
      <div class="footer-info">
        <div class="total-count">
          已选: <span>{{ cartCount }}</span> 件商品
        </div>
      </div>
      <button class="confirm-button" :disabled="cart.length === 0" @click="handleConfirmOrder">
        <span class="cart-icon-wrapper" @click.stop="showCartModal = true">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
          </svg>
          <span class="badge-count" v-if="cartCount > 0">{{ cartCount }}</span>
        </span>
        确认选购
      </button>
    </div>

    <!-- 选购弹窗 -->
    <Modal
      v-model:visible="showSelectModal"
      :title="`选购：${selectedProduct?.sku}`"
      @confirm="confirmSelection"
    >
      <div class="product-preview">
        <img :src="getImageUrl(selectedProduct?.imageUrl || '', selectedProduct?.updatedAt)" />
        <div class="product-details">
          <div class="detail-item">
            <span class="label">品名:</span>
            <span class="value">{{ selectedProduct?.nameEn }}</span>
          </div>
          <div class="detail-item">
            <span class="label">款式:</span>
            <span class="value">{{ selectedProduct?.color }}</span>
          </div>

          <!-- 品牌-->
          <div class="detail-item">
            <span class="label">品牌:</span>
            <span class="value">{{ selectedProduct?.brand }}</span>
          </div>
          <!-- 大面材料-->
          <div class="detail-item">
            <span class="label">大面材料:</span>
            <span class="value">{{ selectedProduct?.materialMain }}</span>
          </div>
          <!-- 里衬材质-->
          <div class="detail-item">
            <span class="label">里衬材质:</span>
            <span class="value">{{ selectedProduct?.materialLining }}</span>
          </div>
          <!-- 洗标颜色-->
          <div class="detail-item">
            <span class="label">洗标颜色:</span>
            <span class="value">{{ selectedProduct?.washLabelColor }}</span>
          </div>
          <!-- 洗标种类-->
          <div class="detail-item">
            <span class="label">洗标种类:</span>
            <span class="value">{{ selectedProduct?.washLabelType }}</span>
          </div>
          <div class="detail-item">
            <span class="label">库存:</span>
            <span class="value stock">{{ selectedProduct?.inventory }}</span>
          </div>
        </div>
      </div>

      <div class="quantity-control">
        <button class="quantity-btn" :disabled="selectQuantity <= 1" @click="selectQuantity--">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
        <input
          type="number"
          v-model="selectQuantity"
          class="quantity-input"
          :min="1"
          :max="selectedProduct?.inventory || 0"
          @change="validateQuantity"
        />
        <button
          class="quantity-btn"
          :disabled="selectQuantity >= (selectedProduct?.inventory || 0)"
          @click="selectQuantity++"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>
    </Modal>

    <!-- 选购清单弹窗 -->
    <Modal
      v-model:visible="showCartModal"
      title="购物车"
      confirm-text="确认下单"
      :loading="orderSubmitting"
      @confirm="confirmOrder"
    >
      <!-- 表单信息 -->
      <div class="cart-form">
        <p style="font-weight: bold; font-family: 黑体">请填写下单信息：</p>
        <div class="form-row">
          <div class="form-item">
            <label>工厂</label>
            <input type="text" v-model="cartFactory" placeholder="请输入工厂" />
          </div>
          <div class="form-item">
            <label>地址</label>
            <input type="text" v-model="cartAddress" placeholder="请输入地址" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-item">
            <label>批次</label>
            <input type="text" v-model="cartBatch" placeholder="请输入批次" />
          </div>
          <div class="form-item">
            <label>辅料工厂</label>
            <input type="text" v-model="cartAccessoryFactory" placeholder="请输入辅料工厂" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-item">
            <label>跟单</label>
            <input type="text" v-model="cartTracking" placeholder="请输入跟单信息" />
          </div>
          <div class="form-item">
            <label>客户</label>
            <input type="text" v-model="cartCustomer" placeholder="请输入客户" />
          </div>
        </div>
      </div>

      <div class="cart-summary">
        <div class="summary-text">共 {{ cartCount }} 件商品</div>
      </div>

      <div class="cart-list">
        <div class="cart-item" v-for="(item, index) in cart" :key="index">
          <img
            class="item-image"
            :src="getImageUrl(item.product.imageUrl || '', item.product.updatedAt)"
          />
          <div class="item-info">
            <div class="item-sku">{{ item.product.sku }}</div>
            <div class="item-name">{{ item.product.nameEn }}</div>
            <div class="item-style">{{ item.product.color }}</div>
          </div>
          <div class="item-quantity">
            <div class="quantity-controls">
              <button class="quantity-btn" @click="decreaseQuantity(index)">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
              <span class="quantity-value">{{ item.quantity }}</span>
              <button class="quantity-btn" @click="increaseQuantity(index)">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
            </div>
            <button class="remove-btn" @click="removeFromCart(index)">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Modal>

    <!-- 手动添加弹窗 -->
    <Modal v-model:visible="showManualAddModal" title="库存表">
      <ManagePage
        v-model:data-source="restockDataSource"
        row-key="id"
        :columns="restockColumns"
        :editable-fields="restockEditableFields"
        :show-operation="true"
        :show-add="true"
        :show-batch-delete="true"
        :isBordered="false"
        :search-select-options="restockSearchOptions"
        search-placeholder="搜索商品"
        v-model:total="apcsFixedStore().total"
        v-model:currentPage="apcsFixedStore().currentPage"
        v-model:pageSize="apcsFixedStore().pageSize"
        v-model:loading="apcsFixedStore().loading"
        @search="handleRestockSearch"
        @add="handleRestockAdd"
        @save="apcsFixedStore().update"
        @row-delete="apcsFixedStore().handleRowDelete"
        @batch-delete="apcsFixedStore().removeSelected"
        @selection-change="apcsFixedStore().onSelectionChange"
      >
        <template #custom-tool>
          <button class="import-button" @click="handleImportFromFile">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="17,8 12,3 7,8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            导入
          </button>
        </template>
        <!-- 图片列自定义渲染 -->
        <template #cell-imageUrl="{ record }">
          <div class="image-cell">
            <div v-if="record.imageUrl" class="image-preview">
              <a-image
                :src="getImageUrl(record.imageUrl, record.updatedAt)"
                :width="50"
                :height="50"
                :preview="{
                  src: getImageUrl(record.imageUrl, record.updatedAt),
                }"
              />
            </div>
            <span v-else style="color: #999">无</span>
          </div>
        </template>

        <!-- 库存列自定义渲染 -->
        <template #cell-inventory="{ record, isEditing, editableData, getInternalKey }">
          <template v-if="!isEditing">
            <a-tag :color="(record.inventory || 0) > 0 ? 'green' : 'red'">
              {{ record.inventory || 0 }}
            </a-tag>
          </template>
          <template v-else>
            <a-input-number
              v-model:value="editableData[getInternalKey(record)]!.inventory"
              :min="0"
              size="small"
              style="width: 80px"
            />
          </template>
        </template>

        <!-- 操作列 -->
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
              <a-button size="small" @click="edit(getRowKeyValue(record))">编辑</a-button>
            </span>
          </div>
        </template>
      </ManagePage>

      <!-- 添加/编辑弹窗 -->
      <a-modal
        v-model:open="restockFormVisible"
        :title="restockFormTitle"
        :footer="null"
        :bodyStyle="{ maxHeight: '70vh', overflowY: 'auto', overflowX: 'hidden' }"
        @cancel="handleRestockFormCancel"
      >
        <a-form ref="restockFormRef" :model="restockFormData" layout="vertical">
          <!-- 商品图片上传 -->
          <div class="modal-image-upload">
            <a-row
              v-if="restockFormData.imageUrl && !restockImageUploadFile"
              class="modal-image-row"
            >
              <a-col>
                <a-image
                  :src="getImageUrl(restockFormData.imageUrl, restockFormData.updatedAt)"
                  :width="120"
                  :height="120"
                  :preview="{
                    src: getImageUrl(restockFormData.imageUrl, restockFormData.updatedAt),
                  }"
                />
                <div class="image-tip">商品图片</div>
              </a-col>
            </a-row>
            <a-row v-if="restockImageUploadFile" class="modal-image-row">
              <a-col>
                <a-image
                  :src="restockImagePreviewUrl"
                  :width="120"
                  :height="120"
                  :preview="{
                    src: restockImagePreviewUrl,
                  }"
                />
                <div class="image-tip">待保存</div>
              </a-col>
            </a-row>
            <a-row>
              <a-col>
                <a-upload
                  :before-upload="handleRestockImageUpload"
                  :show-upload-list="false"
                  accept="image/*"
                >
                  <a-button>{{
                    restockFormData.imageUrl || restockImageUploadFile ? '更换图片' : '选择图片'
                  }}</a-button>
                </a-upload>
              </a-col>
            </a-row>
          </div>
          <a-row :gutter="[16, 16]">
            <a-col :span="12">
              <a-form-item label="货号" name="sku">
                <a-input v-model:value="restockFormData.sku" placeholder="请输入货号" allow-clear />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="品名" name="nameEn">
                <a-input
                  v-model:value="restockFormData.nameEn"
                  placeholder="请输入品名"
                  allow-clear
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="颜色" name="color">
                <a-input
                  v-model:value="restockFormData.color"
                  placeholder="请输入颜色"
                  allow-clear
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="品牌" name="brand">
                <a-input
                  v-model:value="restockFormData.brand"
                  placeholder="请输入品牌"
                  allow-clear
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="大面材料" name="materialMain">
                <a-input
                  v-model:value="restockFormData.materialMain"
                  placeholder="请输入大面材料"
                  allow-clear
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="里衬材质" name="materialLining">
                <a-input
                  v-model:value="restockFormData.materialLining"
                  placeholder="请输入里衬材质"
                  allow-clear
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="洗标颜色" name="washLabelColor">
                <a-input
                  v-model:value="restockFormData.washLabelColor"
                  placeholder="请输入洗标颜色"
                  allow-clear
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="洗标种类" name="washLabelType">
                <a-input
                  v-model:value="restockFormData.washLabelType"
                  placeholder="请输入洗标种类"
                  allow-clear
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="线粒" name="threadPellets">
                <a-input
                  v-model:value="restockFormData.threadPellets"
                  placeholder="请输入线粒"
                  allow-clear
                />
              </a-form-item>
            </a-col>

            <a-col :span="12">
              <a-form-item label="库存" name="inventory">
                <a-input-number
                  v-model:value="restockFormData.inventory"
                  :min="0"
                  style="width: 100%"
                  placeholder="请输入库存"
                />
              </a-form-item>
            </a-col>
          </a-row>
          <div class="form-actions">
            <a-button @click="handleRestockFormCancel">取消</a-button>
            <a-button type="primary" @click="handleRestockFormSave">保存</a-button>
          </div>
        </a-form>
      </a-modal>
      <template #footer> </template>
    </Modal>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { EyeOutlined } from '@ant-design/icons-vue'
import { apcsFixedStore } from '@/stores/apcsFixed-store'
import {
  uploadApcsFixedInfoImage,
  updateApcsFixedInfoImage,
  createOrder,
  type CreateOrderRequest,
} from '@/api/services/apcsFixed-api'
import type { ApcsFixedType } from '@/types/apcsFixed-type'
import { getBackendUrl } from '@/utils/getApiUrl'
import Modal from '@/components/Modal.vue'
import ManagePage from '@/components/ManagePage.vue'
import type { TableColumnType, FormInstance } from 'ant-design-vue'

const emit = defineEmits(['back'])

// 打开库存表弹窗
const openInventoryTable = () => {
  showManualAddModal.value = true
  loadRestockData()
}

// 导入处理
const handleImportFromFile = () => {
  message.warning('功能暂未实现！')
  // TODO: 实现文件导入逻辑
}

// 手动添加弹窗状态
const showManualAddModal = ref(false)
const restockDataSource = ref<ApcsFixedType[]>([])
const restockSearchOptions = ref<{ label: string; value: string }[]>([])

// 手动添加表格列定义
type RecordType = Record<string, any>
const restockColumns: TableColumnType<RecordType>[] = [
  { title: '图片', dataIndex: 'imageUrl', key: 'imageUrl', width: 80 },
  { title: '货号', dataIndex: 'sku', key: 'sku', width: 100 },
  { title: '品名', dataIndex: 'nameEn', key: 'nameEn', width: 120 },
  { title: '颜色', dataIndex: 'color', key: 'color', width: 80 },
  { title: '品牌', dataIndex: 'brand', key: 'brand', width: 80 },
  { title: '大面材料', dataIndex: 'materialMain', key: 'materialMain', width: 100 },
  { title: '里衬材质', dataIndex: 'materialLining', key: 'materialLining', width: 100 },
  { title: '洗标颜色', dataIndex: 'washLabelColor', key: 'washLabelColor', width: 80 },
  { title: '洗标种类', dataIndex: 'washLabelType', key: 'washLabelType', width: 80 },
  { title: '线粒', dataIndex: 'threadPellets', key: 'threadPellets', width: 80 },
  { title: '库存', dataIndex: 'inventory', key: 'inventory', width: 80 },
]

// 可编辑字段
const restockEditableFields = ['inventory']

// 获取行键值
const getRowKeyValue = (record: RecordType) => record.id

// 加载库存数据
const loadRestockData = async () => {
  try {
    await apcsFixedStore().fetchAll()
    restockDataSource.value = apcsFixedStore().list || []
  } catch (error) {
    console.error('加载库存数据失败:', error)
  }
}

// 库存搜索
const handleRestockSearch = (payload: Record<string, string>) => {
  console.log('库存搜索:', payload)
  loadRestockData()
}

// 添加库存 - 打开表单弹窗
const handleRestockAdd = () => {
  restockFormTitle.value = '添加商品'
  restockFormData.value = {
    id: undefined,
    sku: '',
    nameEn: '',
    color: '',
    brand: '',
    materialMain: '',
    materialLining: '',
    washLabelColor: '',
    washLabelType: '',
    threadPellets: '',
    inventory: 0,
  }
  // 重置图片上传状态
  restockImageUploadFile.value = null
  restockImagePreviewUrl.value = ''
  restockFormVisible.value = true
}

// 表单弹窗状态
const restockFormVisible = ref(false)
const restockFormTitle = ref('添加商品')
const restockFormRef = ref<FormInstance>()
const restockFormData = ref<Partial<ApcsFixedType>>({})

// 图片上传相关状态
const restockImageUploadFile = ref<File | null>(null)
const restockImagePreviewUrl = ref<string>('')

// 图片上传处理
const handleRestockImageUpload = (file: any) => {
  const actualFile = file as File
  const reader = new FileReader()

  reader.onload = (e) => {
    restockImagePreviewUrl.value = e.target?.result as string
    restockImageUploadFile.value = actualFile
    message.success('图片已选择，请点击保存按钮上传')
  }

  reader.onerror = () => {
    message.error('图片预览失败')
  }

  reader.readAsDataURL(actualFile)
  return false // 阻止自动上传
}

// 保存表单
const handleRestockFormSave = async () => {
  try {
    // 创建 FormData 对象
    const formData = new FormData()

    // 添加基本字段
    if (restockFormData.value.id) {
      // 编辑模式：添加 id
      formData.append('id', String(restockFormData.value.id))
    }

    // 添加其他字段
    if (restockFormData.value.sku) formData.append('sku', restockFormData.value.sku)
    if (restockFormData.value.nameEn) formData.append('nameEn', restockFormData.value.nameEn)
    if (restockFormData.value.color) formData.append('color', restockFormData.value.color)
    if (restockFormData.value.brand) formData.append('brand', restockFormData.value.brand)
    if (restockFormData.value.materialMain)
      formData.append('materialMain', restockFormData.value.materialMain)
    if (restockFormData.value.materialLining)
      formData.append('materialLining', restockFormData.value.materialLining)
    if (restockFormData.value.washLabelColor)
      formData.append('washLabelColor', restockFormData.value.washLabelColor)
    if (restockFormData.value.washLabelType)
      formData.append('washLabelType', restockFormData.value.washLabelType)
    if (restockFormData.value.threadPellets)
      formData.append('threadPellets', restockFormData.value.threadPellets)
    if (restockFormData.value.inventory !== undefined)
      formData.append('inventory', String(restockFormData.value.inventory))

    // 添加图片文件
    if (restockImageUploadFile.value) {
      formData.append('imageFile', restockImageUploadFile.value)
    }

    // 根据是否有 id 调用不同的 API
    if (restockFormData.value.id) {
      // 编辑
      await updateApcsFixedInfoImage(formData)
    } else {
      // 添加模式
      await uploadApcsFixedInfoImage(formData)
    }

    restockFormVisible.value = false
    restockFormRef.value?.resetFields()
    // 重置图片上传状态
    restockImageUploadFile.value = null
    restockImagePreviewUrl.value = ''
    // 刷新数据
    loadRestockData()
  } catch (error) {
    console.error('保存失败:', error)
    message.error('保存失败')
  }
}

// 取消表单
const handleRestockFormCancel = () => {
  restockFormVisible.value = false
  restockFormRef.value?.resetFields()
}

// 商品列表
const products = ref<ApcsFixedType[]>([])

// 购物车
const cart = ref<{ product: ApcsFixedType; quantity: number }[]>([])

// 选购弹窗
const showSelectModal = ref(false)
const selectedProduct = ref<ApcsFixedType | null>(null)
const selectQuantity = ref(1)

// 购物车弹窗
const showCartModal = ref(false)

// 购物车表单数据
const cartFactory = ref('')
const cartBatch = ref('')
const cartAccessoryFactory = ref('')
const cartAddress = ref('')
const cartTracking = ref('') // 跟单字段
const cartCustomer = ref('') // 客户字段
const orderSubmitting = ref(false) // 订单提交加载状态

// 计算购物车商品总数
const cartCount = computed(() => {
  return cart.value.reduce((total, item) => total + item.quantity, 0)
})

// 返回按钮
const handleBackClick = () => {
  emit('back')
}

// 获取商品列表
const loadProducts = async () => {
  try {
    const store = apcsFixedStore()
    await store.fetchAll()
    products.value = store.list || []
  } catch (error) {
    console.error('加载商品失败:', error)
  }
}

// 选择商品
const handleSelectProduct = (product: ApcsFixedType) => {
  selectedProduct.value = product
  selectQuantity.value = 1
  showSelectModal.value = true
}

// 验证数量
const validateQuantity = () => {
  const maxStock = selectedProduct.value?.inventory || 0
  if (selectQuantity.value < 1) {
    selectQuantity.value = 1
  } else if (selectQuantity.value > maxStock) {
    selectQuantity.value = maxStock
  }
}

// 确认选购
const confirmSelection = () => {
  if (!selectedProduct.value) return

  const product = selectedProduct.value
  const existingIndex = cart.value.findIndex((item) => item.product.id === product.id)

  if (existingIndex >= 0) {
    const maxStock = (product.inventory as number) || 0
    const newItem = cart.value[existingIndex]
    if (newItem) {
      newItem.quantity = Math.min(newItem.quantity + selectQuantity.value, maxStock)
    }
  } else {
    cart.value.push({
      product: product,
      quantity: selectQuantity.value,
    })
  }

  showSelectModal.value = false
  // 定时器
  setTimeout(() => {
    selectedProduct.value = null
    selectQuantity.value = 1
  }, 500)
}

// 从购物车移除
const removeFromCart = (index: number) => {
  cart.value.splice(index, 1)
}

// 增加商品数量
const increaseQuantity = (index: number) => {
  const item = cart.value[index]
  if (item) {
    item.quantity++
  }
}

// 减少商品数量
const decreaseQuantity = (index: number) => {
  const item = cart.value[index]
  if (item && item.quantity > 1) {
    item.quantity--
  } else if (item) {
    // 如果数量为1，点击减少则移除该商品
    removeFromCart(index)
  }
}

// 确认选购
const handleConfirmOrder = () => {
  showCartModal.value = true
}

// 确认下单
const confirmOrder = async () => {
  // 防止重复提交
  if (orderSubmitting.value) {
    return
  }

  // 表单验证
  if (!cartFactory.value.trim()) {
    message.error('请输入工厂名称')
    return
  }
  if (!cartAddress.value.trim()) {
    message.error('请输入地址')
    return
  }
  if (!cartBatch.value.trim()) {
    message.error('请输入批次')
    return
  }
  if (!cartAccessoryFactory.value.trim()) {
    message.error('请输入辅料工厂')
    return
  }

  if (cart.value.length === 0) {
    message.error('购物车为空，无法下单')
    return
  }

  orderSubmitting.value = true

  try {
    // 构建订单数据
    const orderData: CreateOrderRequest = {
      items: cart.value.map((item) => ({
        apcsFixedId: item.product.id!,
        quantity: item.quantity,
      })),
      factory: cartFactory.value,
      batch: cartBatch.value,
      address: cartAddress.value,
      accessoryFactory: cartAccessoryFactory.value,
      tracking: cartTracking.value, // 跟单字段
      customer: cartCustomer.value, // 客户字段
    }

    console.log('提交订单数据:', orderData)

    // 调用 API 提交订单
    await createOrder(orderData)

    message.success('下单成功！')

    // 清空购物车和表单
    cart.value = []
    cartFactory.value = ''
    cartAddress.value = ''
    cartBatch.value = ''
    cartAccessoryFactory.value = ''
    cartTracking.value = ''
    cartCustomer.value = ''

    // 关闭弹窗
    showCartModal.value = false
  } catch (error: any) {
    console.error('下单失败:', error)
    message.error(error?.response?.data?.message || '下单失败，请重试')
  } finally {
    orderSubmitting.value = false
  }
}
//
const getImageUrl = (imageUrl: string, updatedAt?: string | number) => {
  if (!imageUrl) return ''
  const baseUrl = getBackendUrl()
  if (!updatedAt) {
    return `${baseUrl}${imageUrl}`
  }
  const ts = new Date(updatedAt).getTime() || 0
  return `${baseUrl}${imageUrl}?t=${ts}`
}
onMounted(() => {
  loadProducts()
})
</script>

<style scoped>
.store-container {
  width: 100%;
  height: 80vh;
  display: flex;
  flex-direction: column;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB',
    'Microsoft YaHei', sans-serif;
}

/* 头部样式 */
.store-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: transparent;
  border: none;
  color: #1d1d1f;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.back-button:hover {
  background: rgba(0, 0, 0, 0.05);
}

.header-title {
  font-size: 17px;
  font-weight: 600;
  color: #1d1d1f;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.restock-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: black;
  border: none;
  border-radius: 20px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 20px rgba(58, 58, 58, 0.601);
}

.restock-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 32px rgba(0, 0, 0, 0.4);
}

.cart-badge {
  position: relative;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.cart-badge:hover {
  background: rgba(0, 0, 0, 0.05);
}

.badge-count {
  position: absolute;
  top: -8px;
  right: -10px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background: #ff3b30;
  color: white;
  font-size: 11px;
  font-weight: 600;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 主内容区域 */
.store-main {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  -webkit-overflow-scrolling: touch;
}

.store-main::-webkit-scrollbar {
  width: 8px;
}

.store-main::-webkit-scrollbar-track {
  background: transparent;
}

.store-main::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  padding-bottom: 100px;
}

.product-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
}

.product-card:not(.disabled):hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.product-card.disabled {
  opacity: 0.5;
}

.product-image {
  position: relative;
  width: 100%;
  height: 200px;
  background: #f5f5f7;
  overflow: hidden;
}

.product-image :deep(.ant-image) {
  width: 100%;
  height: 100%;
}

.product-image :deep(.ant-image img) {
  width: 100%;
  height: 200px;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-card:not(.disabled):hover .product-image img {
  transform: scale(1.05);
}

.stock-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 6px 10px;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  color: white;
  font-size: 12px;
  font-weight: 500;
}

.stock-badge .low-stock {
  color: #ff9500;
}

.product-info {
  padding: 14px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.product-sku {
  font-size: 13px;
  font-weight: 600;
  color: #1d1d1f;
  letter-spacing: 0.5px;
}

.product-style {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.color-tag,
.brand-tag {
  padding: 4px 10px;
  background: #f5f5f7;
  border-radius: 12px;
  font-size: 11px;
  color: #6e6e73;
  font-weight: 500;
}

.product-name {
  font-size: 14px;
  color: #6e6e73;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.select-button {
  margin: 0 14px 14px;
  padding: 12px;
  background: #007aff;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.select-button:hover:not(:disabled) {
  transform: scale(1.02);
  box-shadow: 0 4px 15px rgba(0, 122, 255, 0.3);
}

.select-button:disabled {
  background: #e5e5e5;
  cursor: not-allowed;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 20px;
  color: #86868b;
}

.empty-icon {
  margin-bottom: 20px;
  opacity: 0.3;
}

.empty-state p {
  font-size: 16px;
  font-weight: 500;
}

/* 底部 */
.store-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

.footer-info {
  flex: 1;
}

.total-count {
  font-size: 16px;
  color: #1d1d1f;
  font-weight: 500;
}

.total-count span {
  color: #007aff;
  font-weight: 600;
}

.confirm-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 32px;
  background: #007aff;
  color: white;
  border: none;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 122, 255, 0.2);
}

.cart-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.cart-icon-wrapper:hover {
  opacity: 0.8;
}

.confirm-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 122, 255, 0.3);
}

.confirm-button:disabled {
  background: #e5e5e5;
  cursor: not-allowed;
  box-shadow: none;
}

/* 弹窗 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: white;
  border-radius: 20px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #f5f5f7;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
}

.close-button {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f7;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: #e5e5e5;
  transform: rotate(90deg);
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
}

/* 选购弹窗内容 */
.product-preview {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.product-preview img {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 12px;
  background: #f5f5f7;
}

.product-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.detail-item .label {
  color: #86868b;
  min-width: 40px;
}

.detail-item .value {
  color: #1d1d1f;
  font-weight: 500;
}

.detail-item .value.stock {
  color: #007aff;
  font-weight: 600;
}

.quantity-control {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 20px 0;
}

.quantity-btn {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f7;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.quantity-btn:hover:not(:disabled) {
  background: #e5e5e5;
  transform: scale(1.1);
}

.quantity-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.quantity-input {
  width: 80px;
  height: 44px;
  text-align: center;
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
  border: 2px solid #f5f5f7;
  border-radius: 12px;
  background: white;
  transition: all 0.2s ease;
}

.quantity-input:focus {
  outline: none;
  border-color: #007aff;
}

/* 购物车弹窗内容 */
.cart-body {
  padding: 0;
}

/* 购物车表单 */
.cart-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;
}

.cart-form .form-row {
  display: flex;
  gap: 16px;
}

.cart-form .form-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cart-form .form-item label {
  font-size: 14px;
  color: #86868b;
  font-weight: 500;
}

.cart-form .form-item input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 10px;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.8);
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.cart-form .form-item input:focus {
  outline: none;
  border-color: #007aff;
  background: white;
}

/* 手动添加表格操作列 */
.editable-row-operations {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 手动添加表单操作 */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.cart-list {
  border-radius: 20px;
  max-height: 200px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
}

.cart-list::-webkit-scrollbar {
  width: 6px;
}

.cart-list::-webkit-scrollbar-track {
  background: transparent;
}

.cart-list::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.cart-list::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 24px;
  border-bottom: 1px solid #f5f5f7;
  transition: background 0.2s ease;
}

.cart-item:hover {
  background: #44444410;
}

.item-image {
  width: 64px;
  height: 64px;
  object-fit: cover;
  border-radius: 10px;
  background: #f5f5f7;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.item-sku {
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
}

.item-name {
  font-size: 13px;
  color: #6e6e73;
}

.item-style {
  font-size: 12px;
  color: #86868b;
}

.item-quantity {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.quantity-btn {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  border: none;
  border-radius: 6px;
  color: #1d1d1f;
  cursor: pointer;
  transition: all 0.2s ease;
}

.quantity-btn:hover {
  background: #e0e0e0;
}

.quantity-value {
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
  min-width: 24px;
  text-align: center;
}

.remove-btn {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: #bfbfbf;
  cursor: pointer;
  transition: all 0.2s ease;
}

.remove-btn:hover {
  background: #fff1f0;
  color: #ff4d4f;
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-top: 1px solid #f5f5f7;
}

.cart-summary {
  flex: 1;
}

.summary-text {
  font-size: 15px;
  color: #1d1d1f;
  font-weight: 500;
}

.summary-text span {
  color: #007aff;
  font-weight: 600;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .store-main {
    padding: 12px;
  }

  .modal-content {
    width: 95%;
    max-width: none;
  }

  .product-preview {
    flex-direction: column;
  }

  .product-preview img {
    width: 100%;
    height: 200px;
  }
}

@media (max-width: 480px) {
  .products-grid {
    grid-template-columns: 1fr;
  }

  .header-title {
    font-size: 15px;
  }

  .confirm-button {
    padding: 12px 24px;
    font-size: 14px;
  }
}

/* 页面进入动画 */
.store-container {
  animation: pageEnter 0.4s ease-out forwards;
}

@keyframes pageEnter {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 商品卡片入场动画 - 交错延迟 */
.product-card {
  animation: cardEnter 0.5s ease-out forwards;
  opacity: 0;
}

.product-card:nth-child(1) {
  animation-delay: 0.05s;
}
.product-card:nth-child(2) {
  animation-delay: 0.1s;
}
.product-card:nth-child(3) {
  animation-delay: 0.15s;
}
.product-card:nth-child(4) {
  animation-delay: 0.2s;
}
.product-card:nth-child(5) {
  animation-delay: 0.25s;
}
.product-card:nth-child(6) {
  animation-delay: 0.3s;
}
.product-card:nth-child(7) {
  animation-delay: 0.35s;
}
.product-card:nth-child(8) {
  animation-delay: 0.4s;
}

@keyframes cardEnter {
  0% {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 补货弹窗选项 */
.restock-options {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 10px 0;
}

.restock-option {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.restock-option:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.restock-option .option-icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #007aff 0%, #5856d6 100%);
  border-radius: 14px;
  color: white;
}

.restock-option .option-text {
  flex: 1;
}

.restock-option .option-title {
  font-size: 16px;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 4px;
}

.restock-option .option-desc {
  font-size: 13px;
  color: #86868b;
}

/* 图片上传样式 */
.image-cell {
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-preview {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
}

.image-preview .image-tip {
  font-size: 10px;
  color: #86868b;
  text-align: center;
  margin-top: 2px;
}

.image-preview .pending-save-text {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  border-radius: 8px;
}

/* 弹窗图片上传样式 */
.modal-image-upload {
  margin-bottom: 16px;
}

.modal-image-row {
  margin-bottom: 12px;
}

.modal-image-upload .image-tip {
  font-size: 12px;
  color: #86868b;
  text-align: center;
  margin-top: 4px;
}

/* 库存表底部导入按钮 */
.inventory-footer {
  display: flex;
  justify-content: flex-start;
}

.import-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #f0f0f0;
  border: none;
  border-radius: 8px;
  color: #1d1d1f;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.import-button:hover {
  background: #e0e0e0;
}
</style>
