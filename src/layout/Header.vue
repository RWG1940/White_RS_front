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

defineProps<{
  collapsed: boolean
}>()

const emit = defineEmits<{
  'toggle-collapse': []
}>()

const router = useRouter()
const authStore = useAuthStore()

const username = computed(() => authStore.user?.username || '用户')

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

const toggleCollapse = () => {
  emit('toggle-collapse')
}
</script>

<template>
  <div class="header-container">
    <div class="header-left">
      <a-button type="text" class="trigger" @click="toggleCollapse">
        <MenuUnfoldOutlined v-if="collapsed" />
        <MenuFoldOutlined v-else />
      </a-button>
    </div>

    <div class="header-right">
      <a-dropdown>
        <a class="user-info" @click.prevent>
          <a-avatar :size="40" class="user-avatar">
            <template #icon><UserOutlined /></template>
          </a-avatar>
          <span class="username">{{ username }}</span>
        </a>
        <template #overlay>
          <a-menu>
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
  margin-left: 5%;
  cursor: pointer;
  transition: color 0.3s;
}

.trigger:hover {
  color: #1890ff;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 8%;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  border-radius: 15px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: #f5f5f5;
}

.user-avatar {
  background-color: #1890ff;
}

.username {
  margin-left: 10px;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.85);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .header-container {
    padding: 0 16px;
  }

  .trigger {
    padding: 0 12px;
  }

  .username {
    display: none;
  }
}
</style>
