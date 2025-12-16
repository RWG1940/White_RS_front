<template>
    <div>
        <!--移动端-->
        <div v-if="isMobile" class="work-wrap-1">
            <div class="header">
                <a-button type="primary" style="width: 100%;" @click="showImport">导入辅料清单表</a-button>
            </div>
            <div class="search-card">
                <a-collapse v-model:activeKey="activeKey">
                    <a-collapse-panel key="1" header="查找辅料">
                        <a-row>
                            <a-select v-model:value="value" mode="tags" style="width: 100%" placeholder="选择工厂"
                                :options="options" @change="handleChange"></a-select>
                        </a-row>
                        <a-row style="margin-top: 10px;">
                            <a-input-search v-model:value="value" placeholder="输入单号或合同号" enter-button
                                @search="onSearch" />
                        </a-row>
                    </a-collapse-panel>
                </a-collapse>
            </div>
            <div class="process-card">
                <a-card title="辅料名">
                    <template #extra>
                        <a-button type="primary" @click="showDrawer">详情</a-button>
                    </template>
                    <a-row style="display:flex;align-items: center;justify-content: left;">
                        <a-col> 优先级：</a-col>
                        <a-col>
                            <FiveStars />
                        </a-col>
                    </a-row>
                    <a-row style="display:flex;align-items: center;justify-content: left;">
                        <a-col> 生产进度：</a-col>
                        <a-col style="color: red;">辅料工厂确认合同</a-col>
                    </a-row>
                    <a-row style="display:flex;align-items: center;justify-content: left;">
                        <a-col> 备注：</a-col>
                        <a-col>12345</a-col>
                    </a-row>
                    <div style="display: flex;align-items: center;justify-content: center;margin-top: 10px;">
                        <a-progress type="circle" :stroke-color="{
                            '0%': '#108ee9',
                            '100%': '#87d068',
                        }" :percent="20" />
                    </div>

                </a-card>
            </div>
        </div>

        <!-- pc 端 -->
        <div v-else class="work-wrap-2">
            <GDTable />
        </div>

        <!-- 移动端和pc端公用的弹窗 -->
        <!-- 导入弹窗：放在模板外层，桌面和移动端都可见 -->
        <a-modal v-model:open="openImport" title="导入Excel" ok-text="导入" cancel-text="取消" @ok="handleExcelImportOk"
            @cancel="handleExcelImportCancel" :confirmLoading="excelImportLoading">
            <a-form layout="vertical">
                <a-form-item label="选择Excel文件" required>
                    <a-upload :before-upload="beforeExcelUpload" :max-count="1" :file-list="uploadExcelList"
                        list-type="picture-card" accept=".xlsx,.xls" @preview="handlePreview" @remove="handleRemove">
                        <div v-if="uploadExcelList.length < 1">
                            <PlusOutlined />
                            <div style="margin-top: 8px">点击上传</div>
                        </div>
                    </a-upload>
                    <div style="margin-top: 8px; color: #999; font-size: 12px;">
                        支持格式：.xlsx, .xls，文件大小不超过100MB
                    </div>
                </a-form-item>
                <a-form-item label="设置导入id" required>
                    <div style="color: #999;font-size: smaller;margin-bottom: 10px;">
                        <p>这决定了你导入表格的批次，具体应用在：</p>
                        <p>1、后续表格导入更新现有数据</p>
                        <p>2、导出数据的范围</p>
                    </div>

                    <a-input v-model:value="importId" placeholder="请填写导入id" style="width: 200px"></a-input>
                </a-form-item>
            </a-form>

            <!-- 图片预览模态框 -->
            <a-modal :open="previewVisible" title="文件预览" @cancel="handleCancel" :footer="null">
                <img style="width: 100%" :src="previewImage" />
            </a-modal>
        </a-modal>

        <!-- 导出弹窗：放在模板外层，桌面和移动端都可见 -->
        <a-modal v-model:open="openExport" title="导出辅料清单" width="50%" wrap-class-name="full-modal" ok-text="导出"
            cancel-text="取消" @ok="handleExcelExportOk" @cancel="handleExcelExportCancel"
            :confirmLoading="excelImportLoading">
            <a-form-item label="选择导出批次id" required>
                <a-row>
                    <a-select v-model:value="exportIds" :options="options" mode="multiple" placeholder="请填写导出批次id"
                        style="width: 200px"></a-select>
                </a-row>
            </a-form-item>
            <p style="color: #999;margin-bottom: 10px;font-size: smaller;">以下为非必填字段，通过下方的设置你可以获取按照某字段排序后的表格</p>
            <a-form-item label="选择排序字段">
                <a-row>
                    <a-select v-model:value="sortBy" :options="sortFields" placeholder="请选择排序字段" style="width: 200px" />
                </a-row>
            </a-form-item>
            <a-form-item label="选择排序方式">
                <a-row>
                    <a-radio-group v-model:value="sortOrder">
                        <a-radio-button value="asc">升序</a-radio-button>
                        <a-radio-button value="desc">降序</a-radio-button>
                    </a-radio-group>
                </a-row>
            </a-form-item>

        </a-modal>

        <!-- 历史弹窗：放在模板外层，桌面和移动端都可见 -->
        <a-modal v-model:open="openHistory" title="历史批次管理" width="50%" wrap-class-name="full-modal">
            <template #default>
                <div>
                    <div style="color: #999;font-size: smaller;margin-bottom: 10px;">
                        <p>这是用于管理表格导入批次的面板，其具体说明如下：</p>
                        <p>1、导入的表格中的每条数据都会有个导入id，通过该id可以在页面中迅速筛选出同一批次的数据</p>
                        <p>2、该面板中的项目删除操作不会影响你表格的数据，但是你导出表格就会受到影响</p>
                    </div>
                    <a-tag v-for="batch in tableImportStore.list as any" :key="batch.id" color="blue" :closable="true"
                        @close="tableImportStore.remove([batch.id])"
                        style="margin-bottom: 8px; display: inline-flex; align-items: center;">
                        {{ batch.id }}

                    </a-tag>
                </div>
            </template>
            <template #footer>
                <a-button @click="openHistory = false">取消</a-button>
            </template>
        </a-modal>

        <!-- 详情下拉框：放在模板外层，桌面和移动端都可见 -->
        <a-drawer title="辅料详情" :size="size" :placement="placement" :open="openInfo" @close="showDrawer">


        </a-drawer>
    </div>
