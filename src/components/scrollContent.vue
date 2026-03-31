<template>
  <div class="page-container">
    <!-- 插槽 这个插槽用于放置页面内容，用以解决页面管理后台内容滚动的问题，建议每个页面都用TA包裹 -->
    <slot name="content"></slot>
  </div>
</template>
<script setup lang="ts"></script>
<style scoped>
.page-container {
  /* 根据页面布局调整高度，这里使用视口高度减去顶部等间距，保证在多数页面中可滚动 */
  max-height: calc(100vh - 115px);
  overflow-y: auto;
  overflow-x: hidden;

  /* 自定义滚动条样式 */
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
}

/* Webkit 浏览器滚动条样式 */
.page-container::-webkit-scrollbar {
  width: 8px;
}

.page-container::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.02);
  border-radius: 4px;
  margin: 4px 0;
}

.page-container::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  border: 2px solid transparent;
  background-clip: padding-box;
  transition: all 0.3s ease;
}

.page-container::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
  transform: scaleX(1.1);
}

.page-container::-webkit-scrollbar-thumb:active {
  background: rgba(0, 0, 0, 0.4);
}

/* 平滑滚动效果 */
.page-container {
  scroll-behavior: smooth;
}

/* 滚动条悬停时显示更明显的样式 */
.page-container:hover::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.25);
}

/* 暗色模式适配 */
@media (prefers-color-scheme: dark) {
  .page-container::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
  }

  .page-container::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
  }

  .page-container::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.4);
  }
}

/* 移动端优化 */
@media (max-width: 768px) {
  .page-container {
    max-height: calc(100vh - 140px);
  }

  .page-container::-webkit-scrollbar {
    width: 6px;
  }
}
</style>
