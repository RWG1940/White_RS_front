<template>
  <div class="header-container">
    <!-- 头部左侧 -->
    <div class="header-left">
      <a-button shape="round" type="text" class="trigger" @click="toggleCollapse">
        <MenuUnfoldOutlined v-if="collapsed" />
        <MenuFoldOutlined v-else />
      </a-button>
      <!-- <a-button shape="round" type="text" @click="handleInformModalClick">
        <a-row>
          <a-col>
            <BellOutlined />
          </a-col>
          <a-col style="margin-left: 2px;color:grey;">{{ unreadCount }}</a-col>
        </a-row>
      </a-button> -->

    </div>
    <!-- 头部右侧 -->
    <div class="header-right">
      <a-dropdown>
        <a class="user-info" @click.prevent>
          <a-avatar :src="avatar" :size="32" shape="square" class="user-avatar">

          </a-avatar>
          <OnlineDot style="margin-left: -8px;margin-top: 25px;" :online="isOnline" title="用户在线" />
          <span class="username">{{ isOnline ? username : '您已离线,请重新登录' }}&ensp;
            <CaretDownOutlined />
          </span>

        </a>
        <template #overlay>
          <a-menu>
            <a-menu-item key="profile" @click="handleProfileClick">
              <UserOutlined />
              <span>个人中心</span>
            </a-menu-item>
            <a-menu-item key="logout" @click="handleLogout">
              <LogoutOutlined />
              <span>退出登录</span>
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>

    </div>
  </div>

  <!-- 个人中心弹窗 -->
  <a-modal v-model:open="showProfileModal" title="个人中心" ok-text="确定" cancel-text="取消" @ok="handleProfileSave"
    :confirmLoading="profileLoading" width="600px">
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
            <a-input-password v-model:value="passwordForm.confirmPassword" placeholder="请确认新密码" />
          </a-form-item>
        </a-form>
      </a-tab-pane>
    </a-tabs>
  </a-modal>

  <!-- 通知弹窗 -->
  <transition name="inform-modal">
    <div v-if="informModalVisible" class="informModal">
      <a-row>
        <a-col>
          <a-button type="text" shape="circle" style="margin-left: 8px;" danger @click="informModalVisible = false">
            <CloseOutlined />
          </a-button>
        </a-col>
      </a-row>

      <a-row style="padding: 0 16px;">
        <a-col :span="12">
          <p style="margin: 0; font-size: 26px; font-weight: lighter;">通知中心</p>
        </a-col>
        <a-col :span="12" style="text-align: right;">
          <a-button type="link" size="small" @click="markAllAsRead" :disabled="unreadCount === 0">
            全部已读
          </a-button>
        </a-col>
      </a-row>

      <a-divider style="margin: 12px 0;" />

      <!-- 通知列表 -->
      <div class="notification-list">
        <a-empty v-if="notifications.length === 0" description="暂无通知" />
        
        <div v-else class="notification-items">
          <div v-for="notification in notifications" :key="notification.id" 
               :class="['notification-item', { 'unread': !notification.read }]"
               @click="markAsRead(notification.id)">
            
            <!-- 通知图标 -->
            <div class="notification-icon">
              <InfoCircleOutlined v-if="notification.type === 'info'" style="color: #1890ff;" />
              <ExclamationCircleOutlined v-else-if="notification.type === 'warning'" style="color: #faad14;" />
              <CloseCircleOutlined v-else-if="notification.type === 'error'" style="color: #ff4d4f;" />
              <CheckCircleOutlined v-else-if="notification.type === 'success'" style="color: #52c41a;" />
            </div>
            
            <!-- 通知内容 -->
            <div class="notification-content">
              <div class="notification-title">
                {{ notification.title }}
                <span v-if="!notification.read" class="unread-dot"></span>
              </div>
              <div class="notification-text">{{ notification.content }}</div>
              <div class="notification-time">
                <ClockCircleOutlined style="margin-right: 4px;" />
                {{ notification.time }}
              </div>
            </div>
            
            <!-- 删除按钮 -->
            <div class="notification-actions">
              <a-button type="text" size="small" danger @click.stop="deleteNotification(notification.id)">
                <CloseOutlined />
              </a-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>