</template>
<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import FiveStars from './components/fiveStars.vue';
import type { DrawerProps } from 'ant-design-vue';
import GDTable from './components/GDTable.vue';
import { importExcel, exportExcel } from '@/api/services/acc-api';
import { PlusOutlined } from '@ant-design/icons-vue';
import { accStore } from '@/stores/acc-store';
import { tableImportStore } from '@/stores/tableImport-store';


const placement = ref<DrawerProps['placement']>('top');
const openInfo = ref<boolean>(false);
const openImport = ref<boolean>(false);
const openExport = ref<boolean>(false);
const openHistory = ref<boolean>(false);
const size = ref<'default' | 'large' | number>('large');
const options = ref<any[]>([])

// Excel 导入相关状态
const excelImportLoading = ref(false);
const uploadExcelFile = ref<File | null>(null);
const uploadExcelList = ref<any>([]);
const previewVisible = ref(false);
const previewImage = ref('');
const importId = ref();
const exportIds = ref<string[]>([])
const sortBy = ref<string>('')
const sortOrder = ref<string>('asc')

const showDrawer = () => {
    openInfo.value = !openInfo.value;
};

const showImport = () => {
    openImport.value = !openImport.value;
};
const showExport = () => {
    openExport.value = !openExport.value;
};
const showHistory = () => {
    openHistory.value = !openHistory.value;
};

const activeKey = ref(['1']);

// 响应式判断是否为移动端（宽度 <= 768px）
const isMobile = ref(false)

const updateIsMobile = () => {
    isMobile.value = window.innerWidth <= 768
}

// Excel 上传相关方法
const beforeExcelUpload = async (file: File) => {
    // 检查文件类型
    const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
    ];

    if (!allowedTypes.includes(file.type)) {
        message.error('只能上传 Excel 文件 (.xlsx, .xls)');
        return false;
    }

    // 检查文件大小（限制 10MB）
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
        message.error('文件大小不能超过 10MB');
        return false;
    }

    const reader = new FileReader();
    reader.onload = e => {
        uploadExcelList.value = [
            {
                uid: String(Date.now()),
                name: file.name,
                status: 'done',
                url: e.target?.result as string,
                originFileObj: file
            }
        ];
    };
    reader.readAsDataURL(file);

    uploadExcelFile.value = file;
    return false;  // 阻止自动上传
};

