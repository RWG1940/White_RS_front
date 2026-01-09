<template>
    <a-modal v-model:open="visible" title="分享文件" width="600px" :maskClosable="false" :footer="null">
        <div v-if="shareResult.length === 0" class="share-form">
            <a-form :model="shareForm" layout="vertical">
                <a-form-item label="分享类型" required>
                    <a-radio-group v-model:value="shareForm.shareType">
                        <a-radio value="public">公开分享</a-radio>
                        <a-radio value="private">私密分享</a-radio>
                    </a-radio-group>
                </a-form-item>

                <a-form-item v-if="shareForm.shareType === 'private'" label="分享密码">
                    <a-input-password v-model:value="shareForm.sharePassword" placeholder="请输入分享密码（可选）" />
                </a-form-item>

                <a-form-item label="过期时间">
                    <a-date-picker v-model:value="shareForm.expirationTime" :show-time="{ format: 'HH:mm' }"
                        format="YYYY-MM-DD HH:mm" placeholder="选择过期时间（可选）" :disabled-date="disabledDate" />
                </a-form-item>

                <a-form-item label="被分享者ID（可选）">
                    <a-input v-model:value="shareForm.sharedWithUserId" placeholder="请输入被分享者用户ID" type="number" />
                </a-form-item>

                <a-form-item>
                    <a-button type="primary" @click="handleShare" :loading="sharing">
                        确认分享
                    </a-button>
                    <a-button style="margin-left: 10px" @click="handleCancel">
                        取消
                    </a-button>
                </a-form-item>
            </a-form>
        </div>

        <div v-else class="share-result">
            <a-result status="success" title="分享成功！">
                <template #extra>
                    <div class="share-info">
                        <div class="share-item">
                            <span class="label">分享链接：</span>
                            <div class="link-container">
                                <a-input :value="shareResult" readonly class="share-link" 
                                    @focus="(e:any) => e.target.select()" />
                                <a-button type="primary" @click="copyToClipboard(shareResult)" class="copy-btn">
                                    <CopyOutlined /> 复制
                                </a-button>
                            </div>
                        </div>
                    </div>


                    <a-space>
                        <a-button @click="handleClose">
                            关闭
                        </a-button>
                    </a-space>
                </template>
            </a-result>
        </div>
    </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { CopyOutlined } from '@ant-design/icons-vue'
import { shareFiles } from '@/stores/fileResource-store'
import type { FileSharingType } from '@/types/fileSharing-type'
import { formatTime } from '@/utils/formatTime'
import dayjs from 'dayjs'
import { getFrontendUrl } from '@/utils/api'

interface Props {
    visible: boolean
    selectedFileIds: number[]
}

interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'share-success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 分享表单数据
const shareForm = reactive<Partial<FileSharingType>>({
    shareType: 'public',
    sharePassword: '',
    expirationTime: undefined,
    sharedWithUserId: undefined,
    fileIds: []
})

// 分享结果
const shareResult = ref('')
const sharing = ref(false)

// 计算可见性
const visible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
})

// 禁用过去日期
const disabledDate = (current: dayjs.Dayjs) => {
    return current && current < dayjs().startOf('day')
}

// 处理分享
const handleShare = async () => {
    if (!props.selectedFileIds.length) {
        message.warning('请先选择要分享的文件')
        return
    }

    sharing.value = true
    try {
        // 格式化过期时间为后端要求的格式
        const formattedExpirationTime = shareForm.expirationTime
            ? dayjs(shareForm.expirationTime).format('YYYY-MM-DD HH:mm:ss')
            : undefined

        const shareData: FileSharingType = {
            ...shareForm,
            expirationTime: formattedExpirationTime,
            fileIds: props.selectedFileIds,
            shareTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
        }
        const result = await shareFiles(shareData)
        shareResult.value = getFrontendUrl()+'/white-rs-share/'+result
        emit('share-success')
    } catch (error) {
        console.error('分享失败:', error)
    } finally {
        sharing.value = false
    }
}

// 复制到剪贴板
const copyToClipboard = async (text: string) => {
    try {
        // 尝试使用现代Clipboard API
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text)
            message.success('复制成功')
            return
        }
        
        // 降级方案：使用textarea
        const textarea = document.createElement('textarea')
        textarea.value = text
        textarea.style.position = 'fixed'
        textarea.style.left = '-999999px'
        textarea.style.top = '-999999px'
        document.body.appendChild(textarea)
        textarea.select()
        textarea.setSelectionRange(0, 99999) // 对于移动设备
        
        const successful = document.execCommand('copy')
        document.body.removeChild(textarea)
        
        if (successful) {
            message.success('复制成功')
        } else {
            // 如果execCommand也失败，让用户手动复制
            const input = document.querySelector('.share-link input') as HTMLInputElement
            if (input) {
                input.select()
                input.setSelectionRange(0, 99999)
                message.warning('请使用Ctrl+C手动复制链接')
            } else {
                message.error('复制失败，请手动复制链接')
            }
        }
    } catch (err) {
        console.error('复制失败:', err)
        // 最后的降级方案：让用户手动复制
        const input = document.querySelector('.share-link input') as HTMLInputElement
        if (input) {
            input.select()
            input.setSelectionRange(0, 99999)
            message.warning('请使用Ctrl+C手动复制链接')
        } else {
            message.error('复制失败，请手动复制链接')
        }
    }
}



// 关闭模态框
const handleClose = () => {
    visible.value = false
    shareResult.value = ''
}

// 取消分享
const handleCancel = () => {
    visible.value = false
    shareResult.value = ''
}
</script>

<style scoped>
.share-result {
    padding: 20px 0;
}

.share-info {
    text-align: left;
    max-width: 500px;
    margin: 0 auto;
}

.share-item {
    margin-bottom: 16px;
    display: flex;
    align-items: center;
}

.label {
    font-weight: 600;
    min-width: 80px;
    margin-right: 8px;
}

.link-container,
.password-container {
    display: flex;
    gap: 8px;
    flex: 1;
}

.share-link,
.share-password {
    flex: 1;
}

.copy-btn {
    min-width: 80px;
}
</style>