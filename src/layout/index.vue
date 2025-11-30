<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import Header from './Header.vue'
import Sidebar from './Sidebar.vue'
import Footer from './Footer.vue'
import Breadcrumb from './Breadcrumb.vue'

const route = useRoute()
const collapsed = ref(false)

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
      :width="200"
      :collapsed-width="80"
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

        <!-- 页面内容 -->
        <div class="content-wrapper">
          <router-view />
        </div>
      </a-layout-content>
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
  box-shadow: 2px 0 8px 0 rgba(29, 35, 41, 0.05);
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
  margin: 64px 0 48px 0;
  padding: 24px;
  min-height: calc(100vh - 112px);
  background: #f0f2f5;
}

.content-wrapper {
  background: #fff;
  padding: 2%;
  border-radius: 4px;
  min-height: calc(100vh - 200px);
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

  .layout-header {
    left: 0 !important;
  }

  .layout-content {
    margin-left: 0 !important;
    padding: 16px;
  }

  .content-wrapper {
    padding: 16px;
  }
}
</style>
