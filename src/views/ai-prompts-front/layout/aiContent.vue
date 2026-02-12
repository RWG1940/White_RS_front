<template>
  <div class="ai-content">
    <div class="content-wrapper">
      <Transition name="fade-scale" mode="out-in">
        <PromptsContent v-if="activeButton === 'prompt'" key="prompt" />
        <InspiraContent v-else-if="activeButton === 'inspiration'" key="inspiration" />
        <AcademyContent v-else-if="activeButton === 'academy'" key="academy" />
        <PricingContent v-else-if="activeButton === 'pricing'" key="pricing" />
      </Transition>
    </div>
  </div>
</template>
<script setup lang="ts">
import AcademyContent from '../components/academyContent.vue';
import InspiraContent from '../components/inspiraContent.vue';
import PricingContent from '../components/pricingContent.vue';
import PromptsContent from '../components/promptsContent.vue'

defineProps<{
  activeButton: string
}>()
</script>
<style scoped>
.ai-content {
  height: 100%;
  color: #fff;
  overflow: hidden;
}

.content-wrapper {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 20px 15px;
}

h2 {
  color: #fff;
  margin-bottom: 16px;
}

p {
  color: #ccc;
  line-height: 1.6;
}

/* 淡入淡出 + 缩放动画 */
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-scale-enter-from {
  opacity: 0;
  transform: scale(0.95) translateY(50px);
}

.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-50px);
}

.fade-scale-enter-to,
.fade-scale-leave-from {
  opacity: 1;
  transform: scale(1) translateY(0);
}

/* 滚动条样式 */
.content-wrapper::-webkit-scrollbar {
  width: 10px;
}

.content-wrapper::-webkit-scrollbar-track {
  background: #202020;
  border-radius: 3px;
}

.content-wrapper::-webkit-scrollbar-thumb {
  background: #2c2c2c;
  border-radius: 3px;
}

.content-wrapper::-webkit-scrollbar-thumb:hover {
  background: #1cacb9;
}
</style>
