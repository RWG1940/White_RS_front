<template>
  <div class="pricing-plans">
    <ManagePage
      v-model:data-source="store.pagedList as any[]"
      :columns="columns"
      :editable-fields="editableFields"
      row-key="id"
      :show-operation="true"
      :show-add="true"
      :show-batch-delete="true"
      :is-bordered="false"
      :search-select-options="store.searchSelectOptions"
      v-model:total="store.total"
      v-model:currentPage="store.currentPage"
      v-model:pageSize="store.pageSize"
      search-placeholder="搜索"
      @search="store.handleSearch"
      @add="store.create({ status: 1, name: '新订阅' + generateName() })"
      @save="store.update"
      @row-delete="store.handleRowDelete"
      @batch-delete="store.removeSelected"
      @selection-change="handleSelectionChange"
      @update:currentPage="store.pageChange"
      @update:pageSize="store.pageSizeChange"
    >
      <template #cell-status="{ record, isEditing, editableData, getInternalKey }">
        <template v-if="!isEditing">
          <a-tag :color="record.status == 0 ? 'red' : record.status == 1 ? 'green' : 'pink'">
            {{ record.status == 0 ? '禁用' : record.status == 1 ? '启用' : '缺货' }}
          </a-tag>
        </template>
        <template v-else>
          <a-select v-model:value="editableData[getInternalKey(record)]!.status" size="small">
            <a-select-option :value="0">禁用</a-select-option>
            <a-select-option :value="1">启用</a-select-option>
          </a-select>
        </template>
      </template>
      <template #cell-description="{ record, isEditing }">
        <template v-if="!isEditing">
          <div v-html="record.description"></div>
        </template>
        <template v-else>
          <a-textarea
            v-model:value="record.description"
            @update:value="(val: any) => (record.description = val)"
            :rows="8"
          />
        </template>
      </template>
      <template #custom-tool>
        <a-button class="edit-btn" @click="handleEditClick" :disabled="isEditButtonDisabled"
          >编辑</a-button
        >
      </template>
    </ManagePage>

    <!-- 编辑弹窗 模态框 -->
    <a-modal
      v-model:open="openEditModal"
      title="编辑订阅方案"
      ok-text="确认"
      cancel-text="取消"
      @ok="handleEditSave"
      @cancel="handleEditCancelBtn"
      :confirmLoading="editUploadLoading"
    >
      <!-- 编辑弹窗中动态生成表单项 -->
      <a-form layout="vertical" class="edit-modal-form">
        <a-form-item
          v-for="field in editableFields"
          :key="field"
          :label="columns.find((col: any) => col.dataIndex === field)?.title"
        >
          <!-- 状态字段 -->
          <a-select
            v-if="field === 'status'"
            :value="editForm[field]"
            @update:value="(val: any) => (editForm[field] = val)"
            class="status-select"
          >
            <a-select-option :value="0">禁用</a-select-option>
            <a-select-option :value="1">启用</a-select-option>
          </a-select>

          <!-- 描述字段使用大文本输入框 -->
          <a-textarea
            v-else-if="field === 'description'"
            :value="editForm[field]"
            @update:value="(val: any) => (editForm[field] = val)"
            :rows="5"
            placeholder="请输入描述信息"
          />

          <!-- 普通输入 -->
          <a-input
            v-else
            :value="editForm[field]"
            @update:value="(val: any) => (editForm[field] = val)"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import ManagePage from '@/components/ManagePage.vue'
import { aiPlansStore, columns, editableFields } from '@/stores/aiPlans-store'
import { generateName } from '@/utils/randomStr'
import { ref, onMounted, reactive, computed } from 'vue'
import { message } from 'ant-design-vue'

const store = aiPlansStore

// 编辑表单
const editForm = reactive<Record<string, any>>({})
// 编辑弹窗打开状态
const openEditModal = ref(false)
const editUploadLoading = ref(false)

// 选择的行数据
const selectedRow = ref<any>()
const selectedRows = ref<any[]>([])

// 编辑按钮是否禁用
const isEditButtonDisabled = computed(() => {
  return !selectedRow.value || (Array.isArray(selectedRow.value) && selectedRow.value.length !== 1)
})

// 处理选择变化
const handleSelectionChange = ({ rows }: { keys: (string | number)[]; rows: any[] }) => {
  selectedRows.value = rows
  selectedRow.value = rows.length === 1 ? rows[0] : null
}

// 处理编辑按钮点击
const handleEditClick = () => {
  if (selectedRow.value) {
    Object.keys(editForm).forEach((k) => delete editForm[k])
    Object.assign(editForm, selectedRow.value)
    openEditModal.value = true
  }
}

// 保存编辑弹窗的保存逻辑
const handleEditSave = async () => {
  try {
    editUploadLoading.value = true
    await store.updateN(editForm)
    openEditModal.value = false
    await store.fetchPage()
    // 重置表单
    Object.keys(editForm).forEach((k) => delete editForm[k])
  } catch (e) {
  } finally {
    editUploadLoading.value = false
  }
}

// 取消编辑弹窗
const handleEditCancelBtn = () => {
  openEditModal.value = false
  // 重置表单
  Object.keys(editForm).forEach((k) => delete editForm[k])
}

onMounted(async () => {
  await store.fetchPage()
})
</script>

<style scoped>
.pricing-plans {
  padding: 16px;
}

.edit-btn {
  margin-left: 8px;
}

/* 编辑弹窗样式 */
.edit-modal-form {
  height: 400px;
  overflow-y: auto;
}

.status-select {
  width: 120px;
}
</style>
