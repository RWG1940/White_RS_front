<template>
  <!-- 表格管理页面, 带工具栏、搜索框、添加、删除、编辑功能, 带分页功能 -->
  <div class="manage-page-wrapper">
    <a-spin tip="刷新中" :spinning="spinning" size="large">
      <div v-if="showToolbar" class="header">
        <!-- 工具栏 -->
        <slot name="toolbar" :search-value="searchValue" :trigger-search="onSearch" :add="handleAdd"
          :batch-delete="handleBatchDelete">
          <a-row :gutter="[8, 8]" align="middle" :class="{ 'mobile-toolbar': isMobile }">
            <a-col v-if="showSearch" :span="isMobile ? 24 : undefined">
              <a-input-search v-model:value="searchValue" :placeholder="searchPlaceholder" enter-button
                @search="onSearch" />
            </a-col>
            <a-col v-if="showSearch" :span="isMobile ? 24 : undefined">
              <a-button type="primary" @click="resetSearch">
                <ReloadOutlined />
              </a-button>
            </a-col>
            <a-col v-if="showAdd" :span="isMobile ? 12 : undefined">
              <a-button type="primary" block :class="{ 'mobile-button': isMobile }" @click="handleAdd">
                <PlusOutlined />
                <span v-if="isMobile" style="margin-left: 4px">添加</span>
              </a-button>
            </a-col>
            <a-col v-if="showBatchDelete" :span="isMobile ? 12 : undefined">
              <a-button type="primary" danger block :class="{ 'mobile-button': isMobile }"
                :disabled="!selectedRowKeys.length" @click="handleBatchDelete">
                <DeleteOutlined />
                <span v-if="isMobile" style="margin-left: 4px">删除</span>
              </a-button>
            </a-col>
            <slot name="custom-tool"></slot>
          </a-row>
        </slot>
      </div>
      <!-- 表格  -->
      <div class="content">
        <a-table size="middle" :columns="mergedColumns" :data-source="tableData" :row-selection="mergedRowSelection" bordered
          :row-key="resolvedRowKey" :pagination="paginationConfig" :scroll="mergedScroll">
          <template #bodyCell="{ column, text, record }" >
            <slot v-if="$slots[`cell-${String(column?.dataIndex ?? '')}`]"
              :name="`cell-${String(column?.dataIndex ?? '')}`" :column="column" :text="text" :record="record"
              :is-editing="isEditing(record)" :editable-data="editableData" :get-internal-key="getInternalKey" />
            <slot v-else name="bodyCell" :column="column" :text="text" :record="record" :is-editing="isEditing(record)">
              <template v-if="isEditing(record) && isEditableColumn(column)">
                <a-input v-model:value="editableData[getInternalKey(record)]![column.dataIndex as string]"
                  style="margin: -5px 0" />
              </template>
              <template v-else-if="isOperationColumn(column)">
                <slot name="operation" :record="record" :is-editing="isEditing(record)" :save="save" :cancel="cancel"
                  :edit="edit" :remove="onDeleteRow">
                  <div class="editable-row-operations">
                    <span v-if="isEditing(record)">
                      <a-typography-link @click="save(getRowKeyValue(record))">保存</a-typography-link>

                      <a style="margin-left: 8px" @click="cancel(getRowKeyValue(record))">取消</a>

                      <a-popconfirm title="确认删除?" ok-text="是" cancel-text="否"
                        @confirm="onDeleteRow(getRowKeyValue(record))">
                        <a v-show="showDelete" style="margin-left: 8px">删除</a>
                      </a-popconfirm>
                    </span>
                    <span v-else>
                      <div style="display: flex;align-items: center;justify-content: center;">
                      <a-button size="small" @click="edit(getRowKeyValue(record))">
                        <EditOutlined />
                        编辑
                      </a-button>
                     </div>
                    </span>
                  </div>
                </slot>
              </template>
              <template v-else-if="hasCustomRender(column)">
                <CellRenderer :column="column" :text="text" :record="record" />
              </template>
              <template v-else>
                {{ text }}
              </template>
            </slot>
          </template>
        </a-table>
      </div>
    </a-spin>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch, onMounted, onUnmounted, type UnwrapRef, defineComponent, h, isVNode } from 'vue'
