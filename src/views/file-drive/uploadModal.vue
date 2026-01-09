<template>
    <a-modal v-model:visible="visible" title="上传文件" width="800px" @cancel="handleCancel"
        :ok-button-props="{ disabled: uploading }" :cancel-button-props="{ disabled: uploading }"
        :confirm-loading="uploading">
        <div class="upload-container">
            <!-- 拖拽上传区域 -->
            <a-upload-dragger v-model:file-list="fileList" name="file" :multiple="true" :before-upload="beforeUpload"
                :show-upload-list="false" :custom-request="handleUpload" class="upload-dragger" @drop="handleDrop"
                @dragenter="handleDragEnter" @dragleave="handleDragLeave">
                <div class="drag-area" :class="{ 'drag-over': isDragOver }">
                    <p class="ant-upload-drag-icon">
                        <InboxOutlined />
                    </p>
                    <p class="ant-upload-text">点击或拖拽文件到此区域上传</p>
                    <p class="ant-upload-hint">支持单个或批量上传，文件大小不超过 100MB</p>
                </div>
            </a-upload-dragger>

            <!-- 文件列表 -->
            <div class="file-list" v-if="fileList.length > 0">
                <div class="file-list-header">
                    <span>已选择 {{ fileList.length }} 个文件</span>
                    <a-button type="link" @click="clearFileList" :disabled="uploading">清空列表</a-button>
                </div>
                <div class="file-items">
                    <div v-for="(file, index) in fileList" :key="file.uid" class="file-item">
                        <div class="file-info">
                            <FileOutlined class="file-icon" />
                            <div class="file-details">
                                <div class="file-name">{{ file.name }}</div>
                                <div class="file-size">{{ formatFileSize(file.size || 0) }}</div>
                            </div>
                        </div>
                        <div class="file-status">
                            <a-progress v-if="file.status === 'uploading'" :percent="file.percent || 0" size="small" />
                            <CheckCircleOutlined v-else-if="file.status === 'done'" class="success-icon" />
                            <CloseCircleOutlined v-else-if="file.status === 'error'" class="error-icon" />
                            <a-button v-else type="link" size="small" @click="removeFile(index)" :disabled="uploading">
                                <DeleteOutlined />
                            </a-button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 上传进度 -->
            <div class="upload-progress" v-if="uploading">
                <a-progress :percent="overallProgress" :status="uploadStatus" />
                <div class="progress-text">
                    {{ uploadStatusText }}
                </div>
            </div>
        </div>

        <template #footer>
            <a-button @click="handleCancel" :disabled="uploading">取消</a-button>
            <a-button type="primary" @click="handleOk" :loading="uploading"
                :disabled="fileList.length === 0 || uploading || isStorageFull">
                {{ uploading ? `上传中 (${uploadedCount}/${fileList.length})` : isStorageFull ? '存储空间已满' : '确认' }}
            </a-button>
        </template>
    </a-modal>
</template>

<script lang="ts" setup>
import { ref, watch, computed } from 'vue';
import { message } from 'ant-design-vue';
import { InboxOutlined, FileOutlined, CheckCircleOutlined, CloseCircleOutlined, DeleteOutlined } from '@ant-design/icons-vue';
import { uploadFileWithInfo } from '@/api/services/fileResource-api';
import { useAuthStore } from '@/stores/auth-store';
import type { UploadFile } from 'ant-design-vue';

// 从父组件获取存储空间信息
const props = defineProps<{
    modelValue: boolean;
    availableStorageSpace?: number; // 可用存储空间（字节）
    totalStorageSpace?: number; // 总存储空间（字节）
    filesTotalSize?: number; // 已用存储空间（字节）
}>();
// 定义事件
const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void;
    (e: 'upload-success'): void;
}>();
// 模态框可见状态
const visible = ref(props.modelValue);
// 文件列表
const fileList = ref<UploadFile[]>([]);
// 上传状态
const uploading = ref(false);
// 拖拽状态
const isDragOver = ref(false);
// 已上传文件数量
const uploadedCount = ref(0);
// 获取用户信息
const authStore = useAuthStore();



// 计算已选文件总大小
const selectedFilesTotalSize = computed(() => {
    return fileList.value.reduce((total, file) => total + (file.size || 0), 0);
});

// 检查存储空间是否已满
const isStorageFull = computed(() => {
    if (!props.availableStorageSpace || props.availableStorageSpace <= 0) {
        return true;
    }
    return false;
});

// 计算总体进度
const overallProgress = computed(() => {
    if (fileList.value.length === 0) return 0;
    const total = fileList.value.reduce((sum, file) => sum + (file.percent || 0), 0);
    return Math.round(total / fileList.value.length);
});

// 上传状态
const uploadStatus = computed(() => {
    const hasError = fileList.value.some(file => file.status === 'error');
    const allDone = fileList.value.every(file => file.status === 'done');

    if (hasError) return 'exception';
    if (allDone) return 'success';
    return 'active';
});

// 上传状态文本
const uploadStatusText = computed(() => {
    const doneCount = fileList.value.filter(file => file.status === 'done').length;
    const errorCount = fileList.value.filter(file => file.status === 'error').length;
    const totalCount = fileList.value.length;

    if (errorCount > 0) {
        return `${doneCount} 个文件上传成功，${errorCount} 个文件上传失败`;
    }
    if (doneCount === totalCount) {
        return '所有文件上传完成';
    }
    return `正在上传 ${doneCount}/${totalCount} 个文件`;
});
// 监听 props.modelValue 改变
watch(() => props.modelValue, (newVal) => {
    visible.value = newVal;
});
// 监听 visible 改变
watch(visible, (newVal) => {
    emit('update:modelValue', newVal);
});

