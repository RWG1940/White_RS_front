<template>
  <scrollContent>
    <template #content>
    <a-tabs v-model:activeKey="activeKey" type="card">
      <a-tab-pane key="1" tab="提示词大师"><PromptsMaster /></a-tab-pane>
      <a-tab-pane key="2" tab="创作灵感"><Inspiration /></a-tab-pane>
      <a-tab-pane key="3" tab="Ai学院"><Academy /></a-tab-pane>
      <a-tab-pane key="4" tab="订阅与账目本"><Pricing /></a-tab-pane>
      <a-tab-pane key="5" tab="Api与用量统计"></a-tab-pane>
      <a-tab-pane key="6" tab="生图记录"><GenerateRecord /></a-tab-pane>
      <a-tab-pane key="7" tab="转到前台">
        <a-button @click="goToFront()">点我跳转</a-button>
      </a-tab-pane>
    </a-tabs>
    </template>
  </scrollContent>
</template>
<script setup lang="ts">
import scrollContent from '@/components/scrollContent.vue'
import { ref } from 'vue';
import PromptsMaster from './components/promptsMaster.vue';
import Inspiration from './components/inspiration.vue';
import Academy from './components/academy.vue';
import Pricing from './components/pricing.vue';
import { useRouter } from 'vue-router';
import GenerateRecord from './components/generateRecord.vue';

const router = useRouter();
const activeKey = ref('1');
const goToFront = () => {
  router.push('/ai-prompts-front');
}
</script>
<style scoped>
/* 覆盖所有标签文字颜色 */
:deep(.ant-tabs-tab) {
  color: #999 !important;
  transition: color 0.3s ease;
}

:deep(.ant-tabs-tab:hover) {
  color: #666 !important;
}

/* 激活状态下的文字颜色 */
:deep(.ant-tabs-tab.ant-tabs-tab-active) {
  color: #000 !important;
}

:deep(.ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn) {
  color: #000 !important;
}

/* 覆盖 Ant Design 的蓝色主题色 */
:deep(.ant-tabs-tab.ant-tabs-tab-active) {
  color: #000 !important;
}

:deep(.ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn) {
  color: #000 !important;
}

/* 更具体的样式覆盖 */
:deep(.ant-tabs-tab.ant-tabs-tab-active) span {
  color: #000 !important;
}

:deep(.ant-tabs-tab.ant-tabs-tab-active) .ant-tabs-tab-btn {
  color: #000 !important;
}

/* 覆盖所有可能的蓝色样式 */
:deep(.ant-tabs-tab.ant-tabs-tab-active) * {
  color: #000 !important;
}

:deep(.ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn) * {
  color: #000 !important;
}
</style>