import type { TableColumnType, TableProps } from 'ant-design-vue'
import { PlusOutlined, DeleteOutlined, ReloadOutlined,EditOutlined } from '@ant-design/icons-vue'

const spinning = ref(false)
// RecordType 定义为任意键值对对象 
type RecordType = Record<string, any>
// 操作列的 dataIndex 常量
const OPERATION_DATA_INDEX = '__operation__'
// 为了解决类型实例化过深的问题，明确定义列类型
type ColumnType = TableColumnType<RecordType>
// 深拷贝函数
const cloneDeep = <T extends Record<string, any> | Record<string, any>[]>(value: T): T => JSON.parse(JSON.stringify(value))
// 定义组件属性及默认值
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
    showDelete?: boolean
    pageSize?: number
    pagination?: false | TableProps<RecordType>['pagination']
    showOperation?: boolean
    enableColumnDrag?: boolean
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
    showDelete: true,
    pageSize: 10,
    pagination: undefined,
    showOperation: true,
    // 列任意调整位置
    enableColumnDrag: true,
  },
)
// 组件事件
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
  (e: 'columns-reordered', columns: TableColumnType<RecordType>[]): void
}>()
// 组件内部状态
const searchValue = ref('')
const resolvedRowKey = computed(() => props.rowKey ?? 'key')
const tableData = ref<RecordType[]>([])
const editableData: UnwrapRef<Record<string, RecordType>> = reactive({})
const selectedRowKeys = ref<(string | number)[]>([])
const selectedRows = ref<RecordType[]>([])
const windowSize = ref({ width: 0, height: 0 })
const isMobile = ref(false)
const currentPage = ref(1)
const currentPageSize = ref(props.pageSize)

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
// 组件挂载和卸载时添加和移除事件监听
onMounted(() => {
  updateWindowSize()
  checkMobile()
  window.addEventListener('resize', updateWindowSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateWindowSize)
})
// 监听 dataSource 属性变化，更新表格数据
watch(
  () => props.dataSource,
  (value) => {
    tableData.value = cloneDeep(value)
  },
  { immediate: true, deep: true },
)

// 监听 pageSize prop 变化
watch(
  () => props.pageSize,
  (value) => {
    currentPageSize.value = value
  },
)
// 监听 tableData 变化，更新已选择的行
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

// 可拖拽列状态（当 enableColumnDrag 为 true 时使用）
const columnsState = ref<TableColumnType<RecordType>[]>(cloneDeep(props.columns || []) as TableColumnType<RecordType>[])

// 同步 props.columns 到 columnsState
watch(
  () => props.columns as any,
  (v) => {
    columnsState.value = (v || []).map((col: any) => ({ ...col }))

  },
  { immediate: true, deep: true },
)

// 拖拽索引
const draggingIndex = ref<number | null>(null)

const onHeaderDragStart = (e: DragEvent, index: number) => {
  draggingIndex.value = index
  // 必须设置 dataTransfer 以便某些浏览器允许 drag/drop
  try {
    e.dataTransfer?.setData('text/plain', String(index))
    e.dataTransfer!.effectAllowed = 'move'
  } catch (err) {
    // ignore
  }
}

const onHeaderDragOver = (e: DragEvent) => {
  e.preventDefault()
  e.dataTransfer!.dropEffect = 'move'
}

const onHeaderDrop = (e: DragEvent, toIndex: number) => {
  e.preventDefault()
  const from = draggingIndex.value
  if (from === null || from === toIndex) return
  const list = columnsState.value.slice()
  const [moved] = list.splice(from, 1)
  if (moved !== undefined) {
    list.splice(toIndex, 0, moved)
    columnsState.value = list
    draggingIndex.value = null
    emit('columns-reordered', cloneDeep(list) as any)
  }
}

// 渲染可拖拽标题
const renderDraggableTitle = (col: TableColumnType<RecordType> | any, index: number) => {
  const raw = col.title ?? ''
  const titleText = typeof raw === 'string' || typeof raw === 'number' ? String(raw) : (raw && (raw.children || raw.default) ? raw : String(raw))
  return h(
    'div',
    {
      draggable: true,
      onDragstart: (e: DragEvent) => onHeaderDragStart(e, index),
      onDragover: onHeaderDragOver,
      onDrop: (e: DragEvent) => onHeaderDrop(e, index),
      style: { cursor: 'move', display: 'inline-block' },
    },
    titleText,
  )
}