// 文件上传前验证
const beforeUpload = (file: File) => {
    // 检查文件大小限制
    const isLt100M = file.size / 1024 / 1024 < 100;
    if (!isLt100M) {
        message.error('文件大小不能超过 100MB!');
        return false;
    }

    // 检查存储空间是否足够
    if (isStorageFull.value) {
        message.error('存储空间已满，无法上传文件!');
        return false;
    }

    // 检查当前选择的文件总大小是否超过可用空间
    if (props.availableStorageSpace && (selectedFilesTotalSize.value + file.size) > props.availableStorageSpace) {
        message.error(`存储空间不足！可用空间：${formatFileSize(props.availableStorageSpace)}，已选文件：${formatFileSize(selectedFilesTotalSize.value)}`);
        return false;
    }

    return true;
};

// 处理拖拽事件
const handleDragEnter = () => {
    isDragOver.value = true;
};
// 处理拖拽离开事件
const handleDragLeave = () => {
    isDragOver.value = false;
};
// 处理文件放下事件
const handleDrop = () => {
    isDragOver.value = false;
};

// 自定义上传处理
const handleUpload = async (options: any) => {
    const { file, onProgress, onSuccess, onError } = options;

    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('bizType', 'drive_file');
        formData.append('bizId', '2');
        formData.append('creatorId', authStore.user?.id?.toString() || '0');

        // 模拟上传进度
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += 10;
            if (progress >= 90) {
                clearInterval(progressInterval);
            }
            onProgress({ percent: progress });
        }, 100);

        // 实际上传
        const response = await uploadFileWithInfo(formData);

        clearInterval(progressInterval);
        onProgress({ percent: 100 });

        if (response.data.code === 200) {
            onSuccess(response.data);
            uploadedCount.value++;
        } else {
            onError(new Error(response.data.message || '上传失败'));
        }
    } catch (error) {
        onError(error);
    }
};

// 批量上传
const handleOk = async () => {
    if (fileList.value.length === 0) {
        message.warning('请先选择要上传的文件');
        return;
    }

    uploading.value = true;
    uploadedCount.value = 0;

    // 重置所有文件状态
    fileList.value.forEach(file => {
        if (file.status !== 'done' && file.status !== 'error') {
            file.status = 'uploading';
            file.percent = 0;
        }
    });

    try {
        // 并行上传所有文件
        const uploadPromises = fileList.value
            .filter(file => file.status !== 'done' && file.status !== 'error')
            .map(file => {
                return new Promise((resolve, reject) => {
                    handleUpload({
                        file: file as any,
                        onProgress: (event: any) => {
                            file.percent = event.percent;
                        },
                        onSuccess: () => {
                            file.status = 'done';
                            resolve(file);
                        },
                        onError: (error: any) => {
                            file.status = 'error';
                            file.response = error.message;
                            reject(error);
                        }
                    });
                });
            });

        await Promise.allSettled(uploadPromises);

        const successCount = fileList.value.filter(file => file.status === 'done').length;
        const errorCount = fileList.value.filter(file => file.status === 'error').length;

        if (errorCount === 0) {
            message.success(`成功上传 ${successCount} 个文件`);
            emit('upload-success');
            handleCancel();
        } else if (successCount > 0) {
            message.warning(`成功上传 ${successCount} 个文件，${errorCount} 个文件失败`);
        } else {
            message.error('所有文件上传失败');
        }
    } catch (error) {
        message.error('上传过程中发生错误');
    } finally {
        uploading.value = false;
    }
};

// 移除单个文件
const removeFile = (index: number) => {
    fileList.value.splice(index, 1);
};

// 清空文件列表
const clearFileList = () => {
    fileList.value = [];
};

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
// 取消上传
const handleCancel = () => {
    if (!uploading.value) {
        fileList.value = [];
        uploadedCount.value = 0;
    }
    visible.value = false;
};
</script>

<style scoped>
.upload-container {
    padding: 16px 0;
}

.upload-dragger {
    margin-bottom: 16px;
}

.drag-area {
    padding: 40px 0;
    transition: all 0.3s;
}

.drag-area.drag-over {
    background-color: #f0f7ff;
    border-color: #1890ff;
}

.file-list {
    border: 1px solid #d9d9d9;
    border-radius: 6px;
    margin-top: 16px;
}

.file-list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid #f0f0f0;
    background-color: #fafafa;
}

.file-items {
    max-height: 200px;
    overflow-y: auto;
}

.file-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 16px;
    border-bottom: 1px solid #f0f0f0;
}

.file-item:last-child {
    border-bottom: none;
}

.file-info {
    display: flex;
    align-items: center;
    flex: 1;
}

.file-icon {
    font-size: 16px;
    color: #1890ff;
    margin-right: 8px;
}

.file-details {
    flex: 1;
}

.file-name {
    font-size: 14px;
    color: #262626;
    margin-bottom: 2px;
}

.file-size {
    font-size: 12px;
    color: #8c8c8c;
}

.file-status {
    width: 120px;
    text-align: center;
}

.success-icon {
    color: #52c41a;
    font-size: 16px;
}

.error-icon {
    color: #ff4d4f;
    font-size: 16px;
}

.upload-progress {
    margin-top: 16px;
}

.progress-text {
    text-align: center;
    margin-top: 8px;
    font-size: 12px;
    color: #8c8c8c;
}

.ant-upload-text {
    font-size: 16px;
    margin-bottom: 8px;
}

.ant-upload-hint {
    font-size: 14px;
}
</style>