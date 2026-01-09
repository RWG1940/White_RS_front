<template>
    <div class="gd-mobile-table">
        <div class="search-bar">
            <!-- 批次选择 -->
            <div class="batch-section">
                <a-select v-model:value="selectedBatchId" :options="batchOptions" placeholder="选择批次" allow-clear
                    @change="handleBatchChange" style="width: 100%; margin-bottom: 5px" />
            </div>

            <!-- 搜索框 -->
            <div class="search-section">
                <a-row :gutter="[8, 8]">
                    <a-col :span="19">
                        <a-input-search v-model:value="searchValue" placeholder="搜索SKU" enter-button
                            @search="handleSearch" style="margin-bottom: 5px" />
                    </a-col>
                    <a-col :span="5">
                        <a-button type="primary" @click="handleSearchReset"><ReloadOutlined /></a-button>
                    </a-col>
                </a-row>

            </div>
        </div>
        <!-- 列表 -->
        <div class="list-section">
            <a-empty v-if="pagedList.length === 0" description="暂无数据" />
            <div v-for="item in pagedList" :key="item.id" class="list-item" @click="selectedItem = item">
                <a-row :gutter="[8, 8]">
                    <!-- SKU 单独一行 -->
                    <a-col :span="24">
                        <div class="sku">{{ item.sku }}</div>
                    </a-col>

                    <!-- 状态徽章 -->
                    <a-col :span="9">
                        <div class="status-badges">
                            <div :style="{
                                borderRadius: '15px',
                                backgroundColor: item.washPriority == 2 ? 'red' : item.washPriority == 0 ? 'lightgreen' : 'gold',
                                width: '12px',
                                height: '12px',
                                boxShadow: `1px 1px 10px ${item.washPriority == 2 ? 'red' : item.washPriority == 0 ? 'lightgreen' : 'gold'}`,
                            }" />
                            <span style="margin: 0 4px; font-size: 12px; color: #666;">洗</span>
                            <div :style="{
                                borderRadius: '15px',
                                backgroundColor: item.tagPriority == 2 ? 'red' : item.tagPriority == 0 ? 'lightgreen' : 'gold',
                                width: '12px',
                                height: '12px',
                                boxShadow: `1px 1px 10px ${item.tagPriority == 2 ? 'red' : item.tagPriority == 0 ? 'lightgreen' : 'gold'}`,
                            }" />
                            <span style="margin: 0 4px; font-size: 12px; color: #666;">吊</span>
                        </div>
                    </a-col>
                    <!-- 状态标签 -->
                    <a-col :span="15">
                        <div class="status-info">
                            <a-tag
                                :color="item.washStatus == 0 ? 'lightgrey' : item.washStatus == 1 ? 'orange' : item.washStatus == 2 ? 'pink' : item.washStatus == 3 ? 'green' : ''">
                                洗{{ item.washStatus == 0 ? '未下单' : item.washStatus == 1 ? '做货中' : item.washStatus == 2 ?
                                    '待付款' : item.washStatus == 3 ? '已出货' : '' }}
                            </a-tag>
                            <a-tag
                                :color="item.tagStatus == 0 ? 'lightgrey' : item.tagStatus == 1 ? 'orange' : item.tagStatus == 2 ? 'pink' : item.tagStatus == 3 ? 'green' : ''">
                                吊{{ item.tagStatus == 0 ? '未下单' : item.tagStatus == 1 ? '做货中' : item.tagStatus == 2 ?
                                    '待付款' : item.tagStatus == 3 ? '已出货' : '' }}
                            </a-tag>
                        </div>
                    </a-col>

                    <!-- 颜色、品牌、数量 -->
                    <a-col :span="24">
                        <div class="info-item">颜色: {{ item.color }}</div>
                    </a-col>
                    <a-col :span="24">
                        <div class="info-item">品牌: {{ item.brand }}</div>
                    </a-col>
                    <a-col :span="24">
                        <div class="info-item">数量: {{ item.quantity }}</div>
                    </a-col>

                    <!-- 编辑按钮 -->
                    <a-col :span="24">
                        <div class="edit-button">
                            <a-button type="primary" style="width: 100%;" @click.stop="openEditModal(item)">
                                编辑</a-button>
                        </div>
                    </a-col>
                </a-row>
            </div>
        </div>

        <!-- 分页器 -->
        <div class="pagination-section" v-if="pagedList.length > 0">
            <a-pagination v-model:current="currentPage" v-model:pageSize="pageSize" :total="store.total"
                :showSizeChanger="true" :pageSizeOptions="['10', '20', '50', '100']" :showQuickJumper="true"
                :showTotal="() => `共 ${store.total} 条`" @change="handlePageChange" @showSizeChange="handleSizeChange"
                size="small" style="text-align: center; margin-top: 10px;" />
        </div>

        <!-- 编辑弹窗 -->
        <a-modal title="编辑记录" :open="editModalOpen" @ok="handleEditSave" @cancel="handleEditCancel" ok-text="确认"
            cancel-text="取消" :confirmLoading="editUploadLoading">
            <a-form layout="vertical" class="edit-modal-form">
                <a-form-item v-for="field in editableFields" :key="field" :label="getFieldLabel(field)">
                    <!-- 普通输入 -->
                    <a-input v-model:value="editForm[field]"
                        :placeholder="`请输入${getFieldLabel(field)}`" />
                </a-form-item>
            </a-form>
        </a-modal>

        <!-- 详情弹窗 -->
        <a-modal title="详细信息" :open="!!selectedItem" @cancel="selectedItem = null" width="90%" :footer="null"
            :body-style="{ maxHeight: '70vh', overflowY: 'auto' }">
            <template v-if="selectedItem">
                <div class="detail-section">
                    <!-- 图片 -->
                    <div class="detail-item">
                        <div class="detail-label">图片</div>
                        <div class="detail-content">
                            <template v-if="selectedItem.imageUrl">
                                <a-image :width="100" :height="100"
                                    :src="getImageUrl(selectedItem.imageUrl, selectedItem.updatedAt)"
                                    style="border-radius: 5px" />
                            </template>
                            <template v-else>
                                <div
                                    style="width: 100px; height: 100px; background: #f5f5f5; display: flex; align-items: center; justify-content: center; border-radius: 5px; border: 1px dashed #d9d9d9;">
                                    <span style="color: #999; font-size: 12px;">暂无图片</span>
                                </div>
                            </template>
                        </div>
                    </div>

                    <!-- 基本信息 -->
                    <a-divider>基本信息</a-divider>
                    <div class="detail-item">
                        <div class="detail-label">SKU</div>
                        <div class="detail-content">{{ selectedItem.sku }}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">颜色</div>
                        <div class="detail-content">{{ selectedItem.color }}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">品牌</div>
                        <div class="detail-content">{{ selectedItem.brand }}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">数量</div>
                        <div class="detail-content">{{ selectedItem.quantity }}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">英文品名</div>
                        <div class="detail-content">{{ selectedItem.nameEn }}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">季度</div>
                        <div class="detail-content">{{ selectedItem.quarter }}</div>
                    </div>

                    <!-- 洗标信息 -->
                    <a-divider>洗标信息</a-divider>
                    <div class="detail-item">
                        <div class="detail-label">洗标颜色</div>
                        <div class="detail-content">{{ selectedItem.washLabelColor }}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">洗标种类</div>
                        <div class="detail-content">{{ selectedItem.washLabelType }}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">洗标优先级</div>
                        <div class="detail-content">
                            <div :style="{
                                borderRadius: '15px',
                                backgroundColor: selectedItem.washPriority == 2 ? 'red' : selectedItem.washPriority == 0 ? 'lightgreen' : 'gold',
                                width: '20px',
                                height: '20px',
                                boxShadow: `1px 1px 15px ${selectedItem.washPriority == 2 ? 'red' : selectedItem.washPriority == 0 ? 'lightgreen' : 'gold'}`,
                            }" />
                        </div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">洗标状态</div>
                        <div class="detail-content">
                            <a-tag
                                :color="selectedItem.washStatus == 0 ? 'lightgrey' : selectedItem.washStatus == 1 ? 'orange' : selectedItem.washStatus == 2 ? 'pink' : selectedItem.washStatus == 3 ? 'green' : ''">
                                {{ selectedItem.washStatus == 0 ? '未下单' : selectedItem.washStatus == 1 ? '做货中' :
                                    selectedItem.washStatus == 2 ? '货好等付款' : selectedItem.washStatus == 3 ? '已出货' : '' }}
                            </a-tag>
                        </div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">洗标确认时间</div>
                        <div class="detail-content">{{ formatTime(selectedItem.washConfirmTime || '') }}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">洗标出货时间</div>
                        <div class="detail-content">{{ formatTime(selectedItem.washShipTime || '') }}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">洗标实际出货数量</div>
                        <div class="detail-content">{{ selectedItem.washShipQuantity }}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">洗标快递单号</div>
                        <div class="detail-content">{{ selectedItem.washExpressNo || '-' }}</div>
                    </div>

                    <!-- 吊牌信息 -->
                    <a-divider>吊牌信息</a-divider>
                    <div class="detail-item">
                        <div class="detail-label">吊牌优先级</div>
                        <div class="detail-content">
                            <div :style="{
                                borderRadius: '15px',
                                backgroundColor: selectedItem.tagPriority == 2 ? 'red' : selectedItem.tagPriority == 0 ? 'lightgreen' : 'gold',
                                width: '20px',
                                height: '20px',
                                boxShadow: `1px 1px 15px ${selectedItem.tagPriority == 2 ? 'red' : selectedItem.tagPriority == 0 ? 'lightgreen' : 'gold'}`,
                            }" />
                        </div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">吊牌状态</div>
                        <div class="detail-content">
                            <a-tag
                                :color="selectedItem.tagStatus == 0 ? 'lightgrey' : selectedItem.tagStatus == 1 ? 'orange' : selectedItem.tagStatus == 2 ? 'pink' : selectedItem.tagStatus == 3 ? 'green' : ''">
                                {{ selectedItem.tagStatus == 0 ? '未下单' : selectedItem.tagStatus == 1 ? '做货中' :
                                    selectedItem.tagStatus == 2 ? '货好等付款' : selectedItem.tagStatus == 3 ? '已出货' : '' }}
                            </a-tag>
                        </div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">吊牌确认时间</div>
                        <div class="detail-content">{{ formatTime(selectedItem.tagConfirmTime || '') }}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">吊牌出货时间</div>
                        <div class="detail-content">{{ formatTime(selectedItem.tagShipTime || '') }}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">吊牌实际出货数量</div>
                        <div class="detail-content">{{ selectedItem.tagShipQuantity }}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">吊牌快递单号</div>
                        <div class="detail-content">{{ selectedItem.tagExpressNo || '-' }}</div>
                    </div>

                    <!-- 其他信息 -->
                    <a-divider>其他信息</a-divider>
                    <div class="detail-item">
                        <div class="detail-label">工厂</div>
                        <div class="detail-content">{{ selectedItem.factory }}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">地址</div>
                        <div class="detail-content">{{ selectedItem.address }}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">跟单</div>
                        <div class="detail-content">{{ selectedItem.follower }}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">大面材料</div>
                        <div class="detail-content">{{ selectedItem.materialMain }}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">里衬材质</div>
                        <div class="detail-content">{{ selectedItem.materialLining }}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">备注</div>
                        <div class="detail-content">{{ selectedItem.remark || '-' }}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">批次id</div>
                        <div class="detail-content">{{ selectedItem.importId }}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">创建时间</div>
                        <div class="detail-content">{{ formatTime(selectedItem.createdAt || '') }}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">修改时间</div>
                        <div class="detail-content">{{ formatTime(selectedItem.updatedAt || '') }}</div>
                    </div>
                </div>
            </template>
        </a-modal>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, reactive } from 'vue'
