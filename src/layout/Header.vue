<template>
  <div class="header-container">
    <!-- 头部左侧 -->
    <div class="header-left">
      <div class="site-title-container">
        <div class="site-title">
          <span class="title-main">{{ appConfig.siteTitle }}</span>
        </div>
      </div>
    </div>
    <!-- 头部右侧 -->
    <div class="header-right">
      <div class="user-dropdown-container">
        <a class="user-info" @click.prevent>
          <a-avatar :src="avatar" :size="32" shape="" class="user-avatar"> </a-avatar>
          <OnlineDot
            style="margin-left: -8px; margin-top: 25px"
            :online="isOnline"
            title="用户在线"
          />
          <span class="username">{{ isOnline ? username : '您已离线,请重新登录' }}&ensp; </span>
        </a>
        <!-- 悬浮菜单 -->
        <div class="user-menu-dropdown">
          <div class="menu-item" @click="handleProfileClick">
            <UserOutlined />
            <span>个人中心</span>
          </div>
          <div class="menu-divider"></div>
          <div class="menu-item" @click="handleLogout">
            <LogoutOutlined />
            <span>退出登录</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 个人中心弹窗 -->
  <Modal
    v-model:visible="showProfileModal"
    title="个人中心"
    :loading="profileLoading"
    @confirm="handleProfileSave"
  >
    <a-tabs v-model:activeKey="activeTab">
      <!-- 基本信息标签 -->
      <a-tab-pane key="info" tab="基本信息">
        <a-form layout="vertical" :model="profileForm">
          <a-form-item label="用户名" disbled>
            <a-input v-model:value="profileForm.username" placeholder="请输入用户名" disabled />
          </a-form-item>
          <a-form-item label="邮箱">
            <a-input v-model:value="profileForm.email" type="email" placeholder="请输入邮箱" />
          </a-form-item>
          <a-form-item label="手机号">
            <a-input v-model:value="profileForm.phone" placeholder="请输入手机号" />
          </a-form-item>
          <a-form-item label="地址">
            <a-textarea v-model:value="profileForm.address" placeholder="请输入地址" />
          </a-form-item>
        </a-form>
      </a-tab-pane>

      <!-- 修改密码标签 -->
      <a-tab-pane key="password" tab="修改密码">
        <a-form layout="vertical" :model="passwordForm">
          <a-form-item label="原密码" required>
            <a-input-password v-model:value="passwordForm.oldPassword" placeholder="请输入原密码" />
          </a-form-item>
          <a-form-item label="新密码" required>
            <a-input-password v-model:value="passwordForm.newPassword" placeholder="请输入新密码" />
          </a-form-item>
          <a-form-item label="确认密码" required>
            <a-input-password
              v-model:value="passwordForm.confirmPassword"
              placeholder="请确认新密码"
            />
          </a-form-item>
        </a-form>
      </a-tab-pane>
    </a-tabs>
  </Modal>

  <!-- 退出登录确认弹窗 -->
  <Modal
    v-model:visible="showLogoutConfirm"
    title="确认退出"
    @confirm="confirmLogout"
  >
    <div style="text-align: center; padding: 20px 0">
      <p style="font-size: 16px; color: #262626">确定要退出登录吗？</p>
    </div>
  </Modal>
