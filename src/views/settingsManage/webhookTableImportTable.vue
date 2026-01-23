<template>
  <div>
    <ManagePage
      v-model:data-source="store.pagedList as any[]"
      :columns="columns"
      :editable-fields="editableFields"
      row-key="id"
      :show-operation="true"
      :show-add="true"
      :show-batch-delete="true"
      :search-select-options="searchOptions"
      v-model:total="store.total"
      v-model:currentPage="store.currentPage"
      v-model:pageSize="store.pageSize"
      search-placeholder="搜索批次"
      @search="handleSearch"
      @add="store.create({ webhookId: '', importId: '', remark: '' })"
      @save="store.update"
      @row-delete="store.handleRowDelete"
      @batch-delete="store.removeSelected"
      @selection-change="store.onSelectionChange"
      @update:currentPage="store.pageChange"
      @update:pageSize="store.pageSizeChange"
    >
      <template #cell-status="{ record, isEditing, editableData, getInternalKey }">
        <template v-if="!isEditing">
          <a-tag :color="record.status === 1 ? 'blue' : 'red'">
            {{ record.status === 1 ? '正常' : '停用' }}
          </a-tag>
        </template>
        <template v-else>
          <a-select
            v-model:value="editableData[getInternalKey(record)]!.status"
            size="small"
            style="width: 120px"
          >
            <a-select-option :value="1">正常</a-select-option>
            <a-select-option :value="0">停用</a-select-option>
          </a-select>
        </template>
      </template>
    </ManagePage>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { TableColumnType } from 'ant-design-vue'
import ManagePage from '@/components/ManagePage.vue'
import { webhookTableImportStore, searchOptions } from '../../stores/webhookTableImport-store'
import type { WebhookTableImportType } from '@/types/webhookTableImport-type'

// 角色数据存储
const store = webhookTableImportStore
// 表格列
const columns: TableColumnType<WebhookTableImportType>[] = [
  { title: 'webhook-id', dataIndex: 'webhookId', width: '180px' },
  { title: '批次id', dataIndex: 'importId', width: '120px' },
  { title: '备注', dataIndex: 'remark', width: '120px' },
]

// 可编辑字段
const editableFields = ['webhookId', 'importId', 'remark']

// 搜索
const handleSearch = async (column: string, keyword: string) => {
  store.searchData = {
    column: column.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase(),
    keyword: keyword,
  } as any
  await store.handleSearchByParams()
}

// 获取数据
onMounted(async () => {
  await store.fetchPage()
})
</script>

<style scoped></style>
