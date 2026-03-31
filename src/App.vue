<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth-store'

const authStore = useAuthStore()

// 监听路由变化，显示加载状态
onMounted(() => {
  // 初始化认证状态
  authStore.init()
})
</script>

<template>
  <router-view />
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  min-height: 100vh;
}

</style>
