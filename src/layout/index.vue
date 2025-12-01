<script setup lang="ts">
import { ref, computed } from 'vue'
import Header from './Header.vue'
import Sidebar from './Sidebar.vue'
import Breadcrumb from './Breadcrumb.vue'


const collapsed = ref(true)

const toggleCollapse = () => {
  collapsed.value = !collapsed.value
}
</script>

<template>
  <a-layout class="layout-container">
    <!-- 侧边栏 -->
    <a-layout-sider v-model:collapsed="collapsed" :trigger="null" collapsible :width="200" :collapsed-width="80"
      :class="['layout-sider', { 'layout-sider-collapsed': collapsed }]">
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

        <!-- 页面内容 -->
        <div class="content-wrapper">
          <router-view />
        </div>
      </a-layout-content>
      <a-layout-footer style="text-align: center;color: grey;">
        Powered by 数字技术服务中心 ©2025
      </a-layout-footer>
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
  margin-left: 200px;
  transition: margin-left 0.2s;
}

.layout-main-collapsed {
  margin-left: 80px;
}

.layout-header {
  background: #fff;
  padding: 0;
  box-shadow: 0 2px 8px 0 rgba(29, 35, 41, 0.05);
  position: fixed;
  top: 0;
  right: 0;
  left: 200px;
  z-index: 100;
  transition: left 0.2s;
}

.layout-main-collapsed .layout-header {
  left: 80px;
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
  height: calc(100vh - 190px);
  overflow-y: auto;
  overflow-x: hidden;
}



.content-wrapper::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.content-wrapper::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
  transition: background 0.3s ease;
}

.content-wrapper::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Firefox 滚动条样式 */
.content-wrapper {
  scrollbar-color: #c3cee7 #ffffff;
}

.layout-main-collapsed {
  left: 80px;
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
    padding: 16px;
  }

  
}
</style>
