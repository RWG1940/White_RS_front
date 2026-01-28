<template>
  <div class="ai-content">
    <div class="content-wrapper">
      <PromptsContent v-if="activeButton === 'prompt'" />
      <InspiraContent v-if="activeButton === 'inspiration'" />
      <AcademyContent v-if="activeButton === 'academy'" />
      <PricingContent v-if="activeButton === 'pricing'" />
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
}

h2 {
  color: #fff;
  margin-bottom: 16px;
}

p {
  color: #ccc;
  line-height: 1.6;
}
</style>
