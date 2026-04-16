<template>
  <Modal
    v-model:visible="visible"
    title="所有辅料数据管理"
    :closeOnClickOverlay="false"
    :show-footer="false"
    @close="handleClose"
  >
    <ManagePage
      v-model:data-source="dataSource"
      row-key="id"
      :columns="columns"
      :editable-fields="editableFields"
      :show-operation="true"
      :show-add="true"
      :show-batch-delete="true"
      :isBordered="false"
      search-placeholder="搜索辅料信息"
      v-model:total="accStore.total"
      v-model:currentPage="accStore.currentPage"
      v-model:pageSize="accStore.pageSize"
      v-model:loading="accStore.loading"
      @search="accStore.handleSearch"
      @row-delete="accStore.handleRowDelete"
      @batch-delete="accStore.removeSelected"
      @selection-change="accStore.onSelectionChange"
      @update:currentPage="accStore.pageChange"
      @update:pageSize="accStore.pageSizeChange"
    >

    </ManagePage>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Modal from '@/components/Modal.vue'
import ManagePage from '@/components/ManagePage.vue'
import { accStore } from '@/stores/acc-store'
import type { AsPayInfoType } from '@/types/asPayInfo-type'
import { formatTime } from '@/utils/formatTime'

// 弹窗状态
const visible = defineModel<boolean>('visible', { default: false })

// 数据源
const dataSource = computed(() => accStore.pagedList as any[])

const columns = computed(() => {
  return [
    {
      title: '序号',
      dataIndex: '__index__',
      width: '60px',
      fixed: true,
    },
    { title: '货号', dataIndex: 'sku', width: '125px' },
    { title: '颜色', dataIndex: 'color', width: '80px' },
    { title: '品牌', dataIndex: 'brand', width: '100px' },
    { title: '洗标颜色', dataIndex: 'washLabelColor', width: '75px' },
    { title: '洗标种类', dataIndex: 'washLabelType', width: '100px' },
    { title: '绳子吊粒', dataIndex: 'threadPellets', width: '75px' },
    {
      title: '工厂',
      dataIndex: 'factory',
      width: '95px',
    },
    { title: '地址', dataIndex: 'address', width: '110px' },
    {
      title: '跟单',
      dataIndex: 'follower',
      width: '80px',
    },
    { title: '洗标数量', dataIndex: 'quantity', width: '75px' },
    { title: '洗标实际出货数量', dataIndex: 'washShipQuantity', width: '130px' },
    { title: '吊牌数量', dataIndex: 'tagQuantity', width: '75px' },
    { title: '吊牌实际出货数量', dataIndex: 'tagShipQuantity', width: '140px' },
    { title: '洗标单价', dataIndex: 'washUnitPrice', width: '75px' },
    { title: '洗标总价', dataIndex: 'washTotalPrice', width: '75px' },
    { title: '吊牌单价', dataIndex: 'tagUnitPrice', width: '75px' },
    { title: '吊牌总价', dataIndex: 'tagTotalPrice', width: '75px' },
    { title: '洗标优先级', dataIndex: 'washPriority', width: '90px' },
    { title: '洗标状态', dataIndex: 'washStatus', width: '90px' },

    { title: '洗标快递单号', dataIndex: 'washExpressNo', width: '110px' },

    { title: '吊牌优先级', dataIndex: 'tagPriority', width: '90px' },
    { title: '吊牌状态', dataIndex: 'tagStatus', width: '90px' },
    { title: '英文品名', dataIndex: 'nameEn', width: '105px' },
    { title: '大面材料', dataIndex: 'materialMain', width: '120px' },
    { title: '里衬材质', dataIndex: 'materialLining', width: '95px' },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: '140px',
      sorter: (a: any, b: any) =>
        (new Date(a.createdAt ?? '').getTime() || 0) - (new Date(b.createdAt ?? '').getTime() || 0),
      customRender: ({ text }: any) => formatTime(text),
    },
    {
      title: '修改时间',
      dataIndex: 'updatedAt',
      width: '140px',
      sorter: (a: any, b: any) =>
        (new Date(a.updatedAt ?? '').getTime() || 0) - (new Date(b.updatedAt ?? '').getTime() || 0),
      customRender: ({ text }: any) => formatTime(text),
    },
    { title: '备注', dataIndex: 'remark', width: '180px' },
  ]
})

// 允许修改的字段
const editableFields = [
  'washUnitPrice',
  'tagUnitPrice',
  'tagConfirmTime',
  'washConfirmTime',
  'washStatus',
  'washShipQuantity',
  'washShipTime',
  'washExpressNo',
  'tagStatus',
  'tagShipTime',
  'tagShipQuantity',
  'tagExpressNo',
  'remark',
]


// 获取行主键值
const getRowKeyValue = (record: AsPayInfoType) => record.id || ''

// 关闭弹窗
const handleClose = () => {
  visible.value = false
}

// 打开弹窗
const open = () => {
  visible.value = true
}

// 获取表格数据引用
const tableData = ref<AsPayInfoType[]>([])

// 监听accStore数据变化，更新tableData
watch(
  () => accStore.pagedList,
  (list) => {
    tableData.value = list as AsPayInfoType[]
  },
  { immediate: true },
)

// 监听弹窗打开，加载数据
watch(visible, async (val) => {
  if (val) {
    await accStore.fetchPage()
  }
})


// 暴露方法给父组件
defineExpose({
  open,
})
</script>

<style scoped>
.image-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.image-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.image-tip {
  font-size: 12px;
  color: #999;
}

.image-upload-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.image-upload {
  margin-top: 4px;
}

/* 弹窗图片上传样式 */
.modal-image-upload {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.modal-image-container {
  flex: 1;
}

.modal-image-row {
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.modal-image-preview {
  border-radius: 6px;
  overflow: hidden;
  border: 2px solid #f0f0f0;
  transition: border-color 0.3s;
}

.modal-image-preview:hover {
  border-color: #1890ff;
}

.pending-save-text {
  font-size: 12px;
  color: orange;
  font-style: italic;
}

/* 弹窗表单调整 */
:deep(.ant-form-item) {
  margin-bottom: 16px;
}

:deep(.ant-col-24) .ant-form-item {
  margin-bottom: 24px;
}
</style>
