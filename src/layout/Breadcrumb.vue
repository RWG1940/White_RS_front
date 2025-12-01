<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { HomeOutlined } from '@ant-design/icons-vue'

const route = useRoute()

const breadcrumbItems = computed(() => {
  const items: any[] = []
  
  // 如果当前在首页，只显示首页
  if (route.path === '/' || route.path === '') {
    return [
      {
        title: '首页',
      },
    ]
  }

  // 添加首页
  items.push({
    title: '首页',
    path: '/',
  })

  // 使用 route.matched 获取匹配的路由记录
  // 过滤掉布局组件（没有 meta.title 的父路由）和首页路由
  const matched = route.matched.filter((record) => {
    return record.meta?.title && record.path !== '/' && record.path !== ''
  })

  matched.forEach((record, index) => {
    const isLast = index === matched.length - 1
    // 确保路径是完整的
    const fullPath = record.path.startsWith('/') ? record.path : `/${record.path}`
    
    items.push({
      title: record.meta?.title || record.name || '',
      ...(isLast ? {} : { path: fullPath }),
    })
  })

  return items
})
</script>

<template>
  <a-breadcrumb class="breadcrumb-container">
    <a-breadcrumb-item v-for="(item, index) in breadcrumbItems" :key="index">
      <template v-if="index === 0">
        <HomeOutlined />
        <span style="margin-left: 4px">{{ item.title }}</span>
      </template>
      <router-link v-else-if="item.path" :to="item.path">
        {{ item.title }}
      </router-link>
      <span v-else>{{ item.title }}</span>
    </a-breadcrumb-item>
  </a-breadcrumb>
</template>

<style scoped>
.breadcrumb-container {
  margin-bottom: 0.5%;
}
</style>

