<template>
  <transition name="modal-fade">
    <div v-if="visible" class="checkout-modal-overlay">
      <div class="modal-blur-bg" @click="closeModal"></div>
      <div class="modal-container">
        <button class="close-btn" @click="closeModal">
          <CloseOutlined />
        </button>

        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title">{{ showQrCode ? '扫码支付' : '收银台' }}</h1>
          </div>

          <!-- 支付二维码显示 -->
          <div v-if="showQrCode" class="qr-code-section">
            <div class="qr-code-container">
              <div class="qr-code-image">
                <img 
                  :src="getQrCodeImage()" 
                  :alt="selectedMethod === 'wechat' ? '微信支付二维码' : '支付宝支付二维码'"
                  class="qr-img"
                />
              </div>
              <div class="qr-code-info">
                <h3 class="qr-title">{{ selectedMethod === 'wechat' ? '微信支付' : '支付宝支付' }}</h3>
                <p class="qr-amount">支付金额：<span class="amount">¥{{ selectedPlan?.price }}</span></p>
                <p class="qr-tip">请使用{{ selectedMethod === 'wechat' ? '微信' : '支付宝' }}扫一扫完成支付</p>
                <div class="payment-steps">
                  <div class="step-item">
                    <span class="step-number">1</span>
                    <span class="step-text">打开{{ selectedMethod === 'wechat' ? '微信' : '支付宝' }}扫一扫</span>
                  </div>
                  <div class="step-item">
                    <span class="step-number">2</span>
                    <span class="step-text">扫描二维码完成支付</span>
                  </div>
                  <div class="step-item">
                    <span class="step-number">3</span>
                    <span class="step-text">点击下方完成支付按钮</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 完成支付按钮 -->
            <div class="complete-payment-section">
              <a-button 
                type="primary" 
                block 
                size="large"
                @click="handleCompletePayment"
                class="complete-btn"
              >
                <template #icon>
                  <CheckCircleOutlined />
                </template>
                我已完成支付
              </a-button>
              <a-button 
                block 
                size="large"
                @click="showQrCode = false"
                class="back-btn"
              >
                返回选择支付方式
              </a-button>
            </div>
          </div>

          <!-- 支付方式选择（默认显示） -->
          <div v-else class="payment-selection-section">
            <!-- 订单信息 -->
            <div class="order-summary">
              <h3 class="section-title">订单信息</h3>
              <div class="order-details">
                <div class="order-item">
                  <span class="item-label">订阅计划</span>
                  <span class="item-value">{{ selectedPlan?.name }}</span>
                </div>
                <div class="order-item">
                  <span class="item-label">价格</span>
                  <span class="item-value price">¥{{ selectedPlan?.price }}</span>
                </div>
                <div class="order-item">
                  <span class="item-label">有效期</span>
                  <span class="item-value">{{ selectedPlan?.durationDays }}天</span>
                </div>
                <div class="order-item">
                  <span class="item-label">每日上限</span>
                  <span class="item-value">{{ selectedPlan?.dailyLimit }}次</span>
                </div>
              </div>
            </div>

            <!-- 支付方式选择 -->
            <div class="payment-methods">
              <h3 class="section-title">选择支付方式</h3>
              <div class="methods-list">
                <div 
                  v-for="method in paymentMethods" 
                  :key="method.id"
                  class="method-item"
                  :class="{ active: selectedMethod === method.id }"
                  @click="selectMethod(method.id)"
                >
                  <div class="method-icon">
                    <component :is="method.icon" />
                  </div>
                  <div class="method-info">
                    <span class="method-name">{{ method.name }}</span>
                    <span class="method-desc">{{ method.description }}</span>
                  </div>
                  <div class="method-radio">
                    <div class="radio-dot" :class="{ active: selectedMethod === method.id }"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 支付按钮 -->
            <div class="payment-action">
              <a-button 
                type="primary" 
                block 
                size="large"
                :loading="loading"
                :disabled="!selectedMethod"
                @click="handlePayment"
              >
                <template #icon>
                  <CreditCardOutlined />
                </template>
                立即支付 ¥{{ selectedPlan?.price }}
              </a-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, onUnmounted, watch } from 'vue'
import { message } from 'ant-design-vue'
import {
  CloseOutlined,
  CreditCardOutlined,
  WechatOutlined,
  AlipayOutlined,
  CheckCircleOutlined
} from '@ant-design/icons-vue'
import type { AiPlansType } from '@/types/aiPlans-type'
import { userBillStore } from '@/stores/userBillStore'
import { aiUserPlanStore } from '@/stores/aiUserPlan-store'
import { useAuthStore } from '@/stores/auth-store'

