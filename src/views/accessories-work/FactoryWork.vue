<template>
    <div>
        <!--移动端-->
        <div v-if="isMobile" class="work-wrap-1">
            <FAMobileTable />
        </div>

        <!-- pc 端 -->
        <div v-else class="work-wrap-2">
            <FATable v-model:openHistory="openHistory" />
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

        <!-- 订单管理弹窗：季度管理 -->
        <Modal :visible="openHistory" :show-footer="false" @update:visible="openHistory = $event" title="季度管理">
            <div class="batch-header">
                <div class="batch-controls">
                    <a-input-search
                        v-model:value="seasonSearchText"
                        placeholder="搜索季度名称"
                        style="width: 200px; margin-right: 12px"
                        allow-clear
                        size="small"
                    />
                    <a-radio-group
                        v-model:value="seasonFilterStatus"
                        button-style="solid"
                        size="small"
                        style="margin-right: 12px"
                    >
                        <a-radio-button value="all">全部</a-radio-button>
                        <a-radio-button value="visible">只看未隐藏</a-radio-button>
                        <a-radio-button value="hidden">只看隐藏</a-radio-button>
                    </a-radio-group>
                    <a-radio-group v-model:value="seasonSortOrder" button-style="solid" size="small">
                        <a-radio-button value="asc">升序</a-radio-button>
                        <a-radio-button value="desc">降序</a-radio-button>
                    </a-radio-group>
                </div>
            </div>

            <div class="batch-container">
                <!-- 季度视图 -->
                <div
                    v-for="season in filteredQuarters"
                    :key="season.name"
                    class="batch-card"
                    :class="{ 'hidden-batch': season.status === 0 }"
                >
                    <div class="batch-content">
                        <div class="batch-name">
                            <span class="name-text">
                                {{ season.name }}
                                <a-tag v-if="season.status === 0" color="default" style="margin-left: 8px"
                                    >已隐藏</a-tag
                                >
                            </span>
                        </div>
                    </div>
                    <div class="batch-actions">
                        <a-button
                            v-if="season.status === 1"
                            type="default"
                            size="small"
                            @click="handleToggleQuarterStatus(season.name!, 0)"
                        >
                            隐藏
                        </a-button>
                        <a-button
                            v-else
                            type="primary"
                            size="small"
                            @click="handleToggleQuarterStatus(season.name!, 1)"
                        >
                            显示
                        </a-button>
                    </div>
                </div>

                <div v-if="quarters.length === 0" class="empty-state">
                    <p>暂无季度数据</p>
                </div>
            </div>
            <div class="batch-footer">
                <span class="batch-count">季度总数: {{ filteredQuarters.length }}</span>
                <span class="visible-count">已隐藏: {{ hiddenSeasonCount }}</span>
            </div>
        </Modal>

        <!-- 详情下拉框：放在模板外层，桌面和移动端都可见 -->
        <a-drawer title="辅料详情" :size="size" :placement="placement" :open="openInfo" @close="showDrawer">


        </a-drawer>
    </div>
</template>
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { message } from 'ant-design-vue';
import type { DrawerProps } from 'ant-design-vue';
import FATable from './components/FATable.vue';
import { importExcel, exportExcel } from '@/api/services/acc-api';
import { PlusOutlined } from '@ant-design/icons-vue';
import { accStore, getQuarters, quarters,fetchPageByImportId,selectedBatchId } from '@/stores/acc-store';
import { tableImportStore } from '@/stores/tableImport-store';
import FAMobileTable from './components/FAMobileTable.vue';
import Modal from '@/components/Modal.vue';
import { userConfiguresStore, removeConfigureByE } from '@/stores/userConfigures-store';
import { useAuthStore } from '@/stores/auth-store';


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

// 季度管理相关状态
const authStore = useAuthStore()
const seasonFilterStatus = ref<'all' | 'visible' | 'hidden'>('all')
const seasonSearchText = ref<string>('')
const seasonSortOrder = ref<'asc' | 'desc'>('desc')

