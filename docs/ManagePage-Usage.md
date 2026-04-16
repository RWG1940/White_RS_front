ManagePage.vue 使用文档

概述

- ManagePage 是一个基于 Ant Design Vue 表格的通用管理页组件，提供数据表格、工具栏、搜索、分页、批量操作、行内编辑等能力。通过传入数据源和列定义即可快速搭建增删改查的页面，同时支持自定义 toolbar、单元格渲染、操作列等扩展点。

核心能力

- 数据表格与分页显示：tableData、pagedList、total、currentPage、pageSize 等状态驱动表格展示。
- 搜索与筛选：工具栏提供搜索输入、筛选条件和自定义筛选项。
- 增删改查的扩展点：通过 slot 提供自定义单元格、操作列和整行自定义渲染。
- 行内编辑体验：支持在表格中直接切换行编辑状态、保存、取消、删除单行条目等。编辑时行将以高亮样式显示。
- 自定义工具：通过 toolbar 插槽或 custom-tool 插槽注入自定义工具。
- 响应式/移动端适配：对移动端提供简化的工具按钮和布局调整。

API 概览

- 组件的核心输入（props）与行为来自于 src/components/ManagePage.vue 内置的默认值，以下是常用的配置项：
- dataSource: 记录数据数组
- columns: 表格列定义，类型为 TableColumnType<any>[]
- loading: 加载中状态
- total: 总条数，用于分页
- currentPage: 当前页码
- pageSize: 每页条数
- isBordered: 是否显示边框
- showToolbar: 是否显示工具栏
- showSearch: 是否显示搜索框
- searchPlaceholder: 搜索框占位文本
- showAdd: 显示添加按钮
- showBatchDelete: 显示批量删除按钮
- showDelete: 显示单条删除操作
- pagination: 自定义分页配置（或 false 禁用分页）
- enableColumnDrag: 是否开启列拖拽排序
- clickToEdit: 是否点击行即可进入编辑模式
- searchSelectOptions: 筛选字段选项
- searchSelectValue、searchValue、searchResults 等内部状态用于搜索/筛选流程
- 其他：column 自定义渲染、cell-<dataIndex>、bodyCell、operation 插槽等扩展点

Slots 与可扩展点

- toolbar（插槽名称：toolbar）: 在默认工具栏外提供自定义工具条区域。
- custom-tool: 自定义工具容器，放置在工具栏的右侧区域。
- cell-<dataIndex>：对指定列进行自定义渲染，dataIndex 对应列的 dataIndex。
- bodyCell：通用单元格自定义渲染，覆盖默认渲染。
- operation：操作列的自定义渲染，接收 record、isEditing、save、cancel、edit、remove 等属性/方法。
- 其他：column 自定义渲染会通过 bodyCell / hasCustomRender 实现。

示例：最小化用法

```vue
<template>
  <ManagePage :dataSource="users" :columns="columns" />
</template>

<script setup lang="ts">
import ManagePage from '@/components/ManagePage.vue'
import { ref } from 'vue'
import type { ColumnType } from 'ant-design-vue'

type User = { id: number; name: string; email: string }

const users = ref<User[]>([
  { id: 1, name: 'Alice', email: 'alice@example.com' },
  { id: 2, name: 'Bob', email: 'bob@example.com' },
])

const columns = ref<ColumnType<any>[]>([
  { title: 'ID', dataIndex: 'id', key: 'id' },
  { title: 'Name', dataIndex: 'name', key: 'name' },
  { title: 'Email', dataIndex: 'email', key: 'email' },
])
</script>
```
