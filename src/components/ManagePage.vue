<template>
    <div class="manage-page-wrapper">
        <!-- 搜索、添加、删除等功能区 -->
        <div class="header">
            <a-flex wrap="wrap" gap="small">
                <!-- 插槽 -->
                <slot name="header"></slot>
                <a-row :gutter="[8, 8]">
                    <a-col>
                        <a-input-search v-model:value="value" placeholder="搜索" enter-button @search="onSearch" />
                    </a-col>
                    <a-col>
                        <a-button type="primary"><PlusOutlined /></a-button>
                    </a-col>
                    <a-col>
                        <a-button type="primary"><DeleteOutlined /></a-button>
                    </a-col>
                </a-row>
            </a-flex>
        </div>
        <!-- 表格、数据区 -->
        <div class="content">
            <a-table :scroll="{ x: 600 }" :columns="columns" :data-source="dataSource" :row-selection="rowSelection" bordered>
                <template #bodyCell="{ column, text, record }">
                    <template v-if="['name', 'age', 'address'].includes(column.dataIndex)">
                        <div>
                            <a-input v-if="editableData[record.key]"
                                v-model:value="editableData[record.key][column.dataIndex]" style="margin: -5px 0" />
                            <template v-else>
                                {{ text }}
                            </template>
                        </div>
                    </template>
                    <template v-else-if="column.dataIndex === 'operation'">
                        <div class="editable-row-operations">
                            <span v-if="editableData[record.key]">
                                <a-typography-link @click="save(record.key)">保存</a-typography-link>
                                <a-popconfirm title="确认取消?" @confirm="cancel(record.key)">
                                    <a style="margin-left: 8px;">取消</a>
                                </a-popconfirm>
                                <a-popconfirm v-if="dataSource.length" title="确认删除?" @confirm="onDelete(record.key)">
                                    <a style="margin-left: 8px;">删除</a>
                                </a-popconfirm>
                            </span>
                            <span v-else>
                                <a @click="edit(record.key)">编辑</a>
                            </span>
                        </div>
                    </template>

                </template>
            </a-table>
        </div>
        <!-- 分页、翻页等功能区 -->
        <div class="footer"></div>
    </div>
</template>
<script setup lang="ts">
import { cloneDeep } from 'lodash-es';
import { reactive, ref } from 'vue';
import type { UnwrapRef } from 'vue';
import { PlusOutlined,DeleteOutlined } from '@ant-design/icons-vue'

const columns = [
    {
        title: 'name',
        dataIndex: 'name',
        width: '25%',
    },
    {
        title: 'age',
        dataIndex: 'age',
        width: '15%',
    },
    {
        title: 'address',
        dataIndex: 'address',
        width: '40%',
    },
    {
        title: '操作',
        dataIndex: 'operation',
        fixed: 'right',
    },
];
interface DataItem {
    key: string;
    name: string;
    age: number;
    address: string;
}
const data: DataItem[] = [];
for (let i = 0; i < 100; i++) {
    data.push({
        key: i.toString(),
        name: `Edrward ${i}`,
        age: 32,
        address: `London Park no. ${i}`,
    });
}

const dataSource = ref(data);
const editableData: UnwrapRef<Record<string, DataItem>> = reactive({});

const edit = (key: string) => {
    editableData[key] = cloneDeep(dataSource.value.filter(item => key === item.key)[0]);
};
const save = (key: string) => {
    Object.assign(dataSource.value.filter(item => key === item.key)[0], editableData[key]);
    delete editableData[key];
};
const cancel = (key: string) => {
    delete editableData[key];
};
const onDelete = (key: string) => {
    dataSource.value = dataSource.value.filter(item => item.key !== key);
};

const rowSelection = ref({
  checkStrictly: false,
  onChange: (selectedRowKeys: (string | number)[], selectedRows: DataItem[]) => {
    console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
  },
  onSelect: (record: DataItem, selected: boolean, selectedRows: DataItem[]) => {
    console.log(record, selected, selectedRows);
  },
  onSelectAll: (selected: boolean, selectedRows: DataItem[], changeRows: DataItem[]) => {
    console.log(selected, selectedRows, changeRows);
  },
});
</script>

<style scoped>
.header {
    margin-bottom: 10px;
}
</style>
