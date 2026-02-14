<template>
  <div class="generate">
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
      @add="store.create({ status: 1, name: '新记录' + generateName() })"
      @save="store.update"
      @row-delete="store.handleRowDelete"
      @batch-delete="store.removeSelected"
      @selection-change="store.onSelectionChange"
      @update:currentPage="store.pageChange"
      @update:pageSize="store.pageSizeChange"
    >


    </ManagePage>

    
  </div>
</template>

<script lang="ts" setup>
import ManagePage from '@/components/ManagePage.vue'
import { generateRecordStore, columns, editableFields } from '@/stores/generateRecord-store'
import { generateName } from '@/utils/randomStr'
import { ref, onMounted, reactive, computed } from 'vue'

const store = generateRecordStore




onMounted(async () => {
  await store.fetchPage()
})
</script>

<style scoped>
.generate {
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
