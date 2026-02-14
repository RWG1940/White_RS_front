<template>
  <transition name="modal-fade">
    <div v-if="visible" class="generate-record-modal-overlay">
      <div class="modal-blur-bg" @click="closeModal"></div>
      <div class="modal-container">
        <button class="close-btn" @click="closeModal">
          <CloseOutlined />
        </button>

        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title">图片生成记录</h1>
          </div>

          <div class="records-content">
            <div class="records-grid" v-if="generateRecords.length > 0">
              <div 
                v-for="record in generateRecords" 
                :key="record.id" 
                class="record-item"
              >
                <div class="record-image-container">
                  <img 
                    :src="getRecordImageUrl(record)" 
                    :alt="record.type || '生成图片'"
                    class="record-image"
                    @error="handleImageError"
                    @click="openImageInBrowser(record)"
                  />
                  <div class="record-date">
                    {{ formatDate(record.create_at) }}
                  </div>
                </div>
                <div class="record-info">
                  <span class="record-type">{{ record.type || '未分类' }}</span>
                </div>
              </div>
            </div>
            
            <div v-else class="empty-records">
              <PictureOutlined class="empty-icon" />
              <p class="empty-text">暂无图片生成记录</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useAuthStore } from '@/stores/auth-store'
import { message } from 'ant-design-vue'
import { CloseOutlined, PictureOutlined } from '@ant-design/icons-vue'
import { getBackendUrl } from '@/utils/getApiUrl'
import { generateRecordStore } from '@/stores/generateRecord-store'
import type { generateRecordType } from '@/types/generateRecord-type'

interface Props {
  visible?: boolean
}

interface Emits {
  (e: 'update:visible', value: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
})

const emit = defineEmits<Emits>()

const authStore = useAuthStore()
const loading = ref(false)
const generateRecords = ref<generateRecordType[]>([])

// 监听 visible 变化
watch(
  () => props.visible,
  async (newVal) => {
    if (newVal) {
      await loadRecords()
    }
  }
)

// 关闭弹窗
const closeModal = () => {
  emit('update:visible', false)
}

// 加载记录
const loadRecords = async () => {
  try {
    loading.value = true
    await generateRecordStore.fetchPage()
    // 从store中获取数据并过滤当前用户的记录
    const records = generateRecordStore.pagedList as generateRecordType[]
    generateRecords.value = records.filter(record => 
      record.uid === authStore.user?.id
    )
  } catch (error) {
    message.error('获取图片生成记录失败')
  } finally {
    loading.value = false
  }
}

// 获取图片URL
const getRecordImageUrl = (record: generateRecordType) => {
  if (record?.url) {
    return record.url
  }
  return '../../public/images/default_image.jpg'
}

// 处理图片加载错误
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = '../../public/images/default_image.jpg'
}

// 格式化日期
const formatDate = (dateString?: string) => {
  if (!dateString) return '未知日期'
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

// 在浏览器中打开图片
const openImageInBrowser = (record: generateRecordType) => {
  const imageUrl = getRecordImageUrl(record)
  if (imageUrl && imageUrl !== '../../public/images/default_image.jpg') {
    window.open(imageUrl, '_blank')
  }
}
</script>

<style scoped>
.generate-record-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-blur-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.modal-container {
  position: relative;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  background: linear-gradient(135deg, #1a1a1a 0%, #252525 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  padding: 40px;
  z-index: 2001;
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    transform: translateY(-20px) scale(0.95);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #888;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #dcdcdc;
  border-color: rgba(255, 255, 255, 0.2);
}

.modal-content {
  animation: fadeIn 0.3s ease-out 0.1s backwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-header {
  margin-bottom: 32px;
  text-align: center;
}

.modal-title {
  font-size: 28px;
  font-weight: 700;
  color: #fff;
  margin: 0;
  background: linear-gradient(135deg, #ffa940, #ff7a45);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.records-content {
  max-height: 60vh;
  overflow-y: auto;
  padding-right: 4px;
}

/* 宫格布局 */
.records-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 20px;
}

.record-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 16px;
  transition: all 0.3s ease;
}

.record-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.record-image-container {
  position: relative;
  width: 100%;
  height: 120px;
  margin-bottom: 12px;
}

.record-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.record-date {
  position: absolute;
  bottom: 4px;
  right: 4px;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 500;
}

.record-info {
  text-align: center;
}

.record-type {
  font-size: 12px;
  color: #aaa;
  font-weight: 500;
  word-break: break-all;
}

/* 空状态样式 */
.empty-records {
  text-align: center;
  padding: 60px 0;
}

.empty-icon {
  font-size: 64px;
  color: #666;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 16px;
  color: #888;
  margin: 0;
}

/* 滚动条样式 */
.records-content::-webkit-scrollbar {
  width: 6px;
}

.records-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
}

.records-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.records-content::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* 进入 / 离开公共配置 */
.modal-fade-enter-active {
  animation: modal-in 0.3s cubic-bezier(0.22, 1.15, 0.36, 1);
}

.modal-fade-leave-active {
  animation: modal-out 0.2s ease-in;
}

/* 初始透明度 */
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* 离开结束态 */
.modal-fade-leave-from {
  opacity: 1;
}

/* 入场动画 */
@keyframes modal-in {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 出场动画 */
@keyframes modal-out {
  from {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateY(-10px) scale(0.96);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .modal-container {
    padding: 24px;
    max-width: 95%;
  }

  .modal-title {
    font-size: 24px;
  }

  .records-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 16px;
  }

  .record-image-container {
    height: 100px;
  }
}
</style>