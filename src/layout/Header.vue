<template>
  <div class="header-container">
    <!-- 头部左侧 -->
    <div class="header-left">
      <a-button type="text" class="trigger" @click="toggleCollapse">
        <MenuUnfoldOutlined v-if="collapsed" />
        <MenuFoldOutlined v-else />
      </a-button>
    </div>
    <!-- 头部右侧 -->
    <div class="header-right">
      <a-dropdown>
        <a class="user-info" @click.prevent>
          <a-avatar :src="avatar" :size="32" shape="square" class="user-avatar">
         
          </a-avatar>
          <OnlineDot style="margin-left: -8px;margin-top: 25px;" :online="isOnline" title="用户在线" />
          <span class="username">{{ username }}</span>
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
  <a-modal v-model:open="showProfileModal" title="个人中心" ok-text="确定" cancel-text="取消" 
    @ok="handleProfileSave" :confirmLoading="profileLoading" width="600px">
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
// 获取头像
const avatar = computed(() => {
  const user = authStore.user
  if(user?.avatarUrl != null ){
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
}
</style>