// 计算合并后的列配置，确保包含操作列（当 showOperation 为 true 时才自动添加）
const mergedColumns = computed(() => {
  const baseCols: ColumnType[] = props.enableColumnDrag ? columnsState.value : props.columns as any
  let cols: ColumnType[] = baseCols || []
  if (props.showOperation !== false) {
    const hasOperation = cols.some((column) => column.dataIndex === OPERATION_DATA_INDEX)
    if (!hasOperation) {
      cols = [...cols, { title: '操作', dataIndex: OPERATION_DATA_INDEX, fixed: 'right', width: '120px' }]
    }
  }
  // 如果启用了列拖拽，在返回的列中替换 title 为可拖拽节点
  if (props.enableColumnDrag) {
    return cols.map((c, i) => ({ ...c, title: renderDraggableTitle(c, i) }))
  }
  return cols
})
// 计算合并后的行选择配置
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
// 计算可编辑字段集合和分页配置
const editableFieldSet = computed(() => new Set(props.editableFields))
const paginationConfig = computed(() => {
  if (props.pagination === false) {
    return false
  }
  if (props.pagination) {
    return props.pagination
  }
  return {
    current: currentPage.value,
    pageSize: currentPageSize.value,
    total: tableData.value.length,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total: number) => `共 ${total} 条`,
    pageSizeOptions: ['10', '20', '50', '100'],
    onChange: (page: number, pageSize: number) => {
      currentPage.value = page
      currentPageSize.value = pageSize
    },
    onShowSizeChange: (current: number, pageSize: number) => {
      currentPageSize.value = pageSize
      currentPage.value = 1
    },
  }
})

// 计算表格滚动区域大小
const mergedScroll = computed(() => {
  const baseScroll = props.scroll || {}

  if (isMobile.value) {
    // 移动端计算
    // Y 轴：视口高度 - header(64px) - 工具栏高度(约60px) - 分页器高度(约56px) - 额外边距(约100px)
    const scrollY = windowSize.value.height > 0
      ? windowSize.value.height - 64 - (props.showToolbar ? 60 : 0) - (paginationConfig.value ? 40 : 0) - 198
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
//  
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

// 新增：检测列是否定义 customRender
const hasCustomRender = (column: TableColumnType<RecordType>) =>
  !!(column && (column as any).customRender && typeof (column as any).customRender === 'function')

// 新增：调用列的 customRender，返回原始结果（允许 VNode）
const callCustomRender = (column: TableColumnType<RecordType>, text: any, record: RecordType) => {
  try {
    const fn = (column as any).customRender
    if (!fn) return text ?? ''
    const res = fn({ text, record, column })
    if (res === null || res === undefined) return ''
    return res
  } catch (e) {
    // 渲染异常时输出错误并返回原始文本，避免破坏表格渲染
    // eslint-disable-next-line no-console
    console.error('callCustomRender error:', e)
    return text ?? ''
  }
}

// 新增：CellRenderer 组件，负责正确渲染 customRender 返回的值（VNode、字符串或基本类型）
const CellRenderer = defineComponent({
  name: 'CellRenderer',
  props: {
    column: { type: Object as () => TableColumnType<RecordType>, required: true },
    text: { required: false },
    record: { type: Object as () => RecordType, required: true },
  },
  setup(props) {
    return () => {
      const res = callCustomRender(props.column as any, props.text, props.record as any)
      if (isVNode(res)) return res
      if (typeof res === 'string') return h('span', { innerHTML: res })
      return h('span', String(res ?? ''))
    }
  },
})

const edit = (key: string | number) => {
  // 清除所有其他行的编辑状态，确保只能编辑一行
  const currentEditingKeys = Object.keys(editableData)
  currentEditingKeys.forEach(editKey => {
    if (editKey !== String(key)) {
      delete editableData[editKey]
      emit('cancel', editKey)
    }
  })

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

// 新增：重置搜索，清空搜索框并触发搜索事件
const resetSearch = () => {
  spinning.value = true
  searchValue.value = ''
  setTimeout(async () => {
    onSearch()
    spinning.value = false
  }, 500)
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
