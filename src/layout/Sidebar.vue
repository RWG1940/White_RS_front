<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { appConfig } from '@/config'
import { menuConfig, filterMenuByRole } from '@/config/menu'
import { useAuthStore } from '@/stores/auth-store'

defineProps<{
  collapsed: boolean
}>()

const router = useRouter()
const route = useRoute()

const authStore = useAuthStore()

// 将后端返回的角色统一成字符串数组，方便比较
const roleValues = computed(() => (authStore.user?.roles || []).map((r: any) => String(r)))

// 根据角色过滤菜单
const filteredMenuItems = computed(() => {
  return filterMenuByRole(menuConfig, roleValues.value)
})

const selectedKeys = computed(() => [route.path])
const openKeys = computed(() => {
  // 根据当前路由自动展开父菜单（使用过滤后的菜单）
  const path = route.path
  const keys: string[] = []
  filteredMenuItems.value.forEach((item) => {
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
      <h1 v-if="!collapsed" class="logo-text">{{ appConfig.siteTitle }}</h1>
      <h1 v-else class="logo-text-mini">{{ appConfig.siteTitle[0] }}</h1>
    </div>
    <a-menu
      :selectedKeys="selectedKeys"
      :openKeys="openKeys"
      mode="inline"
      theme="dark"

      @click="handleMenuClick"
    >
      <a-menu-item v-for="item in filteredMenuItems" :key="item.key">
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
  border-radius: 5px;
}

.logo-text {
  margin: 15%;
  color: #fff;
  font-size: 20px;
  font-weight: 600;
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