// Excel 导入确认
const handleExcelImportOk = async () => {
    if (!uploadExcelFile.value) {
        message.warning('请选择要导入的 Excel 文件');
        return;
    }
    if (!importId.value) {
        message.warning('请填写导入id');
        return;
    }
    try {
        excelImportLoading.value = true;
        const form = new FormData();
        form.append('file', uploadExcelFile.value);
        form.append('importId', importId.value);
        await importExcel(form);
        message.success('Excel 导入成功');
        // 重置状态
        handleExcelImportCancel();
        await accStore.fetchPage();
        await tableImportStore.fetchAll();
    } catch (error) {
        message.error('Excel 导入失败，请检查文件格式');
    } finally {
        excelImportLoading.value = false;
    }
};
// Excel 导出确认
const handleExcelExportOk = async () => {
    try {
        excelImportLoading.value = true;
        const form = new FormData();
        // 将数组中的每个元素单独添加到FormData中
        exportIds.value.forEach(id => {
            form.append('exportIds', id);
        });
        form.append('sortBy', sortBy.value);
        form.append('sortOrder', sortOrder.value);

        const response = await exportExcel(form);

        // 从 AxiosResponse 中提取 Blob 数据
        const blob = new Blob([response.data], { type: 'application/vnd.ms-excel' });
        const url = window.URL.createObjectURL(blob);

        // 获取当前日期并格式化为 YYYY-MM-DD
        const currentDate = new Date().toISOString().split('T')[0];
        const fileName = `导出文件-${currentDate}.xlsx`;

        // 创建一个隐藏的 <a> 元素并触发下载
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName; // 设置下载的文件名
        document.body.appendChild(link);
        link.click();

        // 清理 URL 和 DOM
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);

        message.success('Excel 导出成功');
        handleExcelExportCancel();
        await accStore.fetchPage();
    } catch (error) {
        message.error('Excel 导出失败，请检查文件格式');
    } finally {
        excelImportLoading.value = false;
    }
};
// Excel 导入取消
const handleExcelImportCancel = () => {
    uploadExcelFile.value = null;
    uploadExcelList.value = [];
    importId.value = '';
    openImport.value = false;
};
// Excel 导出取消
const handleExcelExportCancel = () => {
    openExport.value = false;
    exportIds.value = [];
};
// 图片预览相关方法
const handlePreview = (file: any) => {
    previewImage.value = file.url;
    previewVisible.value = true;
};
// 图片取消预览
const handleCancel = () => {
    previewVisible.value = false;
};
// 图片移除
const handleRemove = (file: any) => {
    uploadExcelList.value = [];
    uploadExcelFile.value = null;
    return true;
};

const sortFields = [
    { label: '创建时间', value: 'createdAt' },
    { label: '修改时间', value: 'updatedAt' },
    { label: '优先级', value: 'priority' },
    { label: '状态', value: 'status' },
    { label: '数量', value: 'quantity' }
]

// 批次删除
const handleDeleteBatch = async (batchId: number) => {
    try {
        await tableImportStore.remove([batchId]);
        message.success(`批次 ${batchId} 删除成功`);
        await tableImportStore.fetchAll(); // 刷新批次列表
    } catch (error) {
        message.error(`删除批次 ${batchId} 失败`);
    }
};

onMounted(() => {
    // 监听窗口大小变化
    updateIsMobile();
    // 添加窗口大小变化监听器
    window.addEventListener('resize', updateIsMobile);
    // 加载可用的表格批次
    tableImportStore.fetchAll().then(() => {
        options.value = tableImportStore.list.map((item: any) => ({
            value: item.id,
            label: item.id
        }));
    });

});
</script>
<style scoped>
.header {
    display: flex;
    gap: 10px;
    margin-bottom: 10px;
}

.search-card {
    width: 100%;
    margin-bottom: 10px;

}

.process-card {
    width: 100%;
}

/* 使最外层工作区域可滚动，当内容超出时显示滚动条 */
.work-wrap-1 {
    /* 根据页面布局调整高度，这里使用视口高度减去顶部等间距，保证在多数页面中可滚动 */
    max-height: calc(100vh - 150px);
    overflow: auto;
}
</style>