import { accStore, fetchPageByImportId } from '@/stores/acc-store'
import type { AccPurchaseContractType } from '@/types/acc-type'
import { formatTime } from '@/utils/formatTime'
import { tableImportStore } from '@/stores/tableImport-store'
import { getBackendUrl } from '@/utils/api'
import { updateFileWithInfo } from '@/api/services/acc-api'
import { message } from 'ant-design-vue'
import { EyeOutlined,ReloadOutlined } from '@ant-design/icons-vue'

const store = accStore
const searchValue = ref('')
const selectedItem = ref<AccPurchaseContractType | null>(null)
const selectedBatchId = ref<number | undefined>(undefined)
const editModalOpen = ref(false)
const editingItem = ref<AccPurchaseContractType | null>(null)
const editUploadLoading = ref(false)

const currentPage = computed({
    get: () => store.currentPage,
    set: (val) => {
        store.currentPage = val
    },
})

const pageSize = computed({
    get: () => store.pageSize,
    set: (val) => {
        store.pageSize = val
    },
})

// 可编辑字段（参照 GDTable 的 editableFields）
const editableFields = [
    'factory',
    'address'
]

// 字段标签映射
const fieldLabels: Record<string, string> = {
    factory: '工厂',
    address: '地址'
}

// 获取字段标签
const getFieldLabel = (field: string) => {
    return fieldLabels[field] || field
}

