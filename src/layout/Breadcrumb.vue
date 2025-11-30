<script setup lang="ts">
import { computed, h } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { HomeOutlined } from '@ant-design/icons-vue'

const route = useRoute()
const router = useRouter()

const breadcrumbItems = computed(() => {
  const items: any[] = [
    {
      title: h('span', [
        h(HomeOutlined),
        h('span', { style: 'margin-left: 4px' }, '首页'),
      ]),
      href: '/',
    },
  ]

  // 根据路由路径生成面包屑
  const pathSegments = route.path.split('/').filter(Boolean)
  
  if (pathSegments.length === 0) {
    return items
  }

  let currentPath = ''
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`
    const isLast = index === pathSegments.length - 1
    
    // 从路由 meta 中获取标题，如果没有则使用路径名
    const routeTitle = route.matched.find((r) => r.path === currentPath)?.meta?.title || segment
    
    if (isLast) {
      items.push({
        title: routeTitle,
      })
    } else {
      items.push({
        title: h('a', {
          onClick: () => router.push(currentPath),
        }, routeTitle),
      })
    }
  })

  return items
})
</script>

<template>
  <a-breadcrumb class="breadcrumb-container" :items="breadcrumbItems" />
</template>

<style scoped>
.breadcrumb-container {
  margin-bottom: 16px;
}
</style>

