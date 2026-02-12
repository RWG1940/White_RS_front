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
      @batch-delete="store.removeSelected"
      @selection-change="store.onSelectionChange"
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
    </ManagePage>
  </div>
</template>

<script lang="ts" setup>
import ManagePage from '@/components/ManagePage.vue'
import { aiUserPlanStore, columns, editableFields } from '@/stores/aiUserPlan-store'
import { generateName } from '@/utils/randomStr'
import { watch, ref, onMounted } from 'vue'
import dayjs from 'dayjs'

const store = aiUserPlanStore

onMounted(async () => {
  await store.fetchPage()
})
</script>

<style scoped>
.pricing-user-plans {
  padding: 16px;
}
</style>
