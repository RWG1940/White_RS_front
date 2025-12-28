<template>
    <div class="as-mobile-table">
        <!-- 批次选择 -->
        <div class="batch-section">
            <a-select
                v-model:value="selectedBatchId"
                :options="batchOptions"
                placeholder="选择批次"
                allow-clear
                @change="handleBatchChange"
                style="width: 100%; margin-bottom: 12px"
            />
        </div>

        <!-- 搜索框 -->
        <div class="search-section">
            <a-input-search
                v-model:value="searchValue"
                placeholder="搜索SKU"
                enter-button
                @search="handleSearch"
                style="margin-bottom: 16px"
            />
        </div>

        <!-- 列表 -->
        <div class="list-section">
            <a-empty v-if="filteredList.length === 0" description="暂无数据" />
            <div
                v-for="item in filteredList"
                :key="item.id"
                class="list-item"
                @click="selectedItem = item"
            >
                <div class="item-header">
                    <div class="sku">{{ item.sku }}</div>
                    <div class="status-badges">
                        <div
                            :style="{
                                borderRadius: '15px',
                                backgroundColor: item.washPriority == 2 ? 'red' : item.washPriority == 0 ? 'lightgreen' : 'gold',
                                width: '12px',
                                height: '12px',
                                boxShadow: `1px 1px 10px ${item.washPriority == 2 ? 'red' : item.washPriority == 0 ? 'lightgreen' : 'gold'}`,
                            }"
                        />
                        <span style="margin: 0 4px; font-size: 12px; color: #666;">洗</span>
                        <div
                            :style="{
                                borderRadius: '15px',
                                backgroundColor: item.tagPriority == 2 ? 'red' : item.tagPriority == 0 ? 'lightgreen' : 'gold',
                                width: '12px',
                                height: '12px',
                                boxShadow: `1px 1px 10px ${item.tagPriority == 2 ? 'red' : item.tagPriority == 0 ? 'lightgreen' : 'gold'}`,
                            }"
                        />
                        <span style="margin: 0 4px; font-size: 12px; color: #666;">吊</span>
                    </div>
                </div>
                <div class="item-info">
                    <span class="info-item">颜色: {{ item.color }}</span>
                    <span class="info-item">品牌: {{ item.brand }}</span>
                    <span class="info-item">数量: {{ item.quantity }}</span>
                </div>
                <div class="status-info">
                    <a-tag
                            :color="item.washStatus == 0 ? 'lightgrey' : item.washStatus == 1 ? 'orange' : item.washStatus == 2 ? 'pink' : item.washStatus == 3 ? 'green' : ''"
                        >
                            洗{{ item.washStatus == 0 ? '未下单' : item.washStatus == 1 ? '做货中' : item.washStatus == 2 ? '待付款' : item.washStatus == 3 ? '已出货' : '' }}
                        </a-tag>
                        <a-tag
                            :color="item.tagStatus == 0 ? 'lightgrey' : item.tagStatus == 1 ? 'orange' : item.tagStatus == 2 ? 'pink' : item.tagStatus == 3 ? 'green' : ''"
                        >
                            吊{{ item.tagStatus == 0 ? '未下单' : item.tagStatus == 1 ? '做货中' : item.tagStatus == 2 ? '待付款' : item.tagStatus == 3 ? '已出货' : '' }}
                        </a-tag>
                </div>
                <div class="edit-button">
                    <a-button type="primary" size="small" @click.stop="openEditModal(item)">编辑</a-button>
                </div>
            </div>
        </div>

        <!-- 编辑弹窗 -->
        <a-modal
            title="编辑信息"
            :open="editModalOpen"
            @ok="handleEditSave"
            @cancel="handleEditCancel"
            ok-text="保存"
            cancel-text="取消"
        >
            <a-form layout="vertical">
                <a-form-item label="洗标状态">
                    <a-select
                        v-model:value="editForm.washStatus"
                        placeholder="选择洗标状态"
                        allow-clear
                    >
                        <a-select-option :value="0">未下单</a-select-option>
                        <a-select-option :value="1">做货中</a-select-option>
                        <a-select-option :value="2">货好等付款</a-select-option>
                        <a-select-option :value="3">已出货</a-select-option>
                    </a-select>
                    <div style="color: #999; font-size: 12px; margin-top: 4px;">
                        若填写快递单号，状态将自动设为已出货
                    </div>
                </a-form-item>
                <a-form-item label="洗标快递单号">
                    <a-input
                        v-model:value="editForm.washExpressNo"
                        placeholder="请输入洗标快递单号"
                    />
                </a-form-item>
                <a-form-item label="吊牌状态">
                    <a-select
                        v-model:value="editForm.tagStatus"
                        placeholder="选择吊牌状态"
                        allow-clear
                    >
                        <a-select-option :value="0">未下单</a-select-option>
                        <a-select-option :value="1">做货中</a-select-option>
                        <a-select-option :value="2">货好等付款</a-select-option>
                        <a-select-option :value="3">已出货</a-select-option>
                    </a-select>
                    <div style="color: #999; font-size: 12px; margin-top: 4px;">
                        若填写快递单号，状态将自动设为已出货
                    </div>
                </a-form-item>
                <a-form-item label="吊牌快递单号">
                    <a-input
                        v-model:value="editForm.tagExpressNo"
                        placeholder="请输入吊牌快递单号"
                    />
                </a-form-item>
                <a-form-item label="备注">
                    <a-textarea
                        v-model:value="editForm.remark"
                        placeholder="请输入备注信息"
                        :rows="3"
                    />
                </a-form-item>
            </a-form>
        </a-modal>

        <!-- 详情弹窗 -->
        <a-modal
            title="详细信息"
            :open="!!selectedItem"
            @cancel="selectedItem = null"
            width="90%"
            :footer="null"
            :body-style="{ maxHeight: '70vh', overflowY: 'auto' }"
        >
            <template v-if="selectedItem">
                <div class="detail-section">
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
                            <div
                                :style="{
                                    borderRadius: '15px',
                                    backgroundColor: selectedItem.washPriority == 2 ? 'red' : selectedItem.washPriority == 0 ? 'lightgreen' : 'gold',
                                    width: '20px',
                                    height: '20px',
                                    boxShadow: `1px 1px 15px ${selectedItem.washPriority == 2 ? 'red' : selectedItem.washPriority == 0 ? 'lightgreen' : 'gold'}`,
                                }"
                            />
                        </div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">洗标单价</div>
                        <div class="detail-content">{{ selectedItem.washUnitPrice }}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">洗标总价</div>
                        <div class="detail-content">{{ selectedItem.washTotalPrice }}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">洗标状态</div>
                        <div class="detail-content">
                            <a-tag
                                :color="selectedItem.washStatus == 0 ? 'lightgrey' : selectedItem.washStatus == 1 ? 'orange' : selectedItem.washStatus == 2 ? 'pink' : selectedItem.washStatus == 3 ? 'green' : ''"
                            >
                                {{ selectedItem.washStatus == 0 ? '未下单' : selectedItem.washStatus == 1 ? '做货中' : selectedItem.washStatus == 2 ? '货好等付款' : selectedItem.washStatus == 3 ? '已出货' : '' }}
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
                            <div
                                :style="{
                                    borderRadius: '15px',
                                    backgroundColor: selectedItem.tagPriority == 2 ? 'red' : selectedItem.tagPriority == 0 ? 'lightgreen' : 'gold',
                                    width: '20px',
                                    height: '20px',
                                    boxShadow: `1px 1px 15px ${selectedItem.tagPriority == 2 ? 'red' : selectedItem.tagPriority == 0 ? 'lightgreen' : 'gold'}`,
                                }"
                            />
                        </div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">吊牌单价</div>
                        <div class="detail-content">{{ selectedItem.tagUnitPrice }}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">吊牌总价</div>
                        <div class="detail-content">{{ selectedItem.tagTotalPrice }}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">吊牌状态</div>
                        <div class="detail-content">
                            <a-tag
                                :color="selectedItem.tagStatus == 0 ? 'lightgrey' : selectedItem.tagStatus == 1 ? 'orange' : selectedItem.tagStatus == 2 ? 'pink' : selectedItem.tagStatus == 3 ? 'green' : ''"
                            >
                                {{ selectedItem.tagStatus == 0 ? '未下单' : selectedItem.tagStatus == 1 ? '做货中' : selectedItem.tagStatus == 2 ? '货好等付款' : selectedItem.tagStatus == 3 ? '已出货' : '' }}
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
                        <div class="detail-label">创建时间</div>
                        <div class="detail-content">{{ formatTime(selectedItem.createdAt || '') }}</div>
                    </div>
                </div>
            </template>
        </a-modal>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { accStore } from '@/stores/acc-store'