</template>
<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth-store'
import { LogoutOutlined, UserOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import OnlineDot from '@/layout/components/onlineDot.vue'
import Modal from '@/components/Modal.vue'
import { onMounted, onUnmounted, ref } from 'vue'
import { OnlineStatusClient, fetchOnlineCount, checkUserOnline } from '@/api/services/websocket-api'
import { getBackendUrl } from '@/utils/getApiUrl'
import { changePassword } from '@/api/services/auth-api'
import { userStore } from '@/stores/user-store'
import { appConfig } from '@/config'
import { refreshAllSupplyDataAddress } from '@/stores/acc-store'

// 个人中心弹窗状态
const showProfileModal = ref(false)
const activeTab = ref('info')
const profileLoading = ref(false)
const showLogoutConfirm = ref(false)
const profileForm = reactive({
  username: '',
  email: '',
  phone: '',
  address: '',
})
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

// 获取用户信息
const authStore = useAuthStore()
// 在线人数
const onlineCount = ref(1)
// 用户在线状态
const isOnline = ref(false)
// 在线状态连接状态
const isConnected = ref(false)
// 创建router实例
const router = useRouter()
// 获取用户名
const username = computed(() => authStore.user?.username || '用户')
// 通知弹窗状态
const informModalVisible = ref(false)

// 获取头像
const avatar = computed(() => {
  const user = authStore.user
  if (user?.avatarUrl != null) {
    return getBackendUrl() + user.avatarUrl
  }
  return '../../public/images/default_avatar.jpg'
})
// 退出登录
const handleLogout = () => {
  showLogoutConfirm.value = true
}

// 确认退出登录
const confirmLogout = async () => {
  showLogoutConfirm.value = false
  await authStore.logout()
  router.push('/login')
}

// 打开个人中心弹窗
const handleProfileClick = () => {
  if (authStore.user) {
    profileForm.username = authStore.user.username || ''
    profileForm.email = authStore.user.email || ''
    profileForm.phone = authStore.user.phone || ''
    try {
      const profile = authStore.user.profile ? JSON.parse(authStore.user.profile) : {}
      profileForm.address = profile.address || ''
    } catch (e) {
      profileForm.address = authStore.user.profile || ''
    }
    activeTab.value = 'info'
    showProfileModal.value = true
  }
}

// 保存个人信息或修改密码
const handleProfileSave = async () => {
  try {
    profileLoading.value = true

    if (activeTab.value === 'info') {
      // 保存基本信息
      await userStore.updateN({
        id: authStore.user!.id,
        username: profileForm.username,
        email: profileForm.email,
        phone: profileForm.phone,
        profile: JSON.stringify({ address: profileForm.address }),
      })
      // 更新本地用户信息
      if (authStore.user) {
        authStore.user.username = profileForm.username
        authStore.user.email = profileForm.email
        authStore.user.phone = profileForm.phone
        authStore.user.profile = JSON.stringify({ address: profileForm.address })
      }
      // 如果地址变化了，刷新所有辅料数据的地址信息
      await refreshAllSupplyDataAddress(profileForm.username, profileForm.address)
      message.success('保存成功')
    } else if (activeTab.value === 'password') {
      // 修改密码
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        message.error('新密码与确认密码不一致')
        return
      }
      if (!passwordForm.oldPassword || !passwordForm.newPassword) {
        message.error('请填写所有密码字段')
        return
      }
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
      // 退出登录
      await authStore.logout()
      router.push('/login')
    }
  } catch (error: any) {
    message.error(error.response?.data?.message || '操作失败，请重试')
  } finally {
    profileLoading.value = false
  }
}

// 在线状态客户端
const statusClient = new OnlineStatusClient({
  onConnected: () => {
    isConnected.value = true
    isOnline.value = true
  },
  onDisconnected: () => {
    isConnected.value = false
    isOnline.value = false
  },
  onReconnect: () => {
    isConnected.value = false
  },
})
// 定时刷新在线人数和用户在线状态
let countTimer: ReturnType<typeof setInterval> | null = null
// 刷新在线人数
const refreshOnlineCount = async () => {
  try {
    onlineCount.value = await fetchOnlineCount()
    if (onlineCount.value == 0) {
      onlineCount.value = 1
    }
  } catch (error) {
    router.push('/login')
  }
}
// 刷新用户在线状态
const refreshSelfStatus = async () => {
  const userId = authStore.user?.userId ?? authStore.user?.id
  if (!userId) return
  try {
    isOnline.value = await checkUserOnline(userId)
  } catch (error) {
    console.error('获取个人在线状态失败:', error)
  }
}
// 初始化
onMounted(async () => {
  if (!authStore.isLoaded) {
    await authStore.init()
  }
  statusClient.connect()
  await refreshOnlineCount()
  await refreshSelfStatus()
  countTimer = setInterval(refreshOnlineCount, 15_000)
})
// 销毁
onUnmounted(() => {
  statusClient.disconnect()
  if (countTimer) {
    clearInterval(countTimer)
  }
})
</script>
<style scoped>
.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
}

.site-title-container {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: 10px;
}

.site-title {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1.2;
}

.title-main {
  font-size: 30px;
  font-family: 黑体;
  font-weight: 600;
  color: #1890ff;
  background: linear-gradient(60deg, #1a4dc4e1 100%, #189fff77 0%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 2px 4px rgba(24, 144, 255, 0.1);
  letter-spacing: -0.5px;
}

.trigger {
  cursor: pointer;
  transition: color 0.3s;
  margin-left: 10px;
}

.trigger:hover {
  color: #1890ff;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
  background-color: white;
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.08),
    /* 微弱的底部阴影 */ 0 4px 10px rgba(0, 0, 0, 0.1),
    /* 更强的阴影 */ 0 8px 24px rgba(0, 0, 0, 0.024); /* 扩展阴影 */
  border-radius: 20px;
}

