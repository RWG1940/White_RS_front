<template>
  <div class="prompts-control-card">
    <div class="header">
      <div class="back-button" @click="$emit('back')">
        <LeftOutlined />返回
      </div>
      <span class="title">{{ category }}设置</span>
    </div>
    <div class="content">
      <ManagePage
        v-model:data-source="store.pagedList as any[]"
        :columns="columns"
        :editable-fields="editableFields"
        row-key="id"
        :show-operation="true"
        :show-add="true"
        :show-batch-delete="true"
        :is-bordered="false"
        :search-select-options="searchOptions"
        v-model:total="store.total"
        v-model:currentPage="store.currentPage"
        v-model:pageSize="store.pageSize"
        search-placeholder="搜索"
        @search="handleSearch"
        @add="handleAddPrompt"
        @save="handleUpdate"
        @row-delete="handleRemove"
        @batch-delete="handleRemoveSelected"
        @selection-change="store.onSelectionChange"
        @update:currentPage="handlePageChange"
        @update:pageSize="handlePageSizeChange"
      >
      </ManagePage>
    </div>
  </div>
</template>

<script lang="ts" setup>
import ManagePage from '@/components/ManagePage.vue'
import { aiPromptsStore, columns, editableFields, searchOptions } from '@/stores/aiPrompts-store'
import { generateName } from '@/utils/randomStr'
import { watch, ref,onMounted } from 'vue'
import { LeftOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

const store = aiPromptsStore
const props = defineProps<{
  category: string
}>()

const emit = defineEmits<{
  back: []
}>()


// 新增提示词
const handleAddPrompt = async () => {
  await store.createN({ label: `新提示词-${generateName()}`, category: props.category })
  store.conditionsData = { category: props.category }
  store.fetchPageByConditions()
}
// 更新提示词
const handleUpdate = async (row: any) => {
  await store.updateN(row)
  store.conditionsData = { category: props.category }
  store.fetchPageByConditions()
}
// 删除提示词
const handleRemove = async (row: any) => {
  await store.handleRowDeleteN(row)
  store.conditionsData = { category: props.category }
  store.fetchPageByConditions()
}
// 批量删除
const handleRemoveSelected = async () => {
  await store.removeSelectedN()
  store.conditionsData = { category: props.category }
  store.fetchPageByConditions()
}
// 搜索
const handleSearch = async (payload: Record<string, string>) => {
  const searchConditions = {
    ...payload,
    category: props.category,
  }
  await store.handleSearch(searchConditions)
}

// 分页
const handlePageChange = (val: number) => {
  store.currentPage = val
  store.conditionsData = { category: props.category }
  store.fetchPageByConditions()
}
const handlePageSizeChange = (val: number) => {
  store.pageSize = val
  store.conditionsData = { category: props.category }
  store.fetchPageByConditions()
}
// 监听 category 变化、
watch(
  () => props.category,
  async (newCategory) => {
    // 重新加载当前分类数据
    aiPromptsStore.conditionsData = { category: newCategory }
    await aiPromptsStore.fetchPageByConditions()
  },
)
onMounted(async () => {
  // 初始加载当前分类数据
  aiPromptsStore.conditionsData = { category: props.category }
  await aiPromptsStore.fetchPageByConditions()
})
</script>

<style scoped>
.prompts-control-card {
  padding: 16px;
}

.header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.back-button {
  cursor: pointer;
  font-size: 12px;
  background-color: #e8e8e8;
  border-radius: 10px;
  padding: 5px 10px;
  display: flex;
  align-items: center;
  gap: 4px;
  transition-duration: 0.2s;
}

.back-button:hover {
  background-color: #252525;
  color: white;
}

.title {
  font-weight: 600;
  font-size: 16px;
}
</style>
