<template>
  <div class="pricing-container">
    <div class="pricing-header">
      <h1 class="title">选择适合您的计划</h1>
      <p class="description">根据您的需求选择合适的定价方案</p>
    </div>
    <div class="pricing-cards">
      <PricingCard
        v-for="(plan, index) in store.list as any"
        :key="plan.id || index"
        :plan="plan"
        :button-text="getButtonText(plan)"
        :is-popular="index === 1"
        @click="handlePlanSelect(plan)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import PricingCard from './pricingCard.vue'
import type { AiPlansType } from '@/types/aiPlans-type'
import { aiPlansStore } from '@/stores/aiPlans-store';
import { onMounted } from 'vue';

const store = aiPlansStore

// 根据计划状态获取按钮文本
const getButtonText = (plan: AiPlansType) => {
  if (plan.status === 0) return '已停用'
  if (plan.price === '0') return '免费试用'
  return '立即订阅'
}

// 处理计划选择
const handlePlanSelect = (plan: AiPlansType) => {
  console.log('选择订阅计划:', plan.name)
  
  if (plan.status === 0) {
    alert('该计划已停用，无法订阅')
    return
  }
  
  if (plan.price === '0') {
    // 免费试用逻辑
    alert(`开始免费试用 ${plan.name} 计划`)
  } else {
    // 付费订阅逻辑
    alert(`订阅 ${plan.name} 计划 - 价格: ¥${plan.price}`)
  }
  
  // 这里可以添加实际的订阅逻辑，比如调用API接口等
}

onMounted(() => {
  store.fetchAll()
})
</script>
<style scoped>
.pricing-container {
  padding: 2rem;
  min-height: 100vh;
}

.pricing-header {
  text-align: center;
  margin-bottom: 3rem;
}

.title {
  font-size: 2.5rem;
  color: hsl(0, 0%, 100%);
  margin-bottom: 0.5rem;
  font-weight: bold;
  background: linear-gradient(135deg, hsl(189, 92%, 58%) 0%, hsl(167, 100%, 50%) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.description {
  font-size: 1.1rem;
  color: hsl(0, 0%, 83%);
  opacity: 0.8;
}

.pricing-cards {
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .pricing-cards {
    flex-direction: column;
    align-items: center;
  }
  
  .title {
    font-size: 2rem;
  }
  
  .description {
    font-size: 1rem;
  }
}
</style>