.user-info {
  border-radius: 20px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: #e6e6e6;
  border-radius: 20px;
}

.user-avatar {
  margin-left: 10px;
  background-color: #1890ff;
}

.username {
  margin-left: 10px;
  margin-right: 10px;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.85);
  font-weight: bold;
}

/* 用户下拉菜单容器 */
.user-dropdown-container {
  position: relative;
}

/* 悬浮菜单 - iOS/Vision Pro 风格 */
.user-menu-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 5px;
  min-width: 180px;
  background: rgba(255, 255, 255, 0);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 20px;
  box-shadow:
    0 8px 32px 0 rgba(31, 38, 135, 0.15),
    0 0 0 1px rgba(255, 255, 255, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px) scale(0.95);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  z-index: 1000;
}

/* 菜单项 */
.menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 2px 16px;
  cursor: pointer;
  color: rgba(0, 0, 0, 0.85);
  font-size: 14px;
  transition: all 0.2s ease;
  background: rgba(255, 255, 255, 0);
  backdrop-filter: blur(10px);
}

.menu-item:first-child {
  border-radius: 12px 12px 0 0;
}

.menu-item:last-child {
  border-radius: 0 0 12px 12px;
}

.menu-item:hover {
  background: rgba(193, 193, 193, 0.15);
  backdrop-filter: blur(10px);
  color: #000000;
}

/* 菜单分割线 */
.menu-divider {
  height: 1px;
  background: rgba(0, 0, 0, 0.08);
  margin: 0;
}

/* 鼠标悬浮时显示菜单 */
.user-dropdown-container:hover .user-menu-dropdown {
  opacity: 1;
  visibility: visible;
  transform: translateY(0) scale(1);
}

.informModal {
  background-color: rgba(255, 255, 255, 0.222);
  border-radius: 5px;
  position: absolute;
  backdrop-filter: blur(15px);
  width: 30%;
  height: 80vh;
  margin: 10px;
  box-shadow: 1px 1px 5px rgb(183, 183, 183);
}

.inform-modal-enter-from {
  opacity: 0;
  transform: translateX(-80px) scale(0.9);
}

.inform-modal-enter-to {
  opacity: 1;
  transform: translateX(0) scale(1);
}

.inform-modal-leave-from {
  opacity: 1;
  transform: translateX(0) scale(1);
}

.inform-modal-leave-to {
  opacity: 0;
  transform: translateX(-40px) scale(0.95);
}

.inform-modal-enter-active {
  transition:
    transform 0.35s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.25s ease;
}

.inform-modal-leave-active {
  transition:
    transform 0.25s ease-in,
    opacity 0.2s ease;
}

/* 通知列表样式 */
.notification-list {
  height: calc(80vh - 160px);
  overflow-y: auto;
  padding: 0 10px;
}

.notification-items {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  padding: 10px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.notification-item:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateX(5px);
}

.notification-item.unread {
  background: rgba(24, 144, 255, 0.1);
  border-color: rgba(24, 144, 255, 0.3);
}

.notification-icon {
  flex-shrink: 0;
  margin-right: 12px;
  font-size: 16px;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-weight: 500;
  font-size: 18px;
  color: #434343;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.notification-text {
  font-size: 14px;
  color: rgba(66, 66, 66, 0.8);
  line-height: 1.4;
}

.notification-time {
  font-size: 11px;
  color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
}

.unread-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  background: #ff4d4f;
  border-radius: 50%;
  margin-left: 8px;
}

.notification-actions {
  flex-shrink: 0;
  margin-left: 8px;
}

/* 滚动条样式 */
.notification-list::-webkit-scrollbar {
  width: 4px;
}

.notification-list::-webkit-scrollbar-track {
  background: rgb(221, 221, 221);
  border-radius: 2px;
}

.notification-list::-webkit-scrollbar-thumb {
  background: rgb(115, 115, 115);
  border-radius: 2px;
}

.notification-list::-webkit-scrollbar-thumb:hover {
  background: rgb(62, 62, 62);
}
</style>
