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
        <a-layout-sider v-if="activeButton === 'prompt'" class="layout-sider" :width="300">
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
  background-color: #000000;

  overflow-y: auto;
}

.layout-sider {
  background-color: #2a2a2a;
  border-left: 1px solid #333;
  overflow-y: auto;
}



</style>
