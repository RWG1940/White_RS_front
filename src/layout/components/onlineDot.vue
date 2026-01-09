<template>
  <span
    class="online-dot"
    :class="{ online: online, offline: !online, 'no-pulse': !pulse }"
    :style="dotStyle"
    :title="titleText"
    role="img"
    :aria-label="ariaLabel"
  >
    <!-- 保持语义：如果需要也可以在这里放入隐藏文本 -->
    <span class="sr-only" v-if="!ariaLabel">{{ titleText }}</span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  online: { type: Boolean, default: false },
  size: { type: [Number, String], default: 10 }, // 像素，或传 '1rem' 等
  pulse: { type: Boolean, default: true }, // 在线时是否闪烁
  title: { type: String, default: '' }, // 鼠标悬停提示文本（优先）
  ariaLabel: { type: String, default: '' } // 无障碍文本
})

const dotSize = computed(() => {
  return typeof props.size === 'number' ? `${props.size}px` : String(props.size)
})

const dotStyle = computed(() => {
  return {
    width: dotSize.value,
    height: dotSize.value,
    minWidth: dotSize.value,
    minHeight: dotSize.value,
    // 保证圆点垂直居中时不会被压扁
    lineHeight: dotSize.value
  }
})

const titleText = computed(() => {
  if (props.title) return props.title
  return props.online ? '在线' : '离线'
})
</script>

<style scoped>
.online-dot {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  box-sizing: border-box;
  vertical-align: middle;
  /* 让圆点不会因为父容器 line-height 导致变形 */
  overflow: visible;
  /* 添加轻微外阴影以便在浅色背景下可见 */
  box-shadow: 0 0 0 0 rgba(0,0,0,0);
}

/* 在线：绿色基础色 */
.online-dot.online {
  background-color: #22c55e; /* 绿色 */
  box-shadow: 0 0 0 0 rgba(34,197,94,0.6);
}

/* 离线：红色 */
.online-dot.offline {
  background-color: #ef4444; /* 红色 */
}

/* 闪烁动画：放大 + 淡出环形波纹 */
@keyframes pulse-ring {
  0% {
    box-shadow: 0 0 0 0 rgba(34,197,94,0.6);
  }
  70% {
    box-shadow: 0 0 0 8px rgba(34,197,94,0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(34,197,94,0);
  }
}

/* 更平滑的透明度闪烁（点本身） */
@keyframes pulse-opacity {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%      { opacity: 0.8; transform: scale(0.95); }
}

/* 离线状态也需要相对定位来保持位置一致 */
.online-dot.offline {
  position: relative;
}

/* 在线并允许 pulse 时同时播放两个动画（环形 + 点微动） */
.online-dot.online:not(.no-pulse) {
  animation: pulse-opacity 1.2s ease-in-out infinite;
  /* 额外的周期性外放环使用 inset box-shadow 动画模拟 */
  animation-delay: 0s;
  /* 使用伪元素做环形波纹（更兼容 box-shadow） */
  position: relative;
}

/* 用伪元素做环形波纹，避免影响布局 */
.online-dot.online:not(.no-pulse)::after {
  content: "";
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  width: calc(100% + 0px);
  height: calc(100% + 0px);
  /* 初始为透明的环形 */
  box-shadow: 0 0 0 0 rgba(34,197,94,0.45);
  animation: pulse-ring 1.6s cubic-bezier(.4,0,.2,1) infinite;
  pointer-events: none;
}

/* 如果用户偏好减少动画，则禁用 */
@media (prefers-reduced-motion: reduce) {
  .online-dot.online:not(.no-pulse),
  .online-dot.online:not(.no-pulse)::after {
    animation: none !important;
  }
}

/* 用于隐藏但对辅助工具可见的文本 */
.sr-only {
  position: absolute !important;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0,0,0,0);
  white-space: nowrap;
  border: 0;
}
</style>