// 图片 URL 处理
const getImageUrl = (imageUrl: string, updatedAt?: string | number) => {
    if (!imageUrl) return ''
    const baseUrl = getBackendUrl()
    if (!updatedAt) {
        return `${baseUrl}${imageUrl}`
    }
    const ts = new Date(updatedAt).getTime() || 0
    return `${baseUrl}${imageUrl}?t=${ts}`
}

// 编辑表单
const editForm = reactive<Record<string, any>>({})

// 获取原始数据源 - 与YDMobileTable逻辑一致
const dataSource = computed(() => {
    // 如果有搜索关键词，使用搜索结果，否则使用分页列表
    const keyword = searchValue.value.trim()
    if (keyword && store.searchResults) {
        return store.searchResults as AccPurchaseContractType[]
    }
    if (!store.pagedList) return []
    return store.pagedList as AccPurchaseContractType[]
})

// 过滤数据源 - 与YDMobileTable的filteredDataSource逻辑一致
const filteredDataSourceByBatch = computed(() => {
    if (selectedBatchId.value === undefined) {
        return dataSource.value
    }
    return dataSource.value.filter(row => row.importId === selectedBatchId.value)
})

// 分页后的列表
const pagedList = computed(() => {
    return filteredDataSourceByBatch.value
})

const handleSearch = async () => {
    const keyword = searchValue.value.trim()
    if (!keyword) {
        await store.fetchPage()
        return
    }
    await store.search({ column: 'sku', keyword: keyword } as any)
    currentPage.value = 1 // 搜索时重置到第一页
}

