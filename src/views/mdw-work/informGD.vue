<template>
    <div class="materials-distribution">
        <a-card title="材料分发管理" :bordered="false">
            <div class="upload-section">
                <a-alert
                    message="使用说明"
                    description="上传Excel表格，系统将根据表格中的工厂名和文件路径自动将文件分发给对应工厂的企微群聊。表格需要包含工厂名和文件路径两列。"
                    type="info"
                    show-icon
                    style="margin-bottom: 16px"
                />
                
                <a-upload-dragger
                    v-model:file-list="fileList"
                    name="file"
                    :multiple="false"
                    :before-upload="beforeUpload"
                    :show-upload-list="false"
                    accept=".xlsx,.xls"
                    style="margin-bottom: 16px"
                >
                    <p class="ant-upload-drag-icon">
                        <InboxOutlined style="font-size: 48px; color: #1890ff" />
                    </p>
                    <p class="ant-upload-text">点击或拖拽Excel文件到此区域上传</p>
                    <p class="ant-upload-hint">
                        支持 .xlsx, .xls 格式文件，文件大小不超过10MB
                    </p>
                </a-upload-dragger>

                <div class="upload-info" v-if="uploadFile">
                    <a-space direction="vertical" style="width: 100%">
                        <a-alert
                            :message="`已选择文件: ${uploadFile.name}`"
                            type="success"
                            show-icon
                        />
                        <a-progress
                            :percent="uploadProgress"
                            status="active"
                            v-if="uploading"
                        />
                        <a-button
                            type="primary"
                            :loading="uploading"
                            @click="handleUpload"
                            :disabled="!uploadFile"
                            style="width: 120px"
                        >
                            {{ uploading ? '上传中' : '开始分发' }}
                        </a-button>
                    </a-space>
                </div>
            </div>

            <a-divider />

            <div class="distribution-history" v-if="distributionHistory.length > 0">
                <h3>分发历史</h3>
                <a-table
                    :data-source="distributionHistory"
                    :columns="historyColumns"
                    :pagination="{ pageSize: 10 }"
                    size="small"
                >
                    <template #bodyCell="{ column, record }">
                        <template v-if="column.dataIndex === 'status'">
                            <a-tag :color="record.status === 'success' ? 'green' : 'red'">
                                {{ record.status === 'success' ? '成功' : '失败' }}
                            </a-tag>
                        </template>
                        <template v-if="column.dataIndex === 'timestamp'">
                            {{ formatTime(record.timestamp) }}
                        </template>
                    </template>
                </a-table>
            </div>
        </a-card>
    </div>
    
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { message } from 'ant-design-vue'
import { InboxOutlined } from '@ant-design/icons-vue'
import { formatTime } from '@/utils/formatTime'
import type { UploadChangeParam } from 'ant-design-vue'

interface DistributionRecord {
    id: string
    fileName: string
    factoryCount: number
    status: 'success' | 'error'
    message: string
    timestamp: string
}

// 上传文件相关状态
const uploadFile = ref<File | null>(null)
const fileList = ref<any[]>([])
const uploading = ref(false)
const uploadProgress = ref(0)

// 分发历史记录
const distributionHistory = ref<DistributionRecord[]>([])

// 历史记录表格列配置
const historyColumns = [
    {
        title: '文件名',
        dataIndex: 'fileName',
        key: 'fileName',
        width: 200
    },
    {
        title: '工厂数量',
        dataIndex: 'factoryCount',
        key: 'factoryCount',
        width: 100
    },
    {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        width: 80
    },
    {
        title: '消息',
        dataIndex: 'message',
        key: 'message',
        ellipsis: true
    },
    {
        title: '分发时间',
        dataIndex: 'timestamp',
        key: 'timestamp',
        width: 180
    }
]

// 文件上传前验证
const beforeUpload = (file: File) => {
    const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                   file.type === 'application/vnd.ms-excel'
    
    if (!isExcel) {
        message.error('只能上传Excel文件!')
        return false
    }
    
    const isLt10M = file.size / 1024 / 1024 < 10
    if (!isLt10M) {
        message.error('文件大小不能超过10MB!')
        return false
    }
    
    uploadFile.value = file
    return false // 阻止自动上传
}

// 处理文件上传和分发
const handleUpload = async () => {
    if (!uploadFile.value) {
        message.warning('请先选择文件')
        return
    }

    uploading.value = true
    uploadProgress.value = 0

    try {
        // 模拟上传进度
        const progressInterval = setInterval(() => {
            uploadProgress.value += 10
            if (uploadProgress.value >= 90) {
                clearInterval(progressInterval)
            }
        }, 200)

        // 创建FormData
        const formData = new FormData()
        formData.append('file', uploadFile.value)

        // 调用API进行分发（这里需要根据实际API调整）
        // const response = await distributeMaterials(formData)
        
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        clearInterval(progressInterval)
        uploadProgress.value = 100

        // 模拟分发结果
        const result = {
            success: true,
            data: {
                fileName: uploadFile.value.name,
                factoryCount: 3,
                message: '文件已成功分发给3个工厂的企微群聊'
            }
        }

        if (result.success) {
            message.success('材料分发成功!')
            
            // 添加到历史记录
            distributionHistory.value.unshift({
                id: Date.now().toString(),
                fileName: result.data.fileName,
                factoryCount: result.data.factoryCount,
                status: 'success',
                message: result.data.message,
                timestamp: new Date().toISOString()
            })
        } else {
            throw new Error('分发失败')
        }

    } catch (error) {
        console.error('分发失败:', error)
        message.error('材料分发失败，请重试')
        
        // 添加到历史记录（失败）
        distributionHistory.value.unshift({
            id: Date.now().toString(),
            fileName: uploadFile.value?.name || '未知文件',
            factoryCount: 0,
            status: 'error',
            message: error instanceof Error ? error.message : '未知错误',
            timestamp: new Date().toISOString()
        })
    } finally {
        uploading.value = false
        uploadProgress.value = 0
        uploadFile.value = null
        fileList.value = []
    }
}

// 模拟分发API（实际使用时需要根据后端API调整）
// const distributeMaterials = async (formData: FormData) => {
//     // 这里调用实际的分发API
//     // return await apiClient.post('/materials/distribute', formData, {
//     //     headers: { 'Content-Type': 'multipart/form-data' },
//     // })
// }
</script>

<style scoped>
.materials-distribution {
    padding: 16px;
    
    .upload-section {
        max-width: 600px;
        margin: 0 auto;
        
        .upload-info {
            margin-top: 16px;
            text-align: center;
        }
    }
    
    .distribution-history {
        margin-top: 24px;
        
        h3 {
            margin-bottom: 16px;
            color: rgba(0, 0, 0, 0.85);
            font-weight: 600;
        }
    }
}

:deep(.ant-upload-dragger) {
    border: 2px dashed #d9d9d9;
    border-radius: 8px;
    
    &:hover {
        border-color: #1890ff;
    }
}

:deep(.ant-alert) {
    border-radius: 6px;
}
</style>