<template>
  <a-modal
    title="客户管理"
    :open="guestTableVisible"
    width="1200px"
    :footer="null"
    @cancel="handleClose"
  >
    <ManagePage
      row-key="id"
      v-show="iscard"
      v-model:data-source="store.pagedList as any[]"
      :columns="columns"
      :editable-fields="editableFields"
      :is-bordered="false"
      :show-operation="true"
      :show-add="true"
      :show-batch-delete="true"
      :search-select-options="store.searchSelectOptions"
      v-model:total="store.total"
      v-model:currentPage="store.currentPage"
      v-model:pageSize="store.pageSize"
      search-placeholder="搜索角色"
      @search="store.handleSearch"
      @add="store.create({ status: 1, name: '新客户' + generateName() })"
      @save="store.update"
      @row-delete="store.handleRowDelete"
      @batch-delete="store.removeSelectedN"
      @selection-change="store.onSelectionChange"
      @update:currentPage="store.pageChange"
      @update:pageSize="store.pageSizeChange"
    >
      <template #custom-tool>
        <a-button type="primary" :disabled="store.selectedIds.length !== 1" @click="handleSetBatch"
          >设置批次关联</a-button
        >
      </template>
      <template #cell-name="{ record, isEditing, editableData, getInternalKey }">
        <template v-if="!isEditing">
          <a-tag color="geekblue" >{{ record.name }}</a-tag>
        </template>
        <template v-else>
          <a-input
            v-model:value="editableData[getInternalKey(record)]!.phone"
            size="small"
          />
        </template>
        </template>
      <template #cell-status="{ record, isEditing, editableData, getInternalKey }">
        <template v-if="!isEditing">
          <a-tag :color="record.status === 1 ? 'success' : 'red'">
            {{ record.status === 1 ? '启用' : '停用' }}
          </a-tag>
        </template>
        <template v-else>
          <a-select
            v-model:value="editableData[getInternalKey(record)]!.status"
            size="small"
          >
            <a-select-option :value="1">启用</a-select-option>
            <a-select-option :value="0">停用</a-select-option>
          </a-select>
        </template>
      </template>
    </ManagePage>
    <div v-show="!iscard">
      <a-button @click="handleBack" style="margin-bottom: 10px">返回</a-button>
      <GuestImportIdSetCard :guest-id="selectedGuestId" />
    </div>
  </a-modal>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { TableColumnType } from 'ant-design-vue'
import ManagePage from '@/components/ManagePage.vue'
import { guestStore } from '@/stores/guest-store'
import { formatTime } from '@/utils/formatTime'
import GuestImportIdSetCard from './GuestImportIdSetCard.vue'
import { generateName } from '@/utils/randomStr'

const guestTableVisible = ref(false)
const iscard = ref(true)
const selectedGuestId = ref<number | null>(null)
const store = guestStore

// 表格列
const columns: TableColumnType<any>[] = [
  { title: '客户名', dataIndex: 'name', width: '100px' },
  { title: '电话', dataIndex: 'phone', width: '120px' },
  { title: '地址', dataIndex: 'address', width: '120px' },
  { title: '邮箱', dataIndex: 'email', width: '120px' },
  { title: '描述', dataIndex: 'description', width: '150px' },
  { title: '状态', dataIndex: 'status', width: '70px' },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    width: '140px',
    customRender: ({ text }) => formatTime(text),
  },
  {
    title: '更新时间',
    dataIndex: 'updatedAt',
    width: '140px',
    customRender: ({ text }) => formatTime(text),
  },
]

// 可编辑字段
const editableFields = ['name', 'phone', 'address', 'email', 'description']

// 设置批次关联
const handleSetBatch = () => {
  if (store.selectedIds.length === 1) {
    selectedGuestId.value = store.selectedIds[0] as number
    iscard.value = false
  }
}

// 返回按钮
const handleBack = () => {
  iscard.value = true
  selectedGuestId.value = null
}

// 监听弹窗关闭，重置状态
const handleClose = () => {
  guestTableVisible.value = false
  selectedGuestId.value = null
  // 重置store状态，清除多选等数据
  store.reset()
  // 重新获取数据，确保下次打开时数据是最新的
  store.fetchPage()
  store.fetchAll()
  iscard.value = true
}
// 获取数据
onMounted(async () => {
  await store.fetchPage()
})
</script>

<style scoped></style>