const batchOptions = computed(() => {
    return tableImportStore.list.map((batch: any) => ({
        label: `批次：${batch.id}`,
        value: batch.id,
    }))
})

/**
 * 批次切换、页码切换、页大小切换时触发
 */
const handleBatchChange = (value: number) => {
    selectedBatchId.value = value
    store.currentPage = 1
    store.pageSize = 10
    fetchPageByImportId(selectedBatchId.value, 0, 0)
}

const handlePageChange = (val: number) => {
    store.currentPage = val
    fetchPageByImportId(selectedBatchId.value || 0, store.currentPage, store.pageSize)
}

const handleSizeChange = (val: number) => {
    store.pageSize = val
    fetchPageByImportId(selectedBatchId.value || 0, store.currentPage, store.pageSize)
}

/*
* 打开编辑弹窗
 */
const openEditModal = (item: AccPurchaseContractType) => {
    editingItem.value = item
    Object.keys(editForm).forEach(k => delete editForm[k])
    Object.assign(editForm, editingItem.value)
    editModalOpen.value = true
}

/*
* 保存编辑
 */
const handleEditSave = async () => {
    if (!editingItem.value) return

    try {
        editUploadLoading.value = true

        // 检查：如果状态为已出货(3)，禁止修改工厂和地址
        if (editingItem.value.washStatus == 3 || editingItem.value.tagStatus == 3) {
            // 检查是否修改了工厂或地址
            const originalFactory = editingItem.value.factory
            const originalAddress = editingItem.value.address
            if (editForm.factory !== originalFactory || editForm.address !== originalAddress) {
                message.error('已出货的记录不能修改工厂和地址')
                return
            }
        }

        // 更新文字信息
        await store.update(editForm)

        editModalOpen.value = false

        // 刷新数据
        await store.fetchPage()

        // 更新selectedItem以反映最新数据
        if (selectedItem.value && selectedItem.value.id === editingItem.value.id) {
            const updatedData = store.pagedList?.find((item: any) => item.id === editingItem.value?.id)
            if (updatedData) {
                selectedItem.value = updatedData
            }
        }
    } catch (error) {
        message.error('修改失败')
        console.error('编辑失败', error)
    } finally {
        editUploadLoading.value = false
    }
}