interface Props {
  visible: boolean
  selectedPlan: AiPlansType | null
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'payment-success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const authStore = useAuthStore()
const visible = ref(props.visible)
const loading = ref(false)
const selectedMethod = ref<string>('')
const showQrCode = ref(false)

// 支付方式列表
const paymentMethods = ref([
  {
    id: 'wechat',
    name: '微信支付',
    description: '推荐使用微信扫码支付',
    icon: WechatOutlined
  },
  {
    id: 'alipay',
    name: '支付宝',
    description: '推荐使用支付宝扫码支付',
    icon: AlipayOutlined
  }
])

// 监听 props 变化
const unwatch = watch(
  () => props.visible,
  (newVal) => {
    visible.value = newVal
    if (newVal) {
      // 重置选择状态
      selectedMethod.value = ''
      loading.value = false
      showQrCode.value = false
    }
  }
)

// 关闭弹窗
const closeModal = () => {
  visible.value = false
  emit('update:visible', false)
}

// 选择支付方式
const selectMethod = (methodId: string) => {
  selectedMethod.value = methodId
}

// 获取二维码图片路径
const getQrCodeImage = () => {
  if (selectedMethod.value === 'wechat') {
    return '/images/wechat.jpg'
  } else if (selectedMethod.value === 'alipay') {
    return '/images/zfb.jpg'
  }
  return ''
}

// 处理支付（显示二维码）
const handlePayment = async () => {
  if (!selectedMethod.value) {
    message.error('请选择支付方式')
    return
  }

  // 显示二维码界面
  showQrCode.value = true
}

// 处理完成支付
const handleCompletePayment = async () => {
  try {
    loading.value = true
    
    // 模拟支付完成处理
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    message.success({
      content: '支付成功！客服审核通过后将确认您的订阅',
      duration: 5
    })
    
    // 支付成功后的处理
    emit('payment-success')
    
    // 创建用户账单记录
    await userBillStore.create({
      uId: authStore.user?.id,
      type: 1, // 账单类型：1-订阅支付
      date: new Date().toISOString(),
      orderNum: `ORDER_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      result: `订阅${props.selectedPlan?.name}套餐`, 
      status: 1, // 账单状态：0-待审核
      paid: props.selectedPlan?.price
    })
    
    // 创建用户订阅计划记录
    await aiUserPlanStore.create({
      uId: authStore.user?.id,
      pId: props.selectedPlan?.id,
      sTime: new Date().toISOString(),
      eTime: new Date(Date.now() + (props.selectedPlan?.durationDays || 30) * 24 * 60 * 60 * 1000).toISOString(),
      status: 0 // 状态：0-待审核
    })
    
    closeModal()
    
  } catch (error) {
    message.error('操作失败，请重试')
  } finally {
    loading.value = false
  }
}

// 组件卸载时取消监听
onUnmounted(() => {
  unwatch()
})
</script>

<style scoped>
.checkout-modal-overlay {
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
  max-width: 480px;
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
  background: linear-gradient(135deg, #18d5ff, #1890ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.order-info-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #18d5ff, #1ac49f);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.order-details {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.order-item:last-child {
  border-bottom: none;
}

.item-label {
  font-size: 14px;
  color: #aaa;
  font-weight: 500;
}

.item-value {
  font-size: 14px;
  color: #fff;
  font-weight: 500;
}

.item-value.price {
  color: #ffa940;
  font-weight: 600;
  font-size: 16px;
}

.payment-methods {
  margin-bottom: 24px;
}

.methods-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.method-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.method-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
}

.method-item.active {
  background: rgba(24, 213, 255, 0.1);
  border-color: #18d5ff;
}

.method-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  margin-right: 12px;
  font-size: 20px;
  color: #18d5ff;
}

.method-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.method-name {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 4px;
}

.method-desc {
  font-size: 12px;
  color: #888;
}

.method-radio {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.radio-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.radio-dot.active {
  background: #18d5ff;
  box-shadow: 0 0 0 4px rgba(24, 213, 255, 0.2);
}

.payment-action {
  margin-top: 24px;
}

.payment-action :deep(.ant-btn-primary) {
  background: linear-gradient(135deg, #1890ff, #1ac49f);
  border-color: #1890ff;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
}

.payment-action :deep(.ant-btn-primary:hover) {
  background: linear-gradient(135deg, #40a9ff, #3dd1b1);
  border-color: #40a9ff;
}

.payment-action :deep(.ant-btn-primary:disabled) {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.4);
}

/* 二维码支付界面样式 */
.qr-code-section {
  margin-bottom: 24px;
}

.qr-code-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24px;
}

.qr-code-image {
  margin-bottom: 20px;
}

.qr-img {
  width: 200px;
  height: 250px;
  border-radius: 8px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

.qr-code-info {
  text-align: center;
  margin-bottom: 20px;
}

.qr-title {
  font-size: 20px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 12px;
  background: linear-gradient(135deg, #18d5ff, #1ac49f);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.qr-amount {
  font-size: 16px;
  color: #aaa;
  margin-bottom: 8px;
}

.qr-amount .amount {
  color: #ffa940;
  font-weight: 600;
  font-size: 18px;
}

.qr-tip {
  font-size: 14px;
  color: #888;
  margin-bottom: 20px;
}

.payment-steps {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 20px;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.step-number {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1890ff, #1ac49f);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
}

.step-text {
  font-size: 14px;
  color: #ddd;
}

.complete-payment-section {
  margin-top: 24px;
}

.complete-btn {
  margin-bottom: 12px;
}

.complete-btn :deep(.ant-btn) {
  background: linear-gradient(135deg, #52c41a, #73d13d);
  border-color: #52c41a;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
}

.complete-btn :deep(.ant-btn:hover) {
  background: linear-gradient(135deg, #73d13d, #95de64);
  border-color: #73d13d;
}

.back-btn :deep(.ant-btn) {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.2);
  color: #aaa;
  height: 48px;
  font-size: 16px;
}

.back-btn :deep(.ant-btn:hover) {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
  color: #ddd;
}

/* 进入 / 离开动画 */
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

  .method-item {
    padding: 12px;
  }

  .method-icon {
    width: 32px;
    height: 32px;
    font-size: 16px;
  }
}
</style>