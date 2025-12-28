<template>
    <div class="fa-mobile-table">
        <!-- 批次选择 -->
        <div class="batch-section">
            <a-select
                v-model:value="selectedBatchId"
                :options="batchOptions"
                placeholder="选择批次"
                allow-clear
                @change="handleBatchChange"
                style="width: 100%;"
            />
        </div>

        <!-- 搜索框 -->
        <div class="search-section">
            <a-input-search
                v-model:value="searchValue"
                placeholder="搜索SKU"
                enter-button
                @search="handleSearch"
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
                </div>
                <div class="item-info">
                    <span class="info-item">颜色: {{ item.color }}</span>
                    <span class="info-item">品牌: {{ item.brand }}</span>
                    <span class="info-item">数量: {{ item.quantity }}</span>
                </div>
            </div>
        </div>

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
                    <!-- 图片 -->
                    <div class="detail-item">
                        <div class="detail-label">图片</div>
                        <div class="detail-content">
                            <template v-if="selectedItem.imageUrl">
                                <a-image
                                    :width="100"
                                    :height="100"
                                    :src="getImageUrl(selectedItem.imageUrl)"
                                    style="border-radius: 5px"
                                />
                            </template>
                            <template v-else>
                                <div style="width: 100px; height: 100px; background: #f5f5f5; display: flex; align-items: center; justify-content: center; border-radius: 5px; border: 1px dashed #d9d9d9;">
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
                        <div class="detail-label">洗标出货时间</div>
                        <div class="detail-content">{{ formatTime(selectedItem.washShipTime || '') }}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">洗标快递单号</div>
                        <div class="detail-content">{{ selectedItem.washExpressNo || '-' }}</div>
                    </div>

                    <!-- 吊牌信息 -->
                    <a-divider>吊牌信息</a-divider>
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
                        <div class="detail-label">吊牌出货时间</div>
                        <div class="detail-content">{{ formatTime(selectedItem.tagShipTime || '') }}</div>
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
import { getBackendUrl } from '@/utils/api'
import { useAuthStore } from '@/stores/auth-store'
import { tableImportStore } from '@/stores/tableImport-store'

// 图片URL处理，添加时间戳防止缓存
const getImageUrl = (imageUrl: string) => {
    if (!imageUrl) return ''
    const baseUrl = getBackendUrl()
    const timestamp = Date.now()
    return `${baseUrl}${imageUrl}?t=${timestamp}`
}

const store = accStore
const searchValue = ref('')
const selectedItem = ref<AccPurchaseContractType | null>(null)
const selectedBatchId = ref<number | undefined>(undefined)

// 获取原始数据源
const dataSource = computed(() => {
    if (!store.pagedList) return []
    return store.pagedList as AccPurchaseContractType[]
})

// 过滤数据源 - 与FATable的filteredDataSource逻辑一致
const filteredDataSourceByBatch = computed(() => {
    if (selectedBatchId.value === undefined && useAuthStore().user === null) {
        return dataSource.value
    }
    return dataSource.value.filter(
        row =>
            (selectedBatchId.value === undefined || row.importId === selectedBatchId.value) &&
            row.factory == useAuthStore()?.user?.username
    )
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
.fa-mobile-table {
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
    cursor: pointer;
    transition: all 0.3s;
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
}

.item-info {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    font-size: 12px;
    color: #666;
}

.info-item {
    flex: 0 1 calc(50% - 6px);
}

.detail-section {
    padding-right: 16px;
}

.detail-item {
    display: flex;
    justify-content: space-between;
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
}

:deep(.ant-divider) {
    margin: 16px 0 12px 0;
}
</style>
