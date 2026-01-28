<template>
  <div class="ai-prompts-front-view">
    <a-layout class="layout-container">
      <a-layout-header class="layout-header">
        <AiHeader :active-button="activeButton" @change="handleButtonChange" />
      </a-layout-header>
      <a-layout class="layout-body">
        <a-layout-content class="layout-content">
          <AiContent :active-button="activeButton" />
        </a-layout-content>
        <a-layout-sider class="layout-sider" :width="300">
          <AiRightPanel />
        </a-layout-sider>
      </a-layout>
    </a-layout>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import AiHeader from './layout/aiHeader.vue'
import AiContent from './layout/aiContent.vue'
import AiRightPanel from './layout/aiRightPanel.vue'

const activeButton = ref('prompt')

const handleButtonChange = (button: string) => {
  activeButton.value = button
}
</script>
<style scoped>
.ai-prompts-front-view {
  height: 100vh;
  background-color: #202020;
  overflow-y: auto;
  overflow-x: hidden;
}

.layout-container {
  height: 100vh;
  background-color: #202020;
}

.layout-header {
  background-color: #2a2a2a;
  padding: 0;
  height: auto;
  line-height: normal;
  border-bottom: 1px solid #333;
}

.layout-body {
  height: calc(100vh - 80px);
  background-color: #202020;
}

.layout-content {
  background-color: #202020;
  padding: 16px;
  overflow-y: auto;
}

.layout-sider {
  background-color: #2a2a2a;
  border-left: 1px solid #333;
  overflow-y: auto;
}

/* 美化滚动条样式 */
.ai-prompts-front-view::-webkit-scrollbar,
.layout-content::-webkit-scrollbar,
.layout-sider::-webkit-scrollbar {
  width: 8px;
}

.ai-prompts-front-view::-webkit-scrollbar-track,
.layout-content::-webkit-scrollbar-track,
.layout-sider::-webkit-scrollbar-track {
  background: #2a2a2a;
  border-radius: 4px;
}

.ai-prompts-front-view::-webkit-scrollbar-thumb,
.layout-content::-webkit-scrollbar-thumb,
.layout-sider::-webkit-scrollbar-thumb {
  background: #555;
  border-radius: 4px;
  transition: background 0.3s ease;
}

.ai-prompts-front-view::-webkit-scrollbar-thumb:hover,
.layout-content::-webkit-scrollbar-thumb:hover,
.layout-sider::-webkit-scrollbar-thumb:hover {
  background: #777;
}

.ai-prompts-front-view::-webkit-scrollbar-thumb:active,
.layout-content::-webkit-scrollbar-thumb:active,
.layout-sider::-webkit-scrollbar-thumb:active {
  background: #999;
}

/* Firefox 滚动条样式 */
.ai-prompts-front-view,
.layout-content,
.layout-sider {
  scrollbar-width: thin;
  scrollbar-color: #555 #2a2a2a;
}
</style>
