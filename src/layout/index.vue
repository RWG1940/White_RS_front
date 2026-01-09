<script setup lang="ts">
import { ref, computed } from 'vue'
import Header from './Header.vue'
import Sidebar from './Sidebar.vue'
import Breadcrumb from './Breadcrumb.vue'
import { appConfig } from '@/config'

const collapsed = ref(true)
const bottomText = computed(() => {
  return appConfig.bottomText
})
const toggleCollapse = () => {
  collapsed.value = !collapsed.value
}
</script>

<template>
  <a-layout class="layout-container">
    <!-- 侧边栏 -->
    <a-layout-sider
      v-model:collapsed="collapsed"
      :trigger="null"
      collapsible
      :width="150"
      :collapsed-width="60"
      :class="['layout-sider', { 'layout-sider-collapsed': collapsed }]"
    >
      <Sidebar :collapsed="collapsed" />
    </a-layout-sider>

    <!-- 主内容区 -->
    <a-layout :class="['layout-main', { 'layout-main-collapsed': collapsed }]">
      <!-- 头部 -->
      <a-layout-header class="layout-header">
        <Header :collapsed="collapsed" @toggle-collapse="toggleCollapse" />
      </a-layout-header>

      <!-- 内容区 -->
      <a-layout-content class="layout-content">
        <!-- 面包屑 -->
        <Breadcrumb />

        <!-- 页面内容：使用 router-view 插槽配合 transition 实现页面切换动画 -->
        <div class="content-wrapper">
          <router-view v-slot="{ Component, route }">
            <transition name="m-trans" mode="out-in">
              <component :is="Component" :key="route.fullPath" />
            </transition>
          </router-view>
        </div>
      </a-layout-content>
      <a-layout-footer class="layout-footer"> {{ bottomText }}</a-layout-footer>
    </a-layout>
  </a-layout>
</template>

<style scoped>
.layout-container {
  min-height: 100vh;
}

.layout-sider {
  overflow: auto;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  box-shadow: 2px 0 8px 0 rgba(49, 51, 53, 0.157);
}

.layout-main {
  margin-left: 150px;
  transition: margin-left 0.2s;
}

.layout-main-collapsed {
  margin-left: 60px;
}

.layout-header {
  background: #fff;
  padding: 0;
  box-shadow: 0 2px 8px 0 rgba(29, 35, 41, 0.05);
  position: fixed;
  top: 0;
  right: 0;
  left: 150px;
  z-index: 100;
  transition: left 0.2s;
}

.layout-main-collapsed .layout-header {
  left: 60px;
}

.layout-content {
  margin: 64px 0 0 0;
  padding: 10px;
  background: #f0f2f5;
}

.content-wrapper {
  background: #fff;
  padding: 1%;
  border-radius: 10px;
  /* 减小 footer 后调整内容区高度 */
  height: calc(100vh - 140px);
  /* overflow-y: auto;
  overflow-x: hidden; */
  position: relative; /* 为可能的绝对定位保留上下文 */
}

.m-trans-enter-active,
.m-trans-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.m-trans-enter-from {
  opacity: 0;
  transform: translateX(-10px) scale(0.98);
}

.m-trans-leave-to {
  opacity: 0;
  transform: translateX(10px) scale(0.98);
}


.content-wrapper::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.content-wrapper::-webkit-scrollbar-thumb {
  background: #c1c1c12d;
  border-radius: 4px;
  transition: background 0.3s ease;
}

.content-wrapper::-webkit-scrollbar-thumb:hover {
  background: #a8a8a847;
}

/* Firefox 滚动条样式 */
.content-wrapper {
  scrollbar-color: #d6d6d6 #ffffff;
}

.layout-main-collapsed {
  left: 60px;
}

/* Footer 样式，减小高度和字体 */
.layout-footer {
  text-align: center;
  color: rgb(146, 146, 146);
  padding: 6px 0;
  font-size: 12px;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .layout-sider {
    position: fixed;
    z-index: 1000;
  }

  .layout-content {
    margin-left: 0 !important;
  }

  .content-wrapper {
    padding: 10px;
  }
}
</style>
