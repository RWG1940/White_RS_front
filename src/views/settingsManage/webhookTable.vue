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
      :is-bordered="false"
      :search-select-options="searchOptions"
      v-model:total="store.total"
      v-model:currentPage="store.currentPage"
      v-model:pageSize="store.pageSize"
      search-placeholder="搜索webhook"
      @search="store.handleSearch"
      @add="store.create({ name: `新webhook-${generateName()}`, status: 1, code: generateName() })"
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
import { ref, watch, onMounted } from 'vue'
import type { TableColumnType } from 'ant-design-vue'
import ManagePage from '@/components/ManagePage.vue'
import { webhookStore, searchOptions } from '../../stores/webhook-store'
import type { WebhookType } from '@/types/webhook-type'
import { formatTime } from '@/utils/formatTime'
import { generateName } from '@/utils/randomStr'

// 角色数据存储
const store = webhookStore

// 表格列
const columns: TableColumnType<WebhookType>[] = [
  { title: 'ID', dataIndex: 'id', width: '80px' },
  { title: '机器人名称', dataIndex: 'name', width: '180px' },
  { title: '地址', dataIndex: 'url', width: '120px', ellipsis: true },
  { title: '状态', dataIndex: 'status', width: '80px' },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    width: '120px',
    customRender: ({ text }) => formatTime(text),
  },
  {
    title: '更新时间',
    dataIndex: 'updatedAt',
    width: '120px',
    customRender: ({ text }) => formatTime(text),
  },
  { title: '备注', dataIndex: 'remark', width: '120px' },
  { title: '发送次数', dataIndex: 'sendCount', width: '80px' },
  {
    title: '最后发送时间',
    dataIndex: 'lastSendTime',
    width: '120px',
    customRender: ({ text }) => formatTime(text),
  },
]

// 可编辑字段
const editableFields = ['name', 'url', 'status', 'remark']


// 获取数据
onMounted(async () => {
  await store.fetchPage()
})
</script>

<style scoped></style>