import type { AccPurchaseContractType } from '@/types/acc-type'
import { formatTime } from '@/utils/formatTime'
import { tableImportStore } from '@/stores/tableImport-store'

const store = accStore
const searchValue = ref('')
const selectedItem = ref<AccPurchaseContractType | null>(null)
const selectedBatchId = ref<number | undefined>(undefined)
const editModalOpen = ref(false)
const editingItem = ref<AccPurchaseContractType | null>(null)
const editForm = ref({
    washStatus: undefined as number | undefined,
    washExpressNo: '',
    tagStatus: undefined as number | undefined,
    tagExpressNo: '',
    remark: '',
})

// 获取原始数据源
const dataSource = computed(() => {
    if (!store.pagedList) return []
    return store.pagedList as AccPurchaseContractType[]
})

// 过滤数据源 - 与ASTable的filteredDataSource逻辑一致
const filteredDataSourceByBatch = computed(() => {
    if (selectedBatchId.value === undefined) {
        return dataSource.value
    }
    return dataSource.value.filter(row => row.importId === selectedBatchId.value)
})

// 根据搜索关键词过滤列表
const filteredList = computed(() => {
    const keyword = searchValue.value.trim().toLowerCase()
    if (!keyword) {
        return filteredDataSourceByBatch.value
    }
    return filteredDataSourceByBatch.value.filter(item =>
        (item.sku ?? '').toLowerCase().includes(keyword)
    )
})

