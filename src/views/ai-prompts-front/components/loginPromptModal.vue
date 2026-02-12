<template>
  <transition name="modal-fade">
    <div v-if="isVisible" class="login-prompt-modal-overlay">
      <div class="modal-blur-bg"></div>
      <div class="modal-container">
        <button class="close-btn" @click="closeModal">
          <CloseOutlined />
        </button>

        <div class="modal-content">
          <div class="modal-header">
            <div class="icon-wrapper">
              <ExclamationCircleOutlined class="warning-icon" />
            </div>
            <h1 class="modal-title">您还未登录</h1>
            <p class="modal-subtitle">登录后享受更强大的提示词生成功能</p>
          </div>

          <div class="benefits-section">
            <div class="benefit-item">
              <CheckCircleOutlined class="benefit-icon" />
              <span>高级AI提示词生成</span>
            </div>
            <div class="benefit-item">
              <CheckCircleOutlined class="benefit-icon" />
              <span>个性化提示词推荐</span>
            </div>
            <div class="benefit-item">
              <CheckCircleOutlined class="benefit-icon" />
              <span>历史记录保存</span>
            </div>
            <div class="benefit-item">
              <CheckCircleOutlined class="benefit-icon" />
              <span>批量生成功能</span>
            </div>
            <div class="benefit-item">
              <CheckCircleOutlined class="benefit-icon" />
              <span>专业级摄影参数配置</span>
            </div>
          </div>

          <div class="action-buttons">
            <button @click="handleLogin" class="login-btn">
              <UserOutlined />
              立即登录
            </button>
            <button @click="closeModal" class="cancel-btn">
              稍后再说
            </button>
          </div>

          <div class="signup-link">
            还没有账户？
            <a @click="goToSignup">立即注册</a>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import {
  CloseOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  UserOutlined,
} from '@ant-design/icons-vue'

interface Props {
  visible?: boolean
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'login'): void
  (e: 'signup'): void
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
})

const emit = defineEmits<Emits>()

const isVisible = ref(props.visible)

// 监听 props.visible 的变化
watch(
  () => props.visible,
  (newVal) => {
    isVisible.value = newVal
  },
)

const closeModal = () => {
  isVisible.value = false
  emit('update:visible', false)
}

const handleLogin = () => {
  closeModal()
  emit('login')
}

const goToSignup = () => {
  closeModal()
  emit('signup')
}
</script>

<style scoped>
.login-prompt-modal-overlay {
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

.icon-wrapper {
  margin-bottom: 16px;
}

.warning-icon {
  font-size: 48px;
  color: #ffa940;
  filter: drop-shadow(0 0 8px rgba(255, 169, 64, 0.3));
}

.modal-title {
  font-size: 28px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 8px 0;
  background: linear-gradient(135deg, #ffa940, #ff7a45);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.modal-subtitle {
  font-size: 14px;
  color: #888;
  margin: 0;
  font-weight: 400;
}

.benefits-section {
  margin-bottom: 32px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  font-size: 14px;
  color: #dcdcdc;
}

.benefit-item:last-child {
  margin-bottom: 0;
}

.benefit-icon {
  color: #52c41a;
  font-size: 16px;
  flex-shrink: 0;
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.login-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: linear-gradient(135deg, #1890ff, #1ac49f);
  border: none;
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.login-btn:hover {
  background: linear-gradient(135deg, #40a9ff, #3dd1b1);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(24, 144, 255, 0.3);
}

.cancel-btn {
  flex: 1;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #888;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #dcdcdc;
  border-color: rgba(255, 255, 255, 0.2);
}

.signup-link {
  text-align: center;
  font-size: 13px;
  color: #888;
}

.signup-link a {
  color: #18d5ff;
  text-decoration: none;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.3s ease;
}

.signup-link a:hover {
  color: #40d5ff;
  text-decoration: underline;
}

/* 过渡动画 */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-to,
.modal-fade-leave-from {
  opacity: 1;
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

  .modal-header {
    margin-bottom: 24px;
  }

  .action-buttons {
    flex-direction: column;
  }

  .benefit-item {
    font-size: 13px;
  }
}
</style>