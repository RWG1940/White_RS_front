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
            <a-menu-item key="profile">
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
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth-store'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  UserOutlined,
} from '@ant-design/icons-vue'
import { Modal } from 'ant-design-vue'
import OnlineDot from '@/layout/components/onlineDot.vue'
import { onMounted, onUnmounted, ref } from 'vue'
import {
  OnlineStatusClient,
  fetchOnlineCount,
  checkUserOnline,
} from '@/api/services/websocket-api'
import { getBackendUrl } from '@/utils/api'


// 定义props和emit
defineProps<{
  collapsed: boolean
}>()
// 定义emit
const emit = defineEmits<{
  'toggle-collapse': []
}>()
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
