<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth-store'

const router = useRouter()
const authStore = useAuthStore()
const pageLoading = ref(false)

// 监听路由变化，显示加载状态
onMounted(() => {
  router.beforeEach(() => {
    pageLoading.value = true
  })
  
  router.afterEach(() => {
    pageLoading.value = false
  })
  
  router.onError(() => {
    pageLoading.value = false
  })
  
  // 初始化认证状态
  authStore.init()
})
</script>

<template>
  <a-spin :spinning="pageLoading" tip="加载中..." size="large" style="min-height: 100vh">
    <router-view />
  </a-spin>
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
