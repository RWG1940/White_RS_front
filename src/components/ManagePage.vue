<template>
  <div class="manage-page-wrapper">
    <div v-if="showToolbar" class="header">
      <slot
        name="toolbar"
        :search-value="searchValue"
        :trigger-search="onSearch"
        :add="handleAdd"
        :batch-delete="handleBatchDelete"
      >
        <a-row :gutter="[8, 8]" align="middle" :class="{ 'mobile-toolbar': isMobile }">
          <a-col v-if="showSearch" :span="isMobile ? 24 : undefined">
            <a-input-search
              v-model:value="searchValue"
              :placeholder="searchPlaceholder"
              enter-button
              @search="onSearch"
            />
          </a-col>
          <a-col v-if="showAdd" :span="isMobile ? 12 : undefined"> 
            <a-button type="primary" block :class="{ 'mobile-button': isMobile }" @click="handleAdd">
              <PlusOutlined />
              <span v-if="isMobile" style="margin-left: 4px">添加</span>
            </a-button>
          </a-col>
          <a-col v-if="showBatchDelete" :span="isMobile ? 12 : undefined">
            <a-button
              type="primary"
              danger
              block
              :class="{ 'mobile-button': isMobile }"
              :disabled="!selectedRowKeys.length"
              @click="handleBatchDelete"
            >
              <DeleteOutlined />
              <span v-if="isMobile" style="margin-left: 4px">删除</span>
            </a-button>
          </a-col>
        </a-row>
      </slot>
    </div>
    <div class="content">
      <a-table
        :columns="mergedColumns"
        :data-source="tableData"
        :row-selection="mergedRowSelection"
        bordered
        :row-key="resolvedRowKey"
        :pagination="paginationConfig"
        :scroll="mergedScroll"
      >
        <template #bodyCell="{ column, text, record }">
          <slot
            v-if="$slots[`cell-${String(column?.dataIndex ?? '')}`]"
            :name="`cell-${String(column?.dataIndex ?? '')}`"
            :column="column"
            :text="text"
            :record="record"
            :is-editing="isEditing(record)"
          />
          <slot
            v-else
            name="bodyCell"
            :column="column"
            :text="text"
            :record="record"
            :is-editing="isEditing(record)"
          >
            <template v-if="isEditing(record) && isEditableColumn(column)">
              <a-input
                v-model:value="editableData[getInternalKey(record)]![column.dataIndex as string]"
                style="margin: -5px 0"
              />
            </template>
            <template v-else-if="isOperationColumn(column)">
              <slot
                name="operation"
                :record="record"
                :is-editing="isEditing(record)"
                :save="save"
                :cancel="cancel"
                :edit="edit"
                :remove="onDeleteRow"
              >
                <div class="editable-row-operations">
                  <span v-if="isEditing(record)">
                    <a-typography-link @click="save(getRowKeyValue(record))"
                      >保存</a-typography-link
                    >
                    <a-popconfirm
                      title="确认取消?"
                      ok-text="是"
                      cancel-text="否"
                      @confirm="cancel(getRowKeyValue(record))"
                    >
                      <a style="margin-left: 8px">取消</a>
                    </a-popconfirm>
                    <a-popconfirm
                      title="确认删除?"
                      ok-text="是"
                      cancel-text="否"
                      @confirm="onDeleteRow(getRowKeyValue(record))"
                    >
                      <a style="margin-left: 8px">删除</a>
                    </a-popconfirm>
                  </span>
                  <span v-else>
                    <a @click="edit(getRowKeyValue(record))">编辑</a>
                  </span>
                </div>
              </slot>
            </template>
            <template v-else>
              {{ text }}
            </template>
          </slot>
        </template>
      </a-table>
    </div>
    <div class="footer">
      <slot name="footer" :selected-rows="selectedRows" :selected-row-keys="selectedRowKeys" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch, onMounted, onUnmounted, type UnwrapRef } from 'vue'
import type { TableColumnType, TableProps } from 'ant-design-vue'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons-vue'

type RecordType = Record<string, any>
const OPERATION_DATA_INDEX = '__operation__'

const cloneDeep = <T,>(value: T): T => JSON.parse(JSON.stringify(value))

