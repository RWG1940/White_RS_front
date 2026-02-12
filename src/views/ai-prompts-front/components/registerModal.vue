<template>
  <transition name="modal-fade">
    <div v-if="isVisible" class="register-modal-overlay">
      <div class="modal-blur-bg"></div>
      <div class="modal-container">
        <button class="close-btn" @click="closeModal">
          <CloseOutlined />
        </button>

        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title">创建账户</h1>
            <p class="modal-subtitle">注册新账户以开始使用</p>
          </div>

          <form class="register-form" @submit.prevent="handleRegister">
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

            <!-- 邮箱输入 -->
            <div class="form-group">
              <label for="email" class="form-label">
                <UserOutlined />
                邮箱地址
              </label>
              <input
                id="email"
                v-model="formData.email"
                type="email"
                class="form-input"
                placeholder="请输入邮箱地址"
                required
              />
            </div>

            <!-- 手机号输入 -->
            <div class="form-group">
              <label for="phone" class="form-label">
                <UserOutlined />
                手机号码
              </label>
              <input
                id="phone"
                v-model="formData.phone"
                type="tel"
                class="form-input"
                placeholder="请输入手机号码"
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

            <!-- 确认密码输入 -->
            <div class="form-group">
              <label for="confirmPassword" class="form-label">
                <LockOutlined />
                确认密码
              </label>
              <div class="password-input-wrapper">
                <input
                  id="confirmPassword"
                  v-model="formData.confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  class="form-input"
                  placeholder="请再次输入密码"
                  required
                />
                <button
                  type="button"
                  class="toggle-password-btn"
                  @click="showConfirmPassword = !showConfirmPassword"
                >
                  <EyeOutlined v-if="showConfirmPassword" />
                  <EyeInvisibleOutlined v-else />
                </button>
              </div>
            </div>

            <!-- 用户协议 -->
            <div class="form-footer">
              <label class="agreement">
                <input v-model="formData.agreed" type="checkbox" />
                <span>我已阅读并同意</span>
                <a class="agreement-link" @click="showAgreement">用户协议</a>
                <span>和</span>
                <a class="agreement-link" @click="showPrivacy">隐私政策</a>
              </label>
            </div>

            <!-- 注册按钮 -->
            <button type="submit" class="register-btn" :disabled="isLoading">
              <span v-if="!isLoading">注册</span>
              <span v-else class="loading-spinner">
                <LoadingOutlined />
              </span>
            </button>
          </form>

          <!-- 第三方注册 -->
          <div class="divider">
            <span>或使用以下方式注册</span>
          </div>

          <div class="social-register">
            <button class="social-btn wechat" title="微信注册">
              <WechatOutlined />
            </button>
            <button class="social-btn alipay" title="支付宝注册">
              <AlipayOutlined />
            </button>
            <button class="social-btn qq" title="QQ注册">
              <QqOutlined />
            </button>
          </div>

          <!-- 登录链接 -->
          <div class="login-link">已有账户？<a @click.prevent="goToLogin">立即登录</a></div>
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
  (e: 'login'): void
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
})

const emit = defineEmits<Emits>()

const router = useRouter()
const authStore = useAuthStore()

const isVisible = ref(props.visible)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const isLoading = ref(false)

const formData = ref({
  username: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  agreed: false,
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

const validateForm = () => {
  if (!formData.value.username.trim()) {
    message.warning('请输入用户名')
    return false
  }
  
  if (!formData.value.email.trim()) {
    message.warning('请输入邮箱地址')
    return false
  }
  
  // 简单的邮箱格式验证
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(formData.value.email)) {
    message.warning('请输入有效的邮箱地址')
    return false
  }
  
  if (!formData.value.phone.trim()) {
    message.warning('请输入手机号码')
    return false
  }
  
  // 简单的手机号格式验证
  const phoneRegex = /^1[3-9]\d{9}$/
  if (!phoneRegex.test(formData.value.phone)) {
    message.warning('请输入有效的手机号码')
    return false
  }
  
  if (!formData.value.password) {
    message.warning('请输入密码')
    return false
  }
  
  if (formData.value.password.length < 6) {
    message.warning('密码长度不能少于6位')
    return false
  }
  
  if (formData.value.password !== formData.value.confirmPassword) {
    message.warning('两次输入的密码不一致')
    return false
  }
  
  if (!formData.value.agreed) {
    message.warning('请同意用户协议和隐私政策')
    return false
  }
  
  return true
}

const handleRegister = async () => {
  if (!validateForm()) {
    return
  }

  isLoading.value = true

  try {
    // 调用注册API
    const result = await authStore.register({
      username: formData.value.username,
      email: formData.value.email,
      phone: formData.value.phone,
      password: formData.value.password,
    })

    if (result && result.success) {
      // 注册成功后自动登录
      const loginResult = await authStore.login({
        username: formData.value.username,
        password: formData.value.password,
      })

      if (loginResult && loginResult.success) {
        // 登录成功提示
        message.success({
          content: '注册成功，已自动登录',
          duration: 2,
        })

        // 注册登录成功后关闭弹窗
        closeModal()
        // 重置表单
        formData.value = {
          username: '',
          email: '',
          phone: '',
          password: '',
          confirmPassword: '',
          agreed: false,
        }

        // 延迟后刷新页面或跳转到首页
        setTimeout(() => {
          window.location.reload()
        }, 500)
      } else {
        // 登录失败，提示用户手动登录
        message.success({
          content: '注册成功，请手动登录',
          duration: 2,
        })

        closeModal()
        // 重置表单
        formData.value = {
          username: '',
          email: '',
          phone: '',
          password: '',
          confirmPassword: '',
          agreed: false,
        }

        // 延迟后触发登录弹窗
        setTimeout(() => {
          emit('login')
        }, 500)
      }
    } else {
      // 注册失败提示
      message.error({
        content: '注册失败，请检查输入信息',
        duration: 2,
      })
    }
  } catch (error) {
    console.error('注册请求失败:', error)
    message.error({
      content: '注册请求失败，请稍后重试',
      duration: 2,
    })
  } finally {
    isLoading.value = false
  }
}

const goToLogin = () => {
  closeModal()
  emit('login')
}

const showAgreement = () => {
  message.info('用户协议页面正在开发中')
}

const showPrivacy = () => {
  message.info('隐私政策页面正在开发中')
}
</script>

<style scoped>
.register-modal-overlay {
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
  max-width: 450px;
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

.register-form {
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 16px;
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
  margin-bottom: 20px;
  font-size: 12px;
}

.agreement {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  color: #aaa;
  transition: color 0.3s ease;
  flex-wrap: wrap;
}

.agreement input {
  width: 14px;
  height: 14px;
  cursor: pointer;
  accent-color: #18d5ff;
}

.agreement:hover {
  color: #dcdcdc;
}

.agreement-link {
  color: #18d5ff;
  text-decoration: none;
  transition: color 0.3s ease;
  cursor: pointer;
}

.agreement-link:hover {
  color: #40d5ff;
  text-decoration: underline;
}

.register-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #1ac49f, #1890ff);
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

.register-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #3dd1b1, #40a9ff);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(24, 144, 255, 0.3);
}

.register-btn:active:not(:disabled) {
  transform: translateY(0);
}

.register-btn:disabled {
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

.social-register {
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

.login-link {
  text-align: center;
  font-size: 13px;
  color: #888;
}

.login-link a {
  color: #18d5ff;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
  cursor: pointer;
}

.login-link a:hover {
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

  .social-register {
    gap: 8px;
  }

  .social-btn {
    width: 40px;
    height: 40px;
    font-size: 16px;
  }
}
</style>