/*
* 取消编辑
 */
const handleEditCancel = () => {
    editModalOpen.value = false
    editingItem.value = null
    // 重置表单
    Object.keys(editForm).forEach(k => delete editForm[k])
}

/*
* 搜索重置
 */
const handleSearchReset = () => {
    searchValue.value = ''
    handleSearch()
}


</script>

<style scoped>
.gd-mobile-table {
    padding: 5px;
}

.batch-section {
    margin-bottom: 5px;
}

.search-section {
    margin-bottom: 5px;
}

.list-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-height: calc(100vh - 320px);
    overflow: auto;
}

.list-item {
    background: white;
    border: 1px solid #f0f0f0;
    border-radius: 8px;
    padding: 12px;
    cursor: pointer;
    transition: all 0.3s;
}

.list-item:active {
    background: #fafafa;
    box-shadow: 0 2px 8px rgba(36, 36, 36, 0.1);
}

.sku {
    font-weight: bold;
    font-size: 16px;
    color: #333;
}

.status-badges {
    display: flex;
    gap: 4px;
    align-items: center;
}

.info-item {
    font-size: 12px;
    color: #666;
}

.status-info {
    display: flex;
    gap: 3px;
}

.edit-button {
    margin-top: 8px;
}

.detail-section {
    padding-right: 16px;
}

.detail-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid #f0f0f0;
}

.detail-label {
    font-weight: 500;
    color: #666;
    min-width: 100px;
}

.detail-content {
    flex: 1;
    text-align: right;
    color: #333;
    word-break: break-word;
    display: flex;
    justify-content: flex-end;
    align-items: center;
}

:deep(.ant-divider) {
    margin: 16px 0 12px 0;
}

.pagination-section {
    background: rgba(255, 255, 255, 0.305);
    padding: 8px;
    border-radius: 8px;
    margin-top: -5px;
    border: 1px solid #f0f0f0;
    backdrop-filter: blur(10px);
}

:deep(.ant-pagination) {
    font-size: 12px;
}

:deep(.ant-pagination-item) {
    min-width: 28px;
    height: 28px;
    line-height: 26px;
}

:deep(.ant-pagination-prev),
:deep(.ant-pagination-next) {
    min-width: 28px;
    height: 28px;
    line-height: 26px;
}

:deep(.ant-pagination-jump-prev),
:deep(.ant-pagination-jump-next) {
    min-width: 28px;
    height: 28px;
    line-height: 26px;
}
</style>