</template>
<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth-store'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  UserOutlined,
  CaretDownOutlined,
  BellOutlined,
  CloseOutlined
} from '@ant-design/icons-vue'
import { Modal, message } from 'ant-design-vue'
import OnlineDot from '@/layout/components/onlineDot.vue'
import { onMounted, onUnmounted, ref } from 'vue'
import {
  OnlineStatusClient,
  fetchOnlineCount,
  checkUserOnline,
} from '@/api/services/websocket-api'
import { getBackendUrl } from '@/utils/api'
import { changePassword } from '@/api/services/login-api'
import { userStore } from '@/stores/user-store'
import { CloseCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined, CheckCircleOutlined, InfoCircleOutlined } from '@ant-design/icons-vue'


// 定义props和emit
defineProps<{
  collapsed: boolean
}>()
// 定义emit
const emit = defineEmits<{
  'toggle-collapse': []
}>()

// 个人中心弹窗状态
const showProfileModal = ref(false)
const activeTab = ref('info')
const profileLoading = ref(false)
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

// 通知数据类型
interface Notification {
  id: number
  title: string
  content: string
  type: 'info' | 'warning' | 'error' | 'success'
  time: string
  read: boolean
}

// 假数据
const notifications = ref<Notification[]>([
  {
    id: 1,
    title: '系统更新通知',
    content: '系统将于今晚 22:00-24:00 进行维护更新，期间服务可能会短暂中断。',
    type: 'info',
    time: '2024-01-06 10:30',
    read: false
  },
  {
    id: 2,
    title: '工单处理提醒',
    content: '您有一个新的工单需要处理，请及时查看并处理。',
    type: 'warning',
    time: '2024-01-06 09:15',
    read: false
  },
  {
    id: 3,
    title: '库存预警',
    content: '配件 A-001 库存数量低于安全库存，请及时补充。',
    type: 'error',
    time: '2024-01-05 16:45',
    read: true
  },
  {
    id: 4,
    title: '任务完成通知',
    content: '您提交的报表生成任务已完成，请前往下载。',
    type: 'success',
    time: '2024-01-05 14:20',
    read: true
  },
  {
    id: 5,
    title: '新用户注册',
    content: '新用户 "张三" 已注册成功，请及时审核。',
    type: 'info',
    time: '2024-01-05 11:30',
    read: true
  }
])

// 未读通知数量
const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)

// 标记通知为已读
const markAsRead = (id: number) => {
  const notification = notifications.value.find(n => n.id === id)
  if (notification) {
    notification.read = true
  }
}

// 标记所有通知为已读
const markAllAsRead = () => {
  notifications.value.forEach(n => n.read = true)
}

// 删除通知
const deleteNotification = (id: number) => {
  notifications.value = notifications.value.filter(n => n.id !== id)
}
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
  Modal.confirm({
    title: '确认退出',
    content: '确定要退出登录吗？',
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      await authStore.logout()
      router.push('/login')
    },
  })
}
// 切换侧边栏折叠状态
const toggleCollapse = () => {
  emit('toggle-collapse')
}

// 打开个人中心弹窗
const handleProfileClick = () => {
  if (authStore.user) {
    profileForm.username = authStore.user.username || ''
    profileForm.email = authStore.user.email || ''
    profileForm.phone = authStore.user.phone || ''
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
      // 关闭弹窗并退出登录
      showProfileModal.value = false
      await authStore.logout()
      router.push('/login')
    }

    showProfileModal.value = false
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
    console.error('获取在线人数失败:', error)
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
// 通知弹窗显示开关
const handleInformModalClick = () => {
  informModalVisible.value = !informModalVisible.value
}
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
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: #e6e6e6;
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
