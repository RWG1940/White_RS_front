<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { HomeOutlined, UserOutlined, SettingOutlined,DesktopOutlined  } from '@ant-design/icons-vue'
import { appConfig } from '@/config'
import { useAuthStore } from '@/stores/auth-store'

defineProps<{
  collapsed: boolean
}>()

const router = useRouter()
const route = useRoute()

const authStore = useAuthStore()

// 菜单配置
const menuItems = ref([
  {
    key: '/',
    icon: HomeOutlined,
    label: '首页',
    title: '首页',
  },
  {
    key: '/youding-workbench',
    icon: DesktopOutlined,
    label: '优鼎工作台',
    title: '优鼎工作台',
  },
  {
    key: '/gendan-workbench',
    icon: DesktopOutlined,
    label: '跟单工作台',
    title: '跟单工作台',
  },
  {
    key: '/factory-workbench',
    icon: DesktopOutlined,
    label: '工厂工作台',
    title: '工厂工作台',
  },
  {
    key: '/accessories-factory-workbench',
    icon: DesktopOutlined,
    label: '辅料工厂工作台',
    title: '辅料工厂工作台',
  },
  {
    key: '/usersManage',
    icon: UserOutlined,
    label: '用户管理',
    title: '用户管理',
  },
  {
    key: '/settingsManage',
    icon: SettingOutlined,
    label: '系统设置',
    title: '系统设置',
  },

])

// 将后端返回的角色统一成字符串数组，方便比较
const roleValues = computed(() => (authStore.user?.roles || []).map((r: any) => String(r)))

// 根据角色过滤菜单：
// 仅含 5293 -> 只显示 优鼎工作台
// 仅含 6666 -> 只显示 辅料工厂工作台
// 仅含 7777 -> 只显示 工厂工作台
// 包含 3294 -> 全部显示
const filteredMenuItems = computed(() => {
  const roles = roleValues.value
  if (!roles || roles.length === 0) return menuItems.value
  // 只要包含 3294 就显示全部
  if (roles.includes('3294')) return menuItems.value
  // 只有单一角色时按要求过滤，但始终保留首页 '/'
  if (roles.length === 1) {
    const r = roles[0]
    const allowedKeys = ['/']
    if (r === '5293') allowedKeys.push('/youding-workbench')
    if (r === '6666') allowedKeys.push('/accessories-factory-workbench')
    if (r === '7777') allowedKeys.push('/factory-workbench')
    if (r === '5555') allowedKeys.push('/gendan-workbench')
    return menuItems.value.filter((i) => allowedKeys.includes(i.key))
  }
  // 其它情况默认显示全部（可根据需要调整为更严格的权限控制）
  return menuItems.value
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
      :inline-collapsed="collapsed"
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
  margin: 10%;
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
