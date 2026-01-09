<template>
    <div>
         <a-alert message="使用说明" description="选择该客人所对应的批次数据，可以是多个，这决定了你在优鼎工作台的客人选项卡中能显示哪些批次的数据。" type="info" show-icon
                style="margin-bottom: 16px" />
        <!-- 添加批次区域 -->
        <div style="margin-bottom: 16px;">
            <a-select
                v-model:value="selectedBatchIds"
                mode="multiple"
                placeholder="选择批次"
                style="width: 300px; margin-right: 8px;"
                :options="allBatches"
                :field-names="{ label: 'name', value: 'id' }"
            />
            <a-button type="primary" @click="handleAddBatch" :disabled="selectedBatchIds.length === 0">
                添加批次
            </a-button>
        </div>

        <!-- 已关联批次显示区域 -->
        <div v-if="loading" style="text-align: center; padding: 20px;">
            <a-spin size="large" />
        </div>
        <div v-else>
            <div v-if="batchList.length === 0" style="text-align: center; padding: 20px; color: #999;">
                该客户暂无批次数据
            </div>
            <div v-else>
                <a-tag 
                    v-for="batch in batchList" 
                    :key="batch.id"
                    closable 
                    @close="handleDeleteBatch(batch.id!)"
                    style="margin: 4px;"
                >
                    {{`批次 ${batch.importId}` }}
                </a-tag>
            </div>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { ref, watch, onMounted } from 'vue';
import { guestTableImportStore } from '@/stores/guestTableImport-store';
import type { GuestTableImportType } from '@/types/guestTableImport-type';
import { tableImportStore } from '@/stores/tableImport-store';
import type { tableImportType } from '@/types/tableImport-type';

interface Props {
  guestId?: number | null;
}

const props = withDefaults(defineProps<Props>(), {
  guestId: null
});

const store = guestTableImportStore;
const tableStore = tableImportStore;
const batchList = ref<GuestTableImportType[]>([]);
const allBatches = ref<tableImportType[]>([]);
const selectedBatchIds = ref<number[]>([]);
const loading = ref(false);
const batchLoading = ref(false);

// 获取所有批次数据
const fetchAllBatches = async () => {
  try {
    batchLoading.value = true;
    await tableStore.fetchAll();
    allBatches.value = tableStore.list as tableImportType[];
  } catch (error) {
    console.error('获取所有批次数据失败:', error);
    allBatches.value = [];
  } finally {
    batchLoading.value = false;
  }
};

// 获取客户关联的批次数据
const fetchBatchData = async () => {
  if (!props.guestId) {
    batchList.value = [];
    return;
  }
  
  try {
    loading.value = true;
    // 使用exact方法根据客户ID获取批次数据
    await store.exact({ column:'guest_id',keyword: props.guestId } as any);
    batchList.value = store.searchResults as GuestTableImportType[];
  } catch (error) {
    console.error('获取批次数据失败:', error);
    batchList.value = [];
  } finally {
    loading.value = false;
  }
};

// 添加批次关联
const handleAddBatch = async () => {
  if (!props.guestId || selectedBatchIds.value.length === 0) {
    return;
  }
  
  try {
    loading.value = true;
    
    // 为每个选中的批次创建关联记录
    const createPromises = selectedBatchIds.value.map(batchId => {
      const payload = {
        guestId: props.guestId,
        importId: batchId
      };
      return store.create(payload as any);
    });
    
    await Promise.all(createPromises);
    
    // 清空选择
    selectedBatchIds.value = [];
    
    // 重新获取数据
    await fetchBatchData();
  } catch (error) {
    console.error('添加批次关联失败:', error);
  } finally {
    loading.value = false;
  }
};

// 删除批次
const handleDeleteBatch = async (batchId: number) => {
  try {
    await store.remove([batchId]);
    // 重新获取数据
    await fetchBatchData();
  } catch (error) {
    console.error('删除批次失败:', error);
  }
};

// 监听客户ID变化
watch(() => props.guestId, (newGuestId) => {
  fetchBatchData();
}, { immediate: true });

// 组件挂载时获取所有批次数据
onMounted(() => {
  fetchAllBatches();
});
</script>
<style scoped></style>