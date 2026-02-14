<script setup lang="ts">
import type { AiPlansType } from '@/types/aiPlans-type'

interface PricingCardProps {
  plan: AiPlansType
  buttonText?: string
  isPopular?: boolean
}

const props = defineProps<PricingCardProps>()

const emit = defineEmits<{
  click: [plan: AiPlansType]
}>()

const handleClick = () => {
  emit('click', props.plan)
}

// 格式化价格显示
const formatPrice = (price: string | undefined) => {
  if (!price) return '免费'
  if (price === '0') return '免费'
  return `¥${price}`
}

// 获取状态文本
const getStatusText = (status: number | undefined) => {
  switch (status) {
    case 0: return '售罄'
    case 1: return '充足'
    default: return '未知'
  }
}

// 获取状态颜色
const getStatusColor = (status: number | undefined) => {
  switch (status) {
    case 0: return 'var(--error)'
    case 1: return 'var(--success)'
    default: return 'var(--paragraph)'
  }
}
</script>

<template>
  <div :class="['card', { popular: isPopular }]">
    <div v-if="isPopular" class="popular-badge">热门</div>
    <div class="card__border"></div>
    <div class="card_title__container">
      <span class="card_title">{{ plan.name || '订阅计划' }}</span>
      <p class="card_paragraph">{{ plan.description || 'AI提示词订阅计划' }}</p>
      <div class="price">{{ formatPrice(plan.price as any) }}</div>
    </div>
    <hr class="line" />
    <div class="plan-details">
      <div class="detail-item">
        <span class="detail-label">订阅周期：</span>
        <span class="detail-value">{{ plan.durationDays || 0 }} 天</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">生图上限：</span>
        <span class="detail-value">{{ plan.dailyLimit || 0 }} 次</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">提示词生成上限：</span>
        <span class="detail-value">{{ plan.cheapLimit === 0 ? '无限次' : (plan.cheapLimit || 0) + ' 次' }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">图片最高画质：</span>
        <span class="detail-value">{{ plan.maxSize || 0 }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">库存：</span>
        <span 
          class="detail-value status" 
          :style="{ color: getStatusColor(plan.status) }"
        >
          {{ getStatusText(plan.status) }}
        </span>
      </div>
    </div>
    <button 
      class="button" 
      @click="handleClick"
      :disabled="plan.status === 0"
    >
      {{ buttonText || (plan.status === 1 ? '立即订阅' : '已停用') }}
    </button>
  </div>
</template>

<style scoped>
.card {
  --white: hsl(0, 0%, 100%);
  --black: hsl(240, 15%, 9%);
  --paragraph: hsl(0, 0%, 83%);
  --line: hsl(240, 9%, 17%);
  --primary: hsl(189, 92%, 58%);
  --error: hsl(0, 84%, 60%);
  --success: hsl(120, 73%, 55%);
  --popular: hsl(45, 93%, 47%);

  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  padding-bottom: 5rem; /* 为底部按钮预留空间 */
  width: 20rem;
  background-color: hsla(240, 15%, 9%, 1);
  background-image: radial-gradient(
      at 88% 40%,
      hsla(240, 15%, 9%, 1) 0px,
      transparent 85%
    ),
    radial-gradient(at 49% 30%, hsla(240, 15%, 9%, 1) 0px, transparent 85%),
    radial-gradient(at 14% 26%, hsla(240, 15%, 9%, 1) 0px, transparent 85%),
    radial-gradient(at 0% 64%, hsl(189, 99%, 26%) 0px, transparent 85%),
    radial-gradient(at 41% 94%, hsl(189, 97%, 36%) 0px, transparent 85%),
    radial-gradient(at 100% 99%, hsl(188, 94%, 13%) 0px, transparent 85%);
  border-radius: 1rem;
  box-shadow: 0px -16px 24px 0px rgba(255, 255, 255, 0.25) inset;
}

.card.popular {
  border: 2px solid var(--popular);
}

.card .popular-badge {
  position: absolute;
  top: -10px;
  right: 20px;
  background: var(--popular);
  color: var(--black);
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.7rem;
  font-weight: bold;
  text-transform: uppercase;
}

.card .card__border {
  overflow: hidden;
  pointer-events: none;
  position: absolute;
  z-index: -10;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: calc(100% + 2px);
  height: calc(100% + 2px);
  background-image: linear-gradient(
    0deg,
    hsl(0, 0%, 100%) -50%,
    hsl(0, 0%, 40%) 100%
  );
  border-radius: 1rem;
}

.card .card__border::before {
  content: "";
  pointer-events: none;
  position: fixed;
  z-index: 200;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%), rotate(0deg);
  transform-origin: left;
  width: 200%;
  height: 10rem;
  background-image: linear-gradient(
    0deg,
    hsla(0, 0%, 100%, 0) 0%,
    hsl(189, 100%, 50%) 40%,
    hsl(189, 100%, 50%) 60%,
    hsla(0, 0%, 40%, 0) 100%
  );
  animation: rotate 8s linear infinite;
}

@keyframes rotate {
  to {
    transform: rotate(360deg);
  }
}

.card .card_title__container .card_title {
  font-size: 1.25rem;
  color: var(--white);
  font-weight: bold;
}

.card .card_title__container .card_paragraph {
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: var(--paragraph);
  line-height: 1.4;
}

.card .price {
  font-size: 2rem;
  color: var(--primary);
  font-weight: bold;
  margin: 0.5rem 0;
}

.card .line {
  width: 100%;
  height: 1px;
  background-color: var(--line);
  border: none;
  margin: 1rem 0;
}

.card .plan-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.card .plan-details .detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.card .plan-details .detail-item:last-child {
  border-bottom: none;
}

.card .plan-details .detail-item .detail-label {
  font-size: 0.85rem;
  color: var(--paragraph);
  font-weight: 500;
}

.card .plan-details .detail-item .detail-value {
  font-size: 0.9rem;
  color: var(--white);
  font-weight: 600;
}

.card .plan-details .detail-item .detail-value.status {
  font-weight: bold;
}

.card .button {
  cursor: pointer;
  padding: 0.75rem 1.5rem;
  width: calc(100% - 3rem); /* 减去左右内边距 */
  background-image: linear-gradient(
    0deg,
    hsl(189, 92%, 58%),
    hsl(189, 99%, 26%) 100%
  );
  font-size: 0.9rem;
  color: var(--white);
  font-weight: bold;
  border: 0;
  border-radius: 9999px;
  box-shadow: inset 0 -2px 25px -4px var(--white);
  transition: all 0.3s ease;
  
  /* 绝对定位在底部 */
  position: absolute;
  bottom: 1.5rem;
  left: 1.5rem;
  right: 1.5rem;
}

.card .button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(189, 92%, 58%, 0.3);
}

.card .button:active:not(:disabled) {
  transform: translateY(0);
}

.card .button:disabled {
  cursor: not-allowed;
  background-image: linear-gradient(
    0deg,
    hsl(0, 0%, 50%),
    hsl(0, 0%, 30%) 100%
  );
  color: var(--paragraph);
  box-shadow: none;
}
</style>