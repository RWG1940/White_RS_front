<template>
  <transition name="modal-fade">
    <div v-if="isVisible" class="login-modal-overlay">
      <div class="modal-blur-bg"></div>
      <div class="modal-container">
        <button class="close-btn" @click="closeModal">
          <CloseOutlined />
        </button>

        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title">欢迎回来</h1>
            <p class="modal-subtitle">登录您的账户以继续</p>
          </div>

          <form class="login-form" @submit.prevent="handleLogin">
            <!-- 用户名输入 -->
            <div class="form-group">
              <label for="username" class="form-label">
                <UserOutlined />
                用户名
              </label>
              <input
                id="username"
                v-model="formData.username"
                type="text"
                class="form-input"
                placeholder="请输入用户名"
                required
              />
            </div>

            <!-- 密码输入 -->
            <div class="form-group">
              <label for="password" class="form-label">
                <LockOutlined />
                密码
              </label>
              <div class="password-input-wrapper">
                <input
                  id="password"
                  v-model="formData.password"
                  :type="showPassword ? 'text' : 'password'"
                  class="form-input"
                  placeholder="请输入密码"
                  required
                />
                <button
                  type="button"
                  class="toggle-password-btn"
                  @click="showPassword = !showPassword"
                >
                  <EyeOutlined v-if="showPassword" />
                  <EyeInvisibleOutlined v-else />
                </button>
              </div>
            </div>

            <!-- 记住我和忘记密码 -->
            <div class="form-footer">
              <label class="remember-me">
                <input v-model="formData.rememberMe" type="checkbox" />
                <span>记住我</span>
              </label>
              <a class="forgot-password">忘记密码？</a>
            </div>

            <!-- 登录按钮 -->
            <button type="submit" class="login-btn" :disabled="isLoading">
              <span v-if="!isLoading">登录</span>
              <span v-else class="loading-spinner">
                <LoadingOutlined />
              </span>
            </button>
          </form>

          <!-- 第三方登录 -->
          <div class="divider">
            <span>或使用以下方式登录</span>
          </div>

          <div class="social-login">
            <button class="social-btn wechat" title="微信登录">
              <WechatOutlined />
            </button>
            <button class="social-btn alipay" title="支付宝登录">
              <AlipayOutlined />
            </button>
            <button class="social-btn qq" title="QQ登录">
              <QqOutlined />
            </button>
          </div>

          <!-- 注册链接 -->
          <div class="signup-link">还没有账户？<a @click.prevent="goToSignup">立即注册</a></div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth-store'
import { message } from 'ant-design-vue'
import {
  CloseOutlined,
  UserOutlined,
  LockOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  LoadingOutlined,
  WechatOutlined,
  AlipayOutlined,
  QqOutlined,
} from '@ant-design/icons-vue'

interface Props {
  visible?: boolean
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'signup'): void
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
})

const emit = defineEmits<Emits>()

const router = useRouter()
const authStore = useAuthStore()

const isVisible = ref(props.visible)
const showPassword = ref(false)
const isLoading = ref(false)

const formData = ref({
  username: '',
  password: '',
  rememberMe: false,
})

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

const handleLogin = async () => {
  if (!formData.value.username.trim() || !formData.value.password.trim()) {
    message.warning('请输入用户名和密码')
    return
  }

  isLoading.value = true

  try {
    const result = await authStore.login({
      username: formData.value.username,
      password: formData.value.password,
    })

    if (result && result.success) {
      // 登录成功提示
      message.success({
        content: '登录成功',
        duration: 2,
      })

      // 登录成功后关闭弹窗
      closeModal()
      // 重置表单
      formData.value = {
        username: '',
        password: '',
        rememberMe: false,
      }

      // 延迟后跳转到首页
      setTimeout(() => {
        router.push('/ai-prompts-front').catch((err) => {
          console.error('路由跳转失败:', err)
        })
      }, 500)
    } else {
      // 登录失败提示
      message.error({
        content: '登录失败',
        duration: 2,
      })
    }
  } catch (error) {
    message.error({
      content: '登录请求失败，请稍后重试',
      duration: 2,
    })
  } finally {
    isLoading.value = false
  }
}

const goToSignup = () => {
  closeModal()
  emit('signup')
}
</script>

<style scoped>
.login-modal-overlay {
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
  margin: 0 0 8px 0;
  background: linear-gradient(135deg, #18d5ff, #1890ff);
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

.login-form {
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #aaa;
  font-weight: 500;
  margin-bottom: 8px;
  transition: color 0.3s ease;
}

.form-input {
  width: 100%;
  padding: 11px 14px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.3s ease;
}

.form-input::placeholder {
  color: #666;
}

.form-input:hover {
  border-color: rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.08);
}

.form-input:focus {
  outline: none;
  border-color: #18d5ff;
  background: rgba(24, 213, 255, 0.05);
  box-shadow: 0 0 0 3px rgba(24, 213, 255, 0.1);
}

.password-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input-wrapper .form-input {
  padding-right: 40px;
}

.toggle-password-btn {
  position: absolute;
  right: 12px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: #666;
  font-size: 16px;
  cursor: pointer;
  transition: color 0.3s ease;
}

.toggle-password-btn:hover {
  color: #18d5ff;
}

.form-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  font-size: 13px;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  color: #aaa;
  transition: color 0.3s ease;
}

.remember-me input {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #18d5ff;
}

.remember-me:hover {
  color: #dcdcdc;
}

.forgot-password {
  color: #18d5ff;
  text-decoration: none;
  transition: color 0.3s ease;
}

.forgot-password:hover {
  color: #40d5ff;
  text-decoration: underline;
}

.login-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #1890ff, #1ac49f);
  border: none;
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.login-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #40a9ff, #3dd1b1);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(24, 144, 255, 0.3);
}

.login-btn:active:not(:disabled) {
  transform: translateY(0);
}

.login-btn:disabled {
  background: #555;
  color: #888;
  cursor: not-allowed;
  opacity: 0.7;
}

.loading-spinner {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.divider {
  position: relative;
  margin: 24px 0;
  text-align: center;
  font-size: 12px;
  color: #666;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  width: 100%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
}

.divider span {
  position: relative;
  background: linear-gradient(135deg, #1a1a1a, #252525);
  padding: 0 12px;
}

.social-login {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 20px;
}

.social-btn {
  width: 44px;
  height: 44px;
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

.social-btn:hover {
  border-color: rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.social-btn.wechat:hover {
  color: #09b83e;
  border-color: #09b83e;
  box-shadow: 0 0 12px rgba(9, 184, 62, 0.2);
}

.social-btn.alipay:hover {
  color: #1890ff;
  border-color: #1890ff;
  box-shadow: 0 0 12px rgba(24, 144, 255, 0.2);
}

.social-btn.qq:hover {
  color: #0066cc;
  border-color: #0066cc;
  box-shadow: 0 0 12px rgba(0, 102, 204, 0.2);
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

  .social-login {
    gap: 8px;
  }

  .social-btn {
    width: 40px;
    height: 40px;
    font-size: 16px;
  }
}
</style>
