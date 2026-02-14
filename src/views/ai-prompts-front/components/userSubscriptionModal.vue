<template>
  <transition name="modal-fade">
    <div v-if="visible" class="subscription-modal-overlay">
      <div class="modal-blur-bg" @click="closeModal"></div>
      <div class="modal-container">
        <button class="close-btn" @click="closeModal">
          <CloseOutlined />
        </button>

        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title">订阅信息</h1>
          </div>

          <!-- 加载状态 -->
          <div v-if="loading" class="loading-section">
            <a-spin size="large" />
            <p>正在加载订阅信息...</p>
          </div>

          <!-- 无订阅信息 -->
          <div v-else-if="!subscription" class="no-subscription-section">
            <div class="no-data-icon">
              <CrownOutlined />
            </div>
            <h3 class="no-data-title">暂无订阅</h3>
            <p class="no-data-desc">您当前没有有效的订阅套餐</p>
            <a-button type="primary" @click="goToPricing">
              <template #icon>
                <ShoppingCartOutlined />
              </template>
              前往订阅
            </a-button>
          </div>

          <!-- 有订阅信息 -->
          <div v-else class="subscription-info-section">
            <div class="subscription-card">
              <div class="card-header">
                <h3 class="plan-name">{{ subscription.planName }}</h3>
                <div class="status-badge" :class="getStatusClass(subscription.status)">
                  {{ getStatusText(subscription.status) }}
                </div>
              </div>
              
              <div class="time-info">
                <div class="time-item">
                  <span class="time-label">开始时间</span>
                  <span class="time-value">{{ formatTime(subscription.sTime) }}</span>
                </div>
                <div class="time-item">
                  <span class="time-label">结束时间</span>
                  <span class="time-value">{{ formatTime(subscription.eTime) }}</span>
                </div>
                <div class="time-item">
                  <span class="time-label">剩余时间</span>
                  <span class="time-value remaining" :class="getRemainingTimeClass(subscription.eTime)">
                    {{ getRemainingTime(subscription.eTime) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="action-buttons">
              <a-button type="primary" block @click="goToPricing">
                <template #icon>
                  <ReloadOutlined />
                </template>
                续费订阅
              </a-button>
              <a-button block @click="closeModal">关闭</a-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  CloseOutlined,
  CrownOutlined,
  ShoppingCartOutlined,
  ReloadOutlined
} from '@ant-design/icons-vue'
import { aiUserPlanStore } from '@/stores/aiUserPlan-store'
import { useAuthStore } from '@/stores/auth-store'
import type { AiUserPlanType } from '@/types/aiUserPlan'

interface Props {
  visible: boolean
}

interface Emits {
  (e: 'update:visible', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const router = useRouter()
const authStore = useAuthStore()
const visible = ref(props.visible)
const loading = ref(false)
const subscription = ref<AiUserPlanType | null>(null)

// 监听 props 变化
watch(
  () => props.visible,
  async (newVal) => {
    visible.value = newVal
    if (newVal) {
      await loadSubscription()
    }
  }
)

// 关闭弹窗
const closeModal = () => {
  visible.value = false
  emit('update:visible', false)
}

// 加载用户订阅信息
const loadSubscription = async () => {
  if (!authStore.user?.id) {
    message.error('用户信息获取失败')
    return
  }

  try {
    loading.value = true
    
    // 获取用户的所有订阅记录
    await aiUserPlanStore.fetchAll()
    
    if (aiUserPlanStore.list && Array.isArray(aiUserPlanStore.list)) {
      // 过滤当前用户的订阅记录，并按开始时间降序排序
      const userSubscriptions: AiUserPlanType[] = (aiUserPlanStore.list as AiUserPlanType[])
        .filter((item: AiUserPlanType) => 
          item.userName === authStore.user?.username || 
          (item as any).uId === authStore.user?.id
        )
        .sort((a: AiUserPlanType, b: AiUserPlanType) => {
          const timeA = a.sTime ? new Date(a.sTime).getTime() : 0
          const timeB = b.sTime ? new Date(b.sTime).getTime() : 0
          return timeB - timeA // 最新的排在最前面
        })
      
      // 取最新的订阅记录，确保类型安全
      const latestSubscription = userSubscriptions[0]
      subscription.value = latestSubscription ? latestSubscription : null
    }
  } catch (error) {
    console.error('加载订阅信息失败:', error)
    message.error('加载订阅信息失败')
  } finally {
    loading.value = false
  }
}

// 格式化时间
const formatTime = (timeString?: string) => {
  if (!timeString) return '未知'
  try {
    return new Date(timeString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return '时间格式错误'
  }
}

// 获取状态文本
const getStatusText = (status?: number) => {
  switch (status) {
    case 0: return '待审核'
    case 1: return '有效'
    case 2: return '已过期'
    default: return '未知'
  }
}

// 获取状态样式类
const getStatusClass = (status?: number) => {
  switch (status) {
    case 0: return 'status-pending'
    case 1: return 'status-active'
    case 2: return 'status-expired'
    default: return 'status-unknown'
  }
}

// 计算剩余时间
const getRemainingTime = (endTime?: string) => {
  if (!endTime) return '未知'
  
  try {
    const end = new Date(endTime)
    const now = new Date()
    const diff = end.getTime() - now.getTime()
    
    if (diff <= 0) return '已过期'
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (days > 0) {
      return `${days}天${hours}小时`
    } else {
      return `${hours}小时`
    }
  } catch {
    return '计算错误'
  }
}

// 获取剩余时间样式类
const getRemainingTimeClass = (endTime?: string) => {
  if (!endTime) return 'remaining-normal'
  
  try {
    const end = new Date(endTime)
    const now = new Date()
    const diff = end.getTime() - now.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (diff <= 0) return 'remaining-expired'
    if (days <= 3) return 'remaining-warning'
    return 'remaining-normal'
  } catch {
    return 'remaining-normal'
  }
}

// 前往订阅页面
const goToPricing = () => {
  closeModal()
  router.push('/aiPrompts')
}
</script>

<style scoped>
.subscription-modal-overlay {
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
  max-width: 420px;
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

.modal-header {
  margin-bottom: 32px;
  text-align: center;
}

.modal-title {
  font-size: 28px;
  font-weight: 700;
  color: #fff;
  margin: 0;
  background: linear-gradient(135deg, #18d5ff, #1890ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.loading-section {
  text-align: center;
  padding: 40px 0;
}

.loading-section p {
  margin-top: 16px;
  color: #aaa;
}

.no-subscription-section {
  text-align: center;
  padding: 40px 0;
}

.no-data-icon {
  font-size: 64px;
  color: #666;
  margin-bottom: 16px;
}

.no-data-title {
  font-size: 20px;
  color: #fff;
  margin-bottom: 8px;
}

.no-data-desc {
  color: #aaa;
  margin-bottom: 24px;
}

.subscription-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.plan-name {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  margin: 0;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-pending {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
  border: 1px solid rgba(255, 193, 7, 0.3);
}

.status-active {
  background: rgba(76, 175, 80, 0.2);
  color: #4caf50;
  border: 1px solid rgba(76, 175, 80, 0.3);
}

.status-expired {
  background: rgba(244, 67, 54, 0.2);
  color: #f44336;
  border: 1px solid rgba(244, 67, 54, 0.3);
}

.status-unknown {
  background: rgba(158, 158, 158, 0.2);
  color: #9e9e9e;
  border: 1px solid rgba(158, 158, 158, 0.3);
}

.time-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.time-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.time-label {
  font-size: 14px;
  color: #aaa;
}

.time-value {
  font-size: 14px;
  color: #fff;
  font-weight: 500;
}

.time-value.remaining {
  font-weight: 600;
}

.remaining-normal {
  color: #4caf50;
}

.remaining-warning {
  color: #ff9800;
}

.remaining-expired {
  color: #f44336;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-buttons :deep(.ant-btn-primary) {
  background: linear-gradient(135deg, #1890ff, #1ac49f);
  border-color: #1890ff;
}

.action-buttons :deep(.ant-btn-primary:hover) {
  background: linear-gradient(135deg, #40a9ff, #3dd1b1);
  border-color: #40a9ff;
}

/* 动画效果 */
.modal-fade-enter-active {
  animation: modal-in 1s cubic-bezier(0.22, 1.15, 0.36, 1);
}

.modal-fade-leave-active {
  animation: modal-out 0.35s ease-in;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-leave-from {
  opacity: 1;
}

@keyframes modal-in {
  0% {
    opacity: 0;
    transform: translateY(-16px) scale(0.92);
  }
  60% {
    opacity: 1;
    transform: translateY(2px) scale(1.2);
  }
  80% {
    transform: translateY(-1px) scale(0.99);
  }
  100% {
    transform: translateY(0) scale(1);
  }
}

@keyframes modal-out {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(-10px) scale(0.96);
  }
}

/* 响应式设计 */
@media (max-width: 480px) {
  .modal-container {
    padding: 24px;
    max-width: 95%;
  }
  
  .modal-title {
    font-size: 24px;
  }
  
  .card-header {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }
}
</style>