<template>
<div class="page-container">
    <!-- 插槽 -->
     <slot name="content"></slot>
</div>
</template>
<script setup lang="ts">

</script>
<style scoped>
.page-container {
    /* 根据页面布局调整高度，这里使用视口高度减去顶部等间距，保证在多数页面中可滚动 */
    max-height: calc(100vh - 155px);
    overflow-y: auto;
    overflow-x: hidden;
}
</style>