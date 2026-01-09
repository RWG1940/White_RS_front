<template>
    <ScrollContent>
        <template #content>
       
        <div v-if="isMobile">
            <YDMobileTable />
        </div>
        <!-- pc 端 -->
        <div v-else>
            <YDTable v-model:openImport="openImport" v-model:open-export="openExport" v-model:open-info="openInfo"
                v-model:openHistory="openHistory" />
        </div>

        <!-- 导入弹窗：放在模板外层，桌面和移动端都可见 -->
        <a-modal v-model:open="openImport" title="导入Excel" ok-text="导入" cancel-text="取消" @ok="handleExcelImportOk"
            @cancel="handleExcelImportCancel" :confirmLoading="excelImportLoading">
            <a-alert message="使用说明" description="上传表格文件、批次号，选择要关联的客户，系统将导入数据（若批次号已存在则更新数据）。" type="info" show-icon
                style="margin-bottom: 16px" />
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
                <a-form-item label="设置批次号（如20260101）" required>
                    <a-input v-model:value="importId" placeholder="请填写导入id" style="width: 200px"></a-input>
                </a-form-item>
                <a-form-item label="设置关联客户" required>
                    <a-select v-model:value="guestId"  placeholder="请选择客户" style="width: 200px" :options="guestOptions"></a-select>
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
            <a-alert message="使用说明" description="上传批次号，系统将导出该批次的数据。" type="info" show-icon
                style="margin-bottom: 16px" />
            <a-form-item label="选择导出批次id" required>
                <a-row>
                    <a-select v-model:value="exportIds" :options="options" mode="multiple" placeholder="请填写导出批次id"
                        style="width: 200px"></a-select>
                </a-row>
            </a-form-item>
            <!-- <p style="color: #999;margin-bottom: 10px;font-size: smaller;">以下为非必填字段，通过下方的设置你可以获取按照某字段排序后的表格</p>
            <a-form-item label="选择排序字段">
                <a-row>
                    <a-select v-model:value="sortBy" :options="sortFields" placeholder="请选择排序字段" style="width: 200px" />
                </a-row>
            </a-form-item> -->
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
                    <a-alert message="使用说明" description="用于管理批次号，删除批次号不会影响导入的表格数据。" type="info" show-icon
                        style="margin-bottom: 16px" />
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
        </template>
    </ScrollContent>
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { message } from 'ant-design-vue';
import type { DrawerProps } from 'ant-design-vue';
import YDTable from './components/YDTable.vue';
import { importExcel, exportExcel } from '@/api/services/acc-api';
import { PlusOutlined } from '@ant-design/icons-vue';
import { accStore, fetchPageByGuestId } from '@/stores/acc-store';
import { tableImportStore } from '@/stores/tableImport-store';
import YDMobileTable from './components/YDMobileTable.vue';
import ScrollContent from '@/components/scrollContent.vue';
import { guestStore } from '@/stores/guest-store';


const placement = ref<DrawerProps['placement']>('top');
const openInfo = ref<boolean>(false);
const openImport = ref<boolean>(false);
const openExport = ref<boolean>(false);
const openHistory = ref<boolean>(false);
const size = ref<'default' | 'large' | number>('large');
const options = ref<any[]>([])
const guestOptions = ref<any[]>([])

// Excel 导入相关状态
const excelImportLoading = ref(false);
const uploadExcelFile = ref<File | null>(null);
const uploadExcelList = ref<any>([]);
const previewVisible = ref(false);
const previewImage = ref('');
const importId = ref();
const guestId = ref();
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
    if (!guestId.value) {
        message.warning('请选择关联客户');
        return;
    }
    try {
        excelImportLoading.value = true;
        const form = new FormData();
        form.append('file', uploadExcelFile.value);
        form.append('importId', importId.value);
        form.append('guestId', guestId.value);
        await importExcel(form);
        message.success('Excel 导入成功');
        await fetchPageByGuestId(guestId.value, 0, accStore.currentPage, accStore.pageSize);
        // 重置状态
        handleExcelImportCancel();
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
        const requestData = {
            exportIds: exportIds.value,
            sortBy: sortBy.value,
            sortOrder: sortOrder.value
        };

        const response = await exportExcel(requestData);

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
    guestId.value = '';
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



onMounted(() => {
    updateIsMobile()
    window.addEventListener('resize', updateIsMobile)
    // 加载可用的表格批次
    tableImportStore.fetchAll().then(() => {
        options.value = tableImportStore.list.map((item: any) => ({
            value: item.id,
            label: item.id
        }));
    });
    
    // 加载客户列表
    guestStore.fetchAll().then(() => {
        guestOptions.value = guestStore.list.map((item: any) => ({
            value: item.id,
            label: item.name || `客户 ${item.id}`
        }));
    });

});

onUnmounted(() => {
    window.removeEventListener('resize', updateIsMobile)
})
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
</style>