const handleSearch = () => {
    // 搜索时自动进行过滤，computed会自动响应
}

const batchOptions = computed(() => {
    return tableImportStore.list.map((batch: any) => ({
        label: `批次：${batch.id}`,
        value: batch.id,
    }))
})

const handleBatchChange = (value: number | undefined) => {
    selectedBatchId.value = value
}

const openEditModal = (item: AccPurchaseContractType) => {
    editingItem.value = item
    editForm.value = {
        washStatus: item.washStatus,
        washExpressNo: item.washExpressNo || '',
        tagStatus: item.tagStatus,
        tagExpressNo: item.tagExpressNo || '',
        remark: item.remark || '',
    }
    editModalOpen.value = true
}

const handleEditSave = async () => {
    if (!editingItem.value) return
    
    try {
        const updatedItem: any = { ...editingItem.value }
        
        // 如果填了洗标快递单号，则状态自动设置为已出货
        if (editForm.value.washExpressNo.trim()) {
            updatedItem.washStatus = 3
        } else {
            updatedItem.washStatus = editForm.value.washStatus
        }
        updatedItem.washExpressNo = editForm.value.washExpressNo
        
        // 如果填了吊牌快递单号，则状态自动设置为已出货
        if (editForm.value.tagExpressNo.trim()) {
            updatedItem.tagStatus = 3
        } else {
            updatedItem.tagStatus = editForm.value.tagStatus
        }
        updatedItem.tagExpressNo = editForm.value.tagExpressNo
        
        // 保存备注
        updatedItem.remark = editForm.value.remark
        
        // 调用店铺更新接口
        await store.update(updatedItem)
        
        // 刷新数据
        await store.fetchPage()
        
        editModalOpen.value = false
        
        // 更新selectedItem以反映最新数据
        if (selectedItem.value && selectedItem.value.id === editingItem.value.id) {
            selectedItem.value = updatedItem
        }
    } catch (error) {
        console.error('编辑失败', error)
    }
}

const handleEditCancel = () => {
    editModalOpen.value = false
    editingItem.value = null
}

// 获取状态标签
const getStatusLabel = (status: number | undefined) => {
    switch (status) {
        case 0: return '未下单'
        case 1: return '做货中'
        case 2: return '货好等付款'
        case 3: return '已出货'
        default: return '-'
    }
}

// 监听props变化或初始化
watch(
    () => store.pagedList,
    () => {
        // 数据变化时重新渲染列表
    },
    { deep: true }
)
</script>

<style scoped>
.as-mobile-table {
    padding: 16px;
}

.batch-section {
    margin-bottom: 12px;
}

.search-section {
    margin-bottom: 16px;
}

.list-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.list-item {
    background: white;
    border: 1px solid #f0f0f0;
    border-radius: 8px;
    padding: 12px;
    padding-bottom: 50px;
    cursor: pointer;
    transition: all 0.3s;
    position: relative;
}

.list-item:active {
    background: #fafafa;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}

.sku {
    font-weight: 500;
    font-size: 16px;
    color: #333;
    flex: 1;
}

.status-badges {
    display: flex;
    gap: 4px;
    flex-shrink: 0;
    align-items: center;
}

.item-info {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    font-size: 12px;
    color: #666;
    margin-bottom: 8px;
}

.info-item {
    flex: 0 1 calc(50% - 6px);
}

.status-info {
    display: flex;
    gap: 8px;
}

.edit-button {
    position: absolute;
    bottom: 12px;
    right: 12px;
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
</style>
