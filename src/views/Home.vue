<template>
  <div class="home-page">
    <a-card title="在线状态概览" class="status-card">
      <a-row :gutter="[16, 16]" align="middle">
        <a-col :xs="24" :sm="12">
          <div class="status-item">
            <span class="label">我的状态</span>
            <a-tag :color="isOnline ? 'success' : 'red'">
              {{ isOnline ? '在线' : '离线' }}
            </a-tag>
          </div>
        </a-col>
        <a-col :xs="24" :sm="12">
          <div class="status-item">
            <span class="label">在线人数</span>
            <span class="count">{{ onlineCount }}</span>
          </div>
        </a-col>
      </a-row>
      <div class="hint" v-if="!isConnected">
        正在尝试连接在线状态服务...
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth-store'
import {
  OnlineStatusClient,
  fetchOnlineCount,
  checkUserOnline,
} from '@/api/services/websocket-api'

const authStore = useAuthStore()
const onlineCount = ref(1)
const isOnline = ref(false)
const isConnected = ref(false)

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

let countTimer: ReturnType<typeof setInterval> | null = null

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

const refreshSelfStatus = async () => {
  const userId = authStore.user?.userId ?? authStore.user?.id
  if (!userId) return
  try {
    isOnline.value = await checkUserOnline(userId)
  } catch (error) {
    console.error('获取个人在线状态失败:', error)
  }
}

onMounted(async () => {
  if (!authStore.isLoaded) {
    await authStore.init()
  }
  statusClient.connect()
  await refreshOnlineCount()
  await refreshSelfStatus()
  countTimer = setInterval(refreshOnlineCount, 15_000)
})

onUnmounted(() => {
  statusClient.disconnect()
  if (countTimer) {
    clearInterval(countTimer)
  }
})
</script>

<style scoped>
.home-page {
  padding: 16px;
}



.status-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
}

.label {
  color: #7a7a7a;
}

.count {
  font-size: 24px;
  font-weight: 600;
}

.hint {
  margin-top: 12px;
  font-size: 13px;
  color: #fa8c16;
}
</style>