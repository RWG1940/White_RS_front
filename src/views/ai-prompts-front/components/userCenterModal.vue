<template>
  <transition name="modal-fade">
    <div v-if="isVisible" class="user-center-modal-overlay">
      <div class="modal-blur-bg" @click="closeModal"></div>
      <div class="modal-container">
        <button class="close-btn" @click="closeModal">
          <CloseOutlined />
        </button>

        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title">个人中心</h1>
          </div>

          <!-- 显示用户基本信息的状态 -->
          <div v-if="!isEditing" class="user-info-section">
            <!-- 用户头像 -->
            <div class="avatar-section">
              <img v-if="user?.avatarUrl" :src="avatar" :alt="user.username" class="user-avatar" />
              <div v-else class="user-avatar-placeholder">
                <UserOutlined />
              </div>
            </div>

            <!-- 用户基本信息 -->
            <div class="user-details">
              <div class="detail-item">
                <span class="detail-label">用户名</span>
                <span class="detail-value">{{ user?.username }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">邮箱</span>
                <span class="detail-value">{{ user?.email || '未设置' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">手机</span>
                <span class="detail-value">{{ user?.phone || '未设置' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">用户ID</span>
                <span class="detail-value">{{ user?.userId }}</span>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="action-buttons">
              <a-button type="primary" block @click="startEditing">
                <template #icon>
                  <EditOutlined />
                </template>
                编辑个人信息
              </a-button>
              <button class="logout-btn" @click="handleLogout">
                <LogoutOutlined />
                <span>退出登录</span>
              </button>
            </div>
          </div>

          <!-- 编辑模式 -->
          <div v-else class="edit-section">
            <!-- 标签页 -->
            <a-tabs v-model:activeKey="activeTab">
              <!-- 基本信息标签 -->
              <a-tab-pane key="info" tab="基本信息">
                <div class="tab-content">
                  <div class="form-item">
                    <label class="form-label">用户名</label>
                    <a-input v-model:value="profileForm.username" placeholder="请输入用户名" disabled />
                  </div>
                  <div class="form-item">
                    <label class="form-label">邮箱</label>
                    <a-input v-model:value="profileForm.email" type="email" placeholder="请输入邮箱" />
                  </div>
                  <div class="form-item">
                    <label class="form-label">手机号</label>
                    <a-input v-model:value="profileForm.phone" placeholder="请输入手机号" />
                  </div>
                </div>
              </a-tab-pane>

              <!-- 修改密码标签 -->
              <a-tab-pane key="password" tab="修改密码">
                <div class="tab-content">
                  <div class="form-item">
                    <label class="form-label">原密码</label>
                    <a-input-password v-model:value="passwordForm.oldPassword" placeholder="请输入原密码" />
                  </div>
                  <div class="form-item">
                    <label class="form-label">新密码</label>
                    <a-input-password v-model:value="passwordForm.newPassword" placeholder="请输入新密码" />
                  </div>
                  <div class="form-item">
                    <label class="form-label">确认密码</label>
                    <a-input-password v-model:value="passwordForm.confirmPassword" placeholder="请确认新密码" />
                  </div>
                </div>
              </a-tab-pane>
            </a-tabs>

            <!-- 编辑模式下的操作按钮 -->
            <div class="action-buttons">
              <a-button type="primary" block @click="handleSaveOrChangePassword" :loading="loading">
                <template #icon>
                  <EditOutlined v-if="activeTab === 'info'" />
                  <LockOutlined v-else />
                </template>
                {{ activeTab === 'info' ? '保存信息' : '修改密码' }}
              </a-button>
              <a-button block @click="cancelEditing">
                取消
              </a-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, watch, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth-store'
import { message } from 'ant-design-vue'
import { CloseOutlined, UserOutlined, EditOutlined, LogoutOutlined, LockOutlined } from '@ant-design/icons-vue'
import { getBackendUrl } from '@/utils/getApiUrl'
import { changePassword } from '@/api/services/auth-api'
import { userStore } from '@/stores/user-store'

interface Props {
  visible?: boolean
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'logout'): void
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
})

const emit = defineEmits<Emits>()

const router = useRouter()
const authStore = useAuthStore()

const isVisible = ref(props.visible)
const user = ref(authStore.user)
const activeTab = ref('info')
const loading = ref(false)
const isEditing = ref(false)

const profileForm = reactive({
  username: '',
  email: '',
  phone: '',
})

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

// 监听 props.visible 的变化
watch(
  () => props.visible,
  (newVal) => {
    isVisible.value = newVal
    if (newVal && authStore.user) {
      // 初始化表单数据
      profileForm.username = authStore.user.username || ''
      profileForm.email = authStore.user.email || ''
      profileForm.phone = authStore.user.phone || ''
    }
  },
)

// 监听 authStore.user 的变化
watch(
  () => authStore.user,
  (newVal) => {
    user.value = newVal
  },
)

const closeModal = () => {
  isVisible.value = false
  isEditing.value = false
  emit('update:visible', false)
}

// 开始编辑
const startEditing = () => {
  isEditing.value = true
  activeTab.value = 'info'
}

// 取消编辑
const cancelEditing = () => {
  isEditing.value = false
  activeTab.value = 'info'
  // 重置表单
  if (authStore.user) {
    profileForm.username = authStore.user.username || ''
    profileForm.email = authStore.user.email || ''
    profileForm.phone = authStore.user.phone || ''
  }
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
}

// 获取头像
const avatar = computed(() => {
  const user = authStore.user
  if (user?.avatarUrl != null) {
    return getBackendUrl() + user.avatarUrl
  }
  return '../../public/images/default_avatar.jpg'
})

// 保存个人信息
const handleSaveProfile = async () => {
  try {
    loading.value = true
    await userStore.update({
      id: authStore.user!.id,
      username: profileForm.username,
      email: profileForm.email,
      phone: profileForm.phone,
    })
    message.success('个人信息修改成功')
    // 更新本地用户信息
    if (authStore.user) {
      authStore.user.username = profileForm.username
      authStore.user.email = profileForm.email
      authStore.user.phone = profileForm.phone
    }
    isEditing.value = false
  } catch (error: any) {
    message.error(error.response?.data?.message || '操作失败，请重试')
  } finally {
    loading.value = false
  }
}

// 修改密码
const handleChangePassword = async () => {
  // 验证密码
  if (!passwordForm.oldPassword || !passwordForm.newPassword) {
    message.error('请填写所有密码字段')
    return
  }
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    message.error('新密码与确认密码不一致')
    return
  }

  try {
    loading.value = true
    await changePassword({
      id: authStore.user!.id!,
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword,
      confirmPassword: passwordForm.confirmPassword,
    })
    message.success('密码修改成功，请重新登录')
    // 清空表单
    passwordForm.oldPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
    // 关闭弹窗并退出登录
    closeModal()
    await authStore.logout()
    router.push('/login')
  } catch (error: any) {
    message.error(error.response?.data?.message || '操作失败，请重试')
  } finally {
    loading.value = false
  }
}

// 保存或修改密码（统一处理）
const handleSaveOrChangePassword = async () => {
  if (activeTab.value === 'info') {
    await handleSaveProfile()
  } else {
    await handleChangePassword()
  }
}

// 退出登录
const handleLogout = async () => {
  try {
    await authStore.logout()
    message.success({
      content: '已退出登录',
      duration: 2,
    })
    closeModal()
    emit('logout')
    // 刷新页面或跳转
    window.location.reload()
  } catch (error) {
    message.error({
      content: '退出登录失败，请稍后重试',
      duration: 2,
    })
  }
}
</script>

<style scoped>
.user-center-modal-overlay {
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
  margin: 0;
  background: linear-gradient(135deg, #18d5ff, #1890ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.user-info-section {
  margin-bottom: 32px;
}

.edit-section {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.avatar-section {
  text-align: center;
  margin-bottom: 24px;
}

.user-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid rgba(24, 213, 255, 0.3);
}

.user-avatar-placeholder {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(24, 213, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  font-size: 36px;
  color: #18d5ff;
}

.user-details {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 30px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  font-size: 13px;
  color: #aaa;
  font-weight: 500;
}

.detail-value {
  font-size: 14px;
  color: #fff;
  font-weight: 500;
  word-break: break-all;
  max-width: 200px;
  text-align: right;
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

.logout-btn {
  width: 100%;
  padding: 6px 12px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: #aaa;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
  color: #dcdcdc;
}

.logout-btn:active {
  background: rgba(255, 255, 255, 0.08);
}

/* 标签页样式 */
.tab-content {
  padding: 12px 0;
}

.form-item {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  font-size: 13px;
  color: #aaa;
  font-weight: 500;
  margin-bottom: 8px;
}

/* 修改 ant-design 输入框样式 */
:deep(.ant-input),
:deep(.ant-input-password) {
  background-color: rgba(255, 255, 255, 0.05) !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
  color: #fff !important;
}

:deep(.ant-input::placeholder),
:deep(.ant-input-password::placeholder) {
  color: #666 !important;
}

:deep(.ant-input:hover),
:deep(.ant-input-password:hover) {
  border-color: rgba(255, 255, 255, 0.15) !important;
  background-color: rgba(255, 255, 255, 0.08) !important;
}

:deep(.ant-input:focus),
:deep(.ant-input-password:focus) {
  border-color: #18d5ff !important;
  background-color: rgba(24, 213, 255, 0.05) !important;
  box-shadow: 0 0 0 3px rgba(24, 213, 255, 0.1) !important;
}

:deep(.ant-input-password-icon) {
  color: #666;
}

:deep(.ant-input-password-icon:hover) {
  color: #18d5ff;
}

/* 标签页样式 */
:deep(.ant-tabs) {
  color: #fff;
}

:deep(.ant-tabs-tab) {
  color: #aaa !important;
}

:deep(.ant-tabs-tab-active) {
  color: #18d5ff !important;
}

:deep(.ant-tabs-ink-bar) {
  background-color: #18d5ff !important;
}

:deep(.ant-tabs-content) {
  color: #fff !important;
}

/* 进入 / 离开公共配置 */
.modal-fade-enter-active {
  animation: modal-in 1s cubic-bezier(0.22, 1.15, 0.36, 1);
}

.modal-fade-leave-active {
  animation: modal-out 0.35s ease-in;
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

/* 入场动画（弹性） */
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

/* 出场动画（干净利落） */
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

  .detail-value {
    max-width: 150px;
  }
}
</style>