const props = withDefaults(
  defineProps<{
    dataSource: RecordType[]
    columns: TableColumnType<RecordType>[]
    editableFields?: string[]
    rowKey?: string
    scroll?: TableProps<RecordType>['scroll']
    rowSelection?: TableProps<RecordType>['rowSelection'] | null
    showToolbar?: boolean
    showSearch?: boolean
    searchPlaceholder?: string
    showAdd?: boolean
    showBatchDelete?: boolean
    pageSize?: number
    pagination?: false | TableProps<RecordType>['pagination']
  }>(),
  {
    dataSource: () => [],
    editableFields: () => [],
    rowKey: 'key',
    scroll: () => ({ x: 600 }),
    rowSelection: undefined,
    showToolbar: true,
    showSearch: true,
    searchPlaceholder: '搜索',
    showAdd: true,
    showBatchDelete: true,
    pageSize: 10,
    pagination: undefined,
  },
)

const emit = defineEmits<{
  (e: 'update:dataSource', value: RecordType[]): void
  (e: 'search', value: string): void
  (e: 'add'): void
  (e: 'batch-delete', payload: { keys: (string | number)[]; rows: RecordType[] }): void
  (e: 'row-delete', key: string | number): void
  (e: 'selection-change', payload: { keys: (string | number)[]; rows: RecordType[] }): void
  (e: 'save', record: RecordType): void
  (e: 'cancel', key: string | number): void
  (e: 'edit', record: RecordType): void
}>()

const searchValue = ref('')
const resolvedRowKey = computed(() => props.rowKey ?? 'key')
const tableData = ref<RecordType[]>([])
const editableData: UnwrapRef<Record<string, RecordType>> = reactive({})
const selectedRowKeys = ref<(string | number)[]>([])
const selectedRows = ref<RecordType[]>([])
const windowSize = ref({ width: 0, height: 0 })
const isMobile = ref(false)

// 检测是否为移动端
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

// 监听窗口大小变化
const updateWindowSize = () => {
  windowSize.value = {
    width: window.innerWidth,
    height: window.innerHeight,
  }
  checkMobile()
}

onMounted(() => {
  updateWindowSize()
  checkMobile()
  window.addEventListener('resize', updateWindowSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateWindowSize)
})

watch(
  () => props.dataSource,
  (value) => {
    tableData.value = cloneDeep(value)
  },
  { immediate: true, deep: true },
)

watch(
  () => tableData.value,
  () => {
    const keys = new Set(tableData.value.map((item) => String(getRowKeyValue(item))))
    selectedRowKeys.value = selectedRowKeys.value.filter((key) => keys.has(String(key)))
    selectedRows.value = selectedRows.value.filter((row) =>
      selectedRowKeys.value.includes(getRowKeyValue(row)),
    )
  },
)

const mergedColumns = computed(() => {
  const hasOperation = props.columns.some((column) => column.dataIndex === OPERATION_DATA_INDEX)
  if (hasOperation) {
    return props.columns
  }
  return [
    ...props.columns,
    {
      title: '操作',
      dataIndex: OPERATION_DATA_INDEX,
      fixed: 'right',
      width: '100px',
    },
  ]
})

const mergedRowSelection = computed(() => {
  if (props.rowSelection === null) {
    return undefined
  }
  if (props.rowSelection) {
    return props.rowSelection
  }
  return {
    selectedRowKeys: selectedRowKeys.value,
    onChange: (keys: (string | number)[], rows: RecordType[]) => {
      selectedRowKeys.value = keys
      selectedRows.value = rows
      emit('selection-change', { keys, rows })
    },
  }
})

const editableFieldSet = computed(() => new Set(props.editableFields))
const paginationConfig = computed(() => {
  if (props.pagination === false) {
    return false
  }
  if (props.pagination) {
    return props.pagination
  }
  return {
    pageSize: props.pageSize,
    showSizeChanger: false,
  }
})

