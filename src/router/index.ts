import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth-store'
import { message } from 'ant-design-vue'
import NProgress from '@/utils/nprogress'
import { menuConfig, menuItemsToRoutes } from '@/config/menu'


// 路由配置
const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue').catch(() => import('@/views/NotFound.vue')),
    meta: {
      title: '登录',
      requiresAuth: false, // 不需要登录
    },
  },
  {
    path: '/',
    component: () => import('@/layout/index.vue'),
    meta: {
      requiresAuth: true, // 需要登录
    },
    children: menuItemsToRoutes(menuConfig),
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: {
      title: '页面不存在',
      requiresAuth: false,
    },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// 路由前置守卫
router.beforeEach(async (to, from, next) => {
  NProgress.start() // 开始进度条
  const authStore = useAuthStore()

  // 如果未初始化，先初始化（从本地存储恢复 token）
  if (!authStore.isLoaded && authStore.token) {
    await authStore.init()
  }

  // 检查路由是否需要登录
  const requiresAuth = to.meta.requiresAuth !== false

  if (requiresAuth) {
    // 需要登录
    if (!authStore.isAuthenticated) {
      // 未登录，跳转到登录页
      message.warning('请先登录')
      NProgress.done()
      next({
        path: '/login',
        query: { redirect: to.fullPath }, // 保存原始路径，登录后可以跳转回去
      })
      return
    }

    // 检查角色权限（仅在需要登录的路由上检查）
    const allowedRoles = to.meta.allowedRoles as string[]
    if (allowedRoles && allowedRoles.length > 0) {
      const userRoles = (authStore.user?.roles || []).map((r: any) => String(r))
      const hasPermission = userRoles.some(role => allowedRoles.includes(role))
      
      if (!hasPermission) {
        // 无权限访问，跳转到首页并提示
        message.error('您没有权限访问此页面')
        NProgress.done()
        next({ path: '/' })
        return
      }
    }
  } else {
    // 不需要登录（如登录页）
    if (to.path === '/login' && authStore.isAuthenticated) {
      // 已登录访问登录页，跳转到首页
      NProgress.done()
      next({ path: '/' })
      return
    }
  }

  // 设置页面标题
  if (to.meta.title) {
    import('@/config').then(({ appConfig }) => {
      document.title = `${to.meta.title} - ${appConfig.siteTitle}`
    })
  }

  next()
})

// 路由后置守卫
router.afterEach(() => {
  // 可以在这里添加页面访问统计等逻辑
  NProgress.done()
})

// 路由错误处理
router.onError((error) => {
  console.error('路由错误:', error)
  message.error('页面加载失败，请刷新重试')
})

export default router