// 计算过滤后的季度列表
const filteredQuarters = computed(() => {
    let list = quarters.value

    // 按筛选状态过滤
    if (seasonFilterStatus.value === 'visible') {
        list = list.filter((quarter) => quarter.status !== 0)
    } else if (seasonFilterStatus.value === 'hidden') {
        list = list.filter((quarter) => quarter.status === 0)
    }

    // 按搜索文本过滤
    if (seasonSearchText.value) {
        const search = seasonSearchText.value.toLowerCase()
        list = list.filter((quarter) => (quarter.name || '').toLowerCase().includes(search))
    }

    // 排序
    const sorted = [...list]
    if (seasonSortOrder.value === 'asc') {
        sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    } else {
        sorted.sort((a, b) => (b.name || '').localeCompare(a.name || ''))
    }
    return sorted
})

// 计算隐藏的季度数量
const hiddenSeasonCount = computed(() => {
    return quarters.value.filter((quarter) => quarter.status === 0).length
})

// 隐藏或显示季度
const handleToggleQuarterStatus = async (quarterStr: string, status: number) => {
    try {
        if (status === 0) {
            await userConfiguresStore.create({
                uId: authStore.user?.id,
                configureName: 'hiddenQuarters',
                configureValue: quarterStr,
                type: 1,
                status: 1,
                remarks: '隐藏季度',
            })
        } else {
            // 启用
            await removeConfigureByE({
                uId: authStore.user?.id,
                configureName: 'hiddenQuarters',
                configureValue: quarterStr,
            })
            message.success('启用成功')
        }
        // 设置该条数据
        const foundItem = quarters.value.find((item: any) => item.name === quarterStr)
        if (foundItem) {
            ;(foundItem as any).status = status
        }
        // 刷新页面数据
        await fetchPageByImportId(selectedBatchId.value || 0, accStore.currentPage, accStore.pageSize, '')
    } catch (error) {
        message.error('操作失败，请重试')
        return
    }
}


onMounted(() => {
    // 监听窗口大小变化
    updateIsMobile();
    // 添加窗口大小变化监听器
    window.addEventListener('resize', updateIsMobile);
    // 加载季度列表
    getQuarters()
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

/* 订单管理弹窗样式 */
.batch-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding: 12px;
    border-radius: 16px;
}

.batch-controls {
    display: flex;
    gap: 8px;
}

.batch-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 8px;
    max-height: 60vh;
    overflow-y: auto;
    overflow-x: hidden;
}

.batch-footer {
    display: flex;
    justify-content: flex-end;
    gap: 16px;
    padding: 12px 8px 0;
    border-top: 1px solid #f0f0f0;
    flex-shrink: 0;
}

.batch-card {
    border: 1px solid #d9d9d9;
    border-radius: 6px;
    padding: 16px;
    background-color: #fafafa;
    transition: all 0.3s ease;
    animation: slideIn 0.3s ease;
}

.batch-card.hidden-batch {
    border-color: #bfbfbf;
    background-color: #f5f5f5;
    opacity: 0.6;
}

.batch-card.hidden-batch:hover {
    opacity: 0.8;
}

.batch-card:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    background-color: #fff;
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.batch-content {
    margin-bottom: 12px;
}

.batch-name {
    font-size: 16px;
    font-weight: 500;
    color: #1890ff;
    margin-bottom: 8px;
}

.name-text {
    display: block;
    word-break: break-word;
}

.batch-actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.batch-actions :deep(.ant-btn) {
    flex-shrink: 0;
}

.empty-state {
    text-align: center;
    padding: 40px 20px;
    color: #8c8c8c;
}

.empty-state p {
    font-size: 14px;
    margin: 0;
}

.batch-count,
.visible-count {
    font-size: 14px;
    color: #333;
    font-weight: 500;
}

/* 移动端响应式 */
@media (max-width: 768px) {
    .batch-container {
        gap: 12px;
        padding: 4px;
    }

    .batch-card {
        padding: 12px;
    }

    .batch-actions {
        gap: 6px;
    }

    .batch-actions :deep(.ant-btn) {
        font-size: 12px;
    }
}
</style>