// 计算表格滚动区域大小
const mergedScroll = computed(() => {
  const baseScroll = props.scroll || {}
  
  if (isMobile.value) {
    // 移动端计算
    // Y 轴：视口高度 - header(64px) - 工具栏高度(约60px) - 分页器高度(约56px) - 额外边距(约100px)
    const scrollY = windowSize.value.height > 0
      ? windowSize.value.height - 64 - (props.showToolbar ? 60 : 0) - (paginationConfig.value ? 56 : 0) - 198
      : 250
    
    // X 轴：移动端侧边栏隐藏，使用全宽减去边距
    const scrollX = windowSize.value.width > 0
      ? windowSize.value.width - 20
      : 300
    
    return {
      ...baseScroll,
      x: baseScroll.x ?? scrollX,
      y: baseScroll.y ?? scrollY,
    }
  }
  
  // 桌面端计算
  // Y 轴：视口高度 - header(64px) - 工具栏高度(约60px) - 分页器高度(约56px) - 边距(约140px)
  const scrollY = windowSize.value.height > 0
    ? windowSize.value.height - 64 - (props.showToolbar ? 60 : 0) - (paginationConfig.value ? 56 : 0) - 140
    : 390
  
  // X 轴：视口宽度 - 侧边栏宽度(200px) - 边距(约40px)
  const scrollX = windowSize.value.width > 0
    ? windowSize.value.width - 200 - 40
    : 600
  
  return {
    ...baseScroll,
    x: baseScroll.x ?? scrollX,
    y: baseScroll.y ?? scrollY,
  }
})

const updateParent = () => {
  emit('update:dataSource', cloneDeep(tableData.value))
}

const getRowKeyValue = (record: RecordType): string | number => {
  const keyField = resolvedRowKey.value
  if (record[keyField] !== undefined) {
    return record[keyField]
  }
  return record.key ?? ''
}

const getInternalKey = (recordOrKey: RecordType | string | number): string => {
  if (typeof recordOrKey === 'object') {
    return String(getRowKeyValue(recordOrKey))
  }
  return String(recordOrKey)
}

const isEditing = (record: RecordType) => Boolean(editableData[getInternalKey(record)])
const isEditableColumn = (column: TableColumnType<RecordType>) =>
  typeof column.dataIndex === 'string' && editableFieldSet.value.has(column.dataIndex)
const isOperationColumn = (column: TableColumnType<RecordType>) =>
  column.dataIndex === OPERATION_DATA_INDEX

const edit = (key: string | number) => {
  const target = tableData.value.find((item) => getRowKeyValue(item) === key)
  if (!target) return
  editableData[String(key)] = cloneDeep(target)
  emit('edit', cloneDeep(target))
}

const save = (key: string | number) => {
  const target = tableData.value.find((item) => getRowKeyValue(item) === key)
  if (!target) return
  const current = editableData[String(key)]
  if (!current) return
  Object.assign(target, current)
  emit('save', cloneDeep(target))
  delete editableData[String(key)]
  updateParent()
}

const cancel = (key: string | number) => {
  delete editableData[String(key)]
  emit('cancel', key)
}

const onDeleteRow = (key: string | number) => {
  tableData.value = tableData.value.filter((item) => getRowKeyValue(item) !== key)
  delete editableData[String(key)]
  selectedRowKeys.value = selectedRowKeys.value.filter((selectedKey) => selectedKey !== key)
  selectedRows.value = selectedRows.value.filter((row) => getRowKeyValue(row) !== key)
  updateParent()
  emit('row-delete', key)
}

const onSearch = () => {
  emit('search', searchValue.value.trim())
}

const handleAdd = () => {
  emit('add')
}

const handleBatchDelete = () => {
  if (!selectedRowKeys.value.length) {
    return
  }
  const keysToRemove = new Set(selectedRowKeys.value.map((key) => String(key)))
  tableData.value = tableData.value.filter(
    (item) => !keysToRemove.has(String(getRowKeyValue(item))),
  )
  updateParent()
  emit('batch-delete', {
    keys: [...selectedRowKeys.value],
    rows: cloneDeep(selectedRows.value),
  })
  selectedRowKeys.value = []
  selectedRows.value = []
}
</script>

<style scoped>
.header {
  margin-bottom: 10px;
}

.mobile-toolbar {
  margin-bottom: 8px;
}

.mobile-button {
  font-size: 14px;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .header {
    margin-bottom: 8px;
  }

  .content {
    overflow-x: auto;
  }

  .manage-page-wrapper {
    padding: 0;
  }

  .mobile-toolbar :deep(.ant-col) {
    margin-bottom: 8px;
  }
}
</style>
