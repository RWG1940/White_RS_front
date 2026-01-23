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
      :show-search="false"
      :is-bordered="false"
      v-model:total="store.total"
      v-model:currentPage="store.currentPage"
      v-model:pageSize="store.pageSize"
      @add="store.create({ name: `新角色-${generateName()}`, status: 1, code: generateName() })"
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
import { onMounted } from 'vue'
import type { TableColumnType } from 'ant-design-vue'
import ManagePage from '@/components/ManagePage.vue'
import { roleStore } from '@/stores/role-store'
import { formatTime } from '@/utils/formatTime'
import { generateName } from '@/utils/randomStr'
// 角色数据存储
const store = roleStore

// 表格列
const columns: TableColumnType<any>[] = [
  { title: '角色名', dataIndex: 'name', width: '180px' },
  { title: '角色编码', dataIndex: 'code', width: '120px' },
  { title: '角色描述', dataIndex: 'description', width: '180px' },
  { title: '状态', dataIndex: 'status', width: '160px' },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    width: '220px',
    customRender: ({ text }) => formatTime(text),
  },
]
// 可编辑字段
const editableFields = ['name', 'code', 'description', 'status']

// 获取数据
onMounted(async () => {
  await store.fetchPage()
})
</script>

<style scoped></style>
