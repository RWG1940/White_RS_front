<template>
  <div class="prompts-control-card">
    <div class="header">
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
        @batch-delete="store.removeSelected"
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

const store = aiPromptsStore
const props = defineProps<{
  category: string
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
  await store.removeN(row.id)
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
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.title {
  font-weight: 600;
  font-size: 16px;
}
</style>
