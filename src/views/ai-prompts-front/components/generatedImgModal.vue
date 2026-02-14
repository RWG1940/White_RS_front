<template>
    <!-- 遮罩层 -->
    <div v-if="visible" class="modal-overlay" @click="handleCancel">
        <!-- 弹窗内容 -->
        <div class="custom-modal" @click.stop>
            <!-- 标题栏 -->
            <div class="modal-header">
                <h3 class="modal-title">
                    <PictureOutlined class="title-icon" />
                    生成图片
                </h3>
                <button class="close-button" @click="handleCancel">
                    <CloseOutlined />
                </button>
            </div>
            
            <!-- 内容区域 -->
            <div class="modal-content">
                <!-- 加载状态 -->
                <div v-if="loading" class="loading-container">
                    <div class="spinner"></div>
                    <p>正在生成图片，请稍候...</p>
                </div>
                
                <!-- 图片显示 -->
                <div v-else-if="generatedImage" class="image-container">
                    <img :src="generatedImage" alt="生成的图片" class="generated-image" />
                    <div class="image-actions">
                        <button class="action-btn download-btn" @click="downloadImage">
                            <DownloadOutlined class="btn-icon" />
                            下载图片
                        </button>
                        <button class="action-btn close-btn" @click="handleCancel">
                            <CloseOutlined class="btn-icon" />
                            关闭
                        </button>
                    </div>
                </div>
                
                <!-- 错误状态 -->
                <div v-else-if="error" class="error-container">
                    <ExclamationCircleOutlined class="error-icon" />
                    <p>{{ error }}</p>
                    <button class="action-btn retry-btn" @click="retryGenerate">
                        重试
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { DownloadOutlined, CloseOutlined, ExclamationCircleOutlined, PictureOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { generateImgByText } from '@/api/services/qwen-api'
import { aiPromptsSelectedStore } from '@/stores/aiPromptsSelected-store'
import { useAuthStore } from '@/stores/auth-store'

interface Props {
    visible: boolean
    prompt: string
}

const promptsStore = aiPromptsSelectedStore()

const props = defineProps<Props>()
const emit = defineEmits<{
    'update:visible': [value: boolean]
    'close': []
}>()

const visible = ref(props.visible)
const loading = ref(false)
const generatedImage = ref('')
const error = ref('')

// 监听 visible 属性变化
watch(() => props.visible, (newVal) => {
    visible.value = newVal
    if (newVal) {
        handleGenerate()
    }
})

// 监听 visible 内部值变化
watch(visible, (newVal) => {
    emit('update:visible', newVal)
    if (!newVal) {
        emit('close')
        resetState()
    }
})

// 生成图片
const handleGenerate = async () => {
    if (!props.prompt.trim()) {
        error.value = '提示词不能为空'
        return
    }

    loading.value = true
    error.value = ''
    generatedImage.value = ''

    try {
        const response = await generateImgByText({
            prompt: props.prompt,
            n: 1,
            size: promptsStore.selectedOutputConfig || '1024*1024',
            uid: useAuthStore().user?.id
        })

        if (response.data.code == 200) {
            // 后端返回图片的 URL
            generatedImage.value = response.data.data
            message.success('图片生成成功！')
        } else {
            error.value = '生成图片失败'
        }
    } catch (err: any) {
        console.error('生成图片失败:', err)
        error.value = err.message || '生成图片失败，请稍后重试'
    } finally {
        loading.value = false
    }
}

// 下载图片
const downloadImage = () => {
    if (!generatedImage.value) return

    try {
        const link = document.createElement('a')
        link.href = generatedImage.value
        link.download = `generated-image-${new Date().getTime()}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        message.success('图片下载成功！')
    } catch (err) {
        console.error('下载图片失败:', err)
        message.error('下载图片失败')
    }
}

// 重试生成
const retryGenerate = () => {
    handleGenerate()
}

// 取消/关闭
const handleCancel = () => {
    visible.value = false
}

// 重置状态
const resetState = () => {
    loading.value = false
    generatedImage.value = ''
    error.value = ''
}

// 暴露方法给父组件
const open = () => {
    visible.value = true
    handleGenerate()
}

const close = () => {
    visible.value = false
}

defineExpose({
    open,
    close
})
</script>

<style scoped>
/* 遮罩层 */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: fadeIn 0.3s ease-out;
}

/* 自定义弹窗 */
.custom-modal {
    width: 60%;
    max-width: 90vw;
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(20px);
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.2);
    overflow: hidden;
    animation: slideUp 0.3s ease-out;
}

/* 标题栏 */
.modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px;
    background: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(171, 171, 171, 0.3);
}

.modal-title {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: rgb(0, 255, 255);
    display: flex;
    align-items: center;
    gap: 8px;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.title-icon {
    font-size: 20px;
}

.close-button {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    font-size: 16px;
    color: white;
    cursor: pointer;
    padding: 6px 8px;
    border-radius: 6px;
    transition: all 0.3s;
    backdrop-filter: blur(5px);
}

.close-button:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
}

/* 内容区域 */
.modal-content {
    min-height: 600px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: white;
}

/* 加载状态 */
.loading-container {
    text-align: center;
    padding: 60px 0;
}

.spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-top: 3px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 16px;
}

.loading-container p {
    margin-top: 16px;
    color: rgba(255, 255, 255, 0.9);
    font-size: 14px;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

/* 图片显示 */
.image-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
    padding: 24px;
}

.generated-image {
    max-width: 100%;
    max-height: 400px;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.3);
}

.image-actions {
    display: flex;
    gap: 12px;
}

/* 按钮样式 */
.action-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 20px;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s;
    backdrop-filter: blur(5px);
}

.btn-icon {
    font-size: 14px;
}

.download-btn {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.3);
}

.download-btn:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 255, 255, 0.2);
}

.close-btn {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.2);
}

.close-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
}

/* 错误状态 */
.error-container {
    text-align: center;
    padding: 40px 24px;
}

.error-icon {
    font-size: 48px;
    color: rgba(255, 255, 255, 0.9);
    margin-bottom: 16px;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.error-container p {
    color: rgba(255, 255, 255, 0.9);
    margin-bottom: 20px;
    font-size: 16px;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.retry-btn {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.3);
}

.retry-btn:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 255, 255, 0.2);
}

/* 动画效果 */
@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes slideUp {
    from { 
        opacity: 0;
        transform: translateY(30px) scale(0.95);
    }
    to { 
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

/* 响应式设计 */
@media (max-width: 768px) {
    .custom-modal {
        width: 95vw;
        margin: 0 10px;
    }
    
    .image-actions {
        flex-direction: column;
        width: 100%;
    }
    
    .action-btn {
        width: 100%;
        justify-content: center;
    }
}
</style>