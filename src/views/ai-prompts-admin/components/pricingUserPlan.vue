<template>
  <div class="pricing-user-plans">
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
      @add="store.create({ status: 1 })"
      @save="store.update"
      @row-delete="store.handleRowDelete"
      @batch-delete="handleBatchDelete"
      @selection-change="handleSelectionChange"
      @update:currentPage="store.pageChange"
      @update:pageSize="store.pageSizeChange"
    >
      <template #cell-status="{ record, isEditing, editableData, getInternalKey }">
        <template v-if="!isEditing">
          <a-tag :color="record.status == 0 ? 'grey' : 'green'">
            {{ record.status == 0 ? '无效' : '有效' }}
          </a-tag>
        </template>
        <template v-else>
          <a-select v-model:value="editableData[getInternalKey(record)]!.status" size="small">
            <a-select-option :value="0">无效</a-select-option>
            <a-select-option :value="1">有效</a-select-option>
          </a-select>
        </template>
      </template>

      <template #cell-sTime="{ record, isEditing, editableData, getInternalKey }">
        <template v-if="isEditing">
          <a-date-picker
            show-time
            style="width: 100%"
            placeholder="Select Time"
            :value="
              editableData[getInternalKey(record)]!.sTime
                ? dayjs(editableData[getInternalKey(record)]!.sTime)
                : null
            "
            @change="
              (val: any) =>
                (editableData[getInternalKey(record)]!.sTime = val ? val.toISOString() : null)
            "
            @ok="
              (val: any) =>
                (editableData[getInternalKey(record)]!.sTime = val ? val.toISOString() : null)
            "
          />
        </template>
      </template>

      <template #cell-eTime="{ record, isEditing, editableData, getInternalKey }">
        <template v-if="isEditing">
          <a-date-picker
            show-time
            style="width: 100%"
            placeholder="Select Time"
            :value="
              editableData[getInternalKey(record)]!.eTime
                ? dayjs(editableData[getInternalKey(record)]!.eTime)
                : null
            "
            @change="
              (val: any) =>
                (editableData[getInternalKey(record)]!.eTime = val ? val.toISOString() : null)
            "
            @ok="
              (val: any) =>
                (editableData[getInternalKey(record)]!.eTime = val ? val.toISOString() : null)
            "
          />
        </template>
      </template>
      <template #custom-tool>
        <a-button class="edit-btn" @click="handleEditClick" :disabled="isEditButtonDisabled"
          >编辑</a-button
        >
        <a-button
          class="approve-btn"
          @click="handleApproveClick"
          :disabled="isApproveButtonDisabled"
          >核准交易</a-button
        >
        
      </template>
    </ManagePage>

    <!-- 编辑弹窗 模态框 -->
    <a-modal
      v-model:open="openEditModal"
      title="编辑用户订阅方案"
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
            <a-select-option :value="0">无效</a-select-option>
            <a-select-option :value="1">有效</a-select-option>
          </a-select>

          <!-- 时间字段 -->
          <a-date-picker
            v-else-if="field === 'sTime' || field === 'eTime'"
            show-time
            style="width: 100%"
            :placeholder="`选择${columns.find((col: any) => col.dataIndex === field)?.title}`"
            :value="editForm[field] ? dayjs(editForm[field]) : null"
            @change="(val: any) => (editForm[field] = val ? val.toISOString() : null)"
            @ok="(val: any) => (editForm[field] = val ? val.toISOString() : null)"
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
import { aiUserPlanStore, columns, editableFields } from '@/stores/aiUserPlan-store'
import { userRoleStore } from '@/stores/userRole-store'
import { watch, ref, onMounted, reactive, computed } from 'vue'
import dayjs from 'dayjs'
import { message } from 'ant-design-vue'
import { userStore } from '@/stores/user-store'

const store = aiUserPlanStore

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

// 核准交易按钮是否禁用
const isApproveButtonDisabled = computed(() => {
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

// 处理核准交易按钮点击
const handleApproveClick = async () => {
  if (selectedRow.value) {
    try {
      // 更新状态为有效
      await store.updateN({
        ...selectedRow.value,
        status: 1,
      })

      // 更新用户的角色，如果套餐名称为小杯可乐则用户角色code变为1234、如果套餐名称为中杯可乐则用户角色code变为1235，如果套餐名称为大杯可乐则用户角色code变为1236
      await updateUserRoleByPlan(selectedRow.value)

      message.success('交易已核准')
      await store.fetchPage()
    } catch (e) {
      console.error('核准交易失败', e)
      message.error('核准交易失败')
    }
  }
}

// 根据套餐名称更新用户角色
const updateUserRoleByPlan = async (userPlan: any) => {
  if (!userPlan.userName) {
    console.warn('用户订阅方案缺少用户名信息')
    return
  }

  // 根据套餐名称映射角色ID
  const planRoleMap: Record<string, number> = {
    小杯可乐: 10,
    中杯可乐: 11,
    大杯可乐: 12,
  }

  const roleId = planRoleMap[userPlan.planName || '']

  if (!roleId) {
    console.warn(`未找到套餐名称 ${userPlan.planName} 对应的角色ID`)
    return
  }


  try {
    message.info(`用户 ${userPlan.userId} 角色已更新为 ID: ${roleId}`)
    console.log(userPlan)
    // 先获取记录的主键
    userRoleStore.exactData = {
      user_id: userPlan.userId,
    }
      await userRoleStore.exact()
    const user = userRoleStore.searchResults[0] as any
    console.log(user)
  console.log(roleId)
    await userRoleStore.update({
      id: user.id,
      roleId: roleId,
    })

    console.log(`用户 ${userPlan.userName} 角色已更新为 ID: ${roleId}`)
  } catch (error) {
    console.error('更新用户角色失败:', error)
    throw error
  }
}

// 批量删除
const handleBatchDelete = async ({ keys }: { keys: (string | number)[] }) => {
  try {
    const ids = keys.map((k) => Number(k))
    await store.remove(ids)
  } catch (e) {
    console.error('批量删除失败', e)
  }
}

onMounted(async () => {
  await store.fetchPage()
})
</script>

<style scoped>
.pricing-user-plans {
  padding: 16px;
}

.edit-btn {
  margin-left: 8px;
}

.approve-btn {
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
