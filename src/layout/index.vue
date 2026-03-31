<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Header from './Header.vue'
import Docker from './docker.vue'
import { menuConfig, filterMenuByRole } from '@/config/menu'
import { useAuthStore } from '@/stores/auth-store'


const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// 将后端返回的角色统一成字符串数组，方便比较
const roleValues = computed(() => (authStore.user?.roles || []).map((r: any) => String(r)))

// 根据角色过滤菜单项
const filteredMenuItems = computed(() => {
  const items = filterMenuByRole(menuConfig, roleValues.value)
  // 将菜单项转换为 docker 组件所需的格式
  return items.map((item) => ({
    label: item.label,
    value: item.key,
    icon: item.icon?.name?.toLowerCase() || 'home',
  }))
})

// 当前选中的菜单项
const selectedValue = ref('/')

// 处理菜单项选择
const handleMenuChange = (value: string) => {
  if (value !== route.path) {
    router.push(value)
  }
}

// 监听路由变化，同步选中的菜单项
import { watch } from 'vue'
watch(
  () => route.path,
  (newPath) => {
    selectedValue.value = newPath
  },
  { immediate: true },
)
</script>

<template>
  <a-layout class="layout-container">
    <!-- 主内容区 -->
    <a-layout class="layout-main">
      <!-- 头部 -->
      <a-layout-header class="layout-header">
        <Header />
      </a-layout-header>

      <!-- 内容区 -->
      <a-layout-content class="layout-content">
        <!-- 页面内容：使用 router-view 插槽配合 transition 实现页面切换动画 -->

        <router-view v-slot="{ Component, route }">
          <transition name="m-trans" mode="out-in">
          
              <component class="content-wrapper" :is="Component" :key="route.fullPath" />
         
          </transition>
        </router-view>
      </a-layout-content>
    </a-layout>

    <!-- 底部 Docker 菜单 -->
    <transition name="toggle-bar" appear>
      <div class="toggle-container">
        <Docker v-model="selectedValue" :items="filteredMenuItems" @change="handleMenuChange" />
      </div>
    </transition>
  </a-layout>
</template>

<style scoped>
.layout-container {
  min-height: 100vh;
  position: relative;
}

.layout-main {
  min-height: 100vh; /* 为底部菜单留出空间 */
  background-color: #ededed;
}

.layout-header {
  background: #ffffff00;
  padding: 0;
  border-radius: 20px;
  margin: 8px;
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  z-index: 100;
}

.layout-content {
  margin: 64px 0 0 0; /* 顶部为头部留空间，底部为菜单留空间 */
  background: #f0f2f500;
}

.content-wrapper {
  background: #ffffff;
  padding: 1%;
  margin: 15px;
  border-radius: 25px;
  height: calc(100vh - 100px); /* 调整高度适应新布局 */
  position: relative;
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.08),
    /* 微弱的底部阴影 */ 0 4px 10px rgba(134, 134, 134, 0.1),
    /* 更强的阴影 */ 0 8px 24px rgba(225, 225, 225, 0.1); /* 扩展阴影 */
 

  
}

.m-trans-enter-active,
.m-trans-leave-active {
  transition:
    opacity 0.4s ease,
    transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.m-trans-enter-from {
  opacity: 0;
  transform: translateX(-10px) scale(0.94);
}

.m-trans-leave-to {
  opacity: 0;
  transform: translateX(10px) scale(0.94);
}

.content-wrapper {
  scrollbar-color: #d6d6d6 #ffffff;
}

@media (max-width: 768px) {
  .layout-content {
    margin: 64px 0 80px 0;
  }

  .content-wrapper {
    padding: 10px;
    height: calc(100vh - 168px);
  }
}

.toggle-container {
  position: fixed;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  background: rgba(255, 255, 255, 0);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 8px;
  overflow-x:auto;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.15),
    0 0 0 1px rgba(255, 255, 255, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.3);
}
/* 切换栏动画 */
/* ================= Toggle Bar · Vision Pro 弹性动画 ================= */

.toggle-bar-enter-active {
  animation: toggleBarIn 1s forwards;
  will-change: transform, opacity;
}

/* 初始状态 */
.toggle-bar-enter-from {
  opacity: 0;
  transform: translateY(40px) translateX(-50%) scale(0.96);
}

.toggle-bar-enter-to {
  opacity: 1;
  transform: translateY(0) translateX(-50%) scale(1);
}

/* 🎯 核心弹性动画 */
@keyframes toggleBarIn {
  0% {
    opacity: 0;
    transform: translateY(40px) translateX(-50%) scale(0.96);
  }

  55% {
    opacity: 1;
    transform: translateY(-6px) translateX(-50%) scale(1.02);
  }

  75% {
    transform: translateY(3px) translateX(-50%) scale(0.995);
  }

  100% {
    transform: translateY(0) translateX(-50%) scale(1);
  }
}
</style>
