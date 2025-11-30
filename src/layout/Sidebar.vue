<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { HomeOutlined, UserOutlined, SettingOutlined } from '@ant-design/icons-vue'

defineProps<{
  collapsed: boolean
}>()

const router = useRouter()
const route = useRoute()

// 菜单配置
const menuItems = ref([
  {
    key: '/',
    icon: HomeOutlined,
    label: '首页',
    title: '首页',
  },
  {
    key: '/users',
    icon: UserOutlined,
    label: '用户管理',
    title: '用户管理',
  },
  {
    key: '/settings',
    icon: SettingOutlined,
    label: '系统设置',
    title: '系统设置',
  },
])

const selectedKeys = computed(() => [route.path])
const openKeys = computed(() => {
  // 根据当前路由自动展开父菜单
  const path = route.path
  const keys: string[] = []
  menuItems.value.forEach((item) => {
    if (path.startsWith(item.key) && item.key !== '/') {
      keys.push(item.key)
    }
  })
  return keys
})

const handleMenuClick = ({ key }: { key: string }) => {
  router.push(key)
}
</script>

<template>
  <div class="sidebar-container">
    <div class="sidebar-logo">
      <h1 v-if="!collapsed" class="logo-text">WhiteRS-system</h1>
      <h1 v-else class="logo-text-mini">W</h1>
    </div>
    <a-menu
      v-model:selectedKeys="selectedKeys"
      v-model:openKeys="openKeys"
      mode="inline"
      theme="dark"
      :inline-collapsed="collapsed"
      @click="handleMenuClick"
    >
      <a-menu-item v-for="item in menuItems" :key="item.key">
        <template #icon>
          <component :is="item.icon" />
        </template>
        <span>{{ item.label }}</span>
      </a-menu-item>
    </a-menu>
  </div>
</template>

<style scoped>
.sidebar-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.sidebar-logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  margin: 3%;
  border-radius: 15px;
}

.logo-text {
  color: #fff;
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  text-align: center;
}

.logo-text-mini {
  color: #fff;
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  text-align: center;
}
</style>
