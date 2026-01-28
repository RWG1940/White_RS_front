<template>
  <scrollContent>
    <template #content>
    <a-tabs v-model:activeKey="activeKey" type="card">
      <a-tab-pane key="1" tab="提示词大师"><PromptsMaster /></a-tab-pane>
      <a-tab-pane key="2" tab="创作灵感"><Inspiration /></a-tab-pane>
      <a-tab-pane key="3" tab="Ai学院"><Academy /></a-tab-pane>
      <a-tab-pane key="4" tab="定价"><Pricing /></a-tab-pane>
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


const activeKey = ref('1');
</script>
<style scoped></style>
