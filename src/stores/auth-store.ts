import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { userLogin, userCurrent, userLogout } from '@/api/services/login-api'
import type { userType } from '@/types/user-type'

export const useAuthStore = defineStore('auth', () => {
  // 用户信息
  const user = ref<userType | null>(null)
  // Token
  const token = ref<string>(localStorage.getItem('token') || '')
  // 是否已加载用户信息
  const isLoaded = ref(false)
  // 加载状态
  const loading = ref(false)

  // 是否已登录
  const isAuthenticated = computed(() => !!token.value)

  // 登录
  const login = async (loginData: { username: string; password: string }) => {
    try {
      loading.value = true
      const res = await userLogin(loginData)
      // code 为 200 表示成功
      if (res.data.code == 200) {
        const newToken = res.data.data.token
        if (newToken) {
          token.value = newToken
          localStorage.setItem('token', newToken)
          // 获取用户信息
          await fetchUserInfo()
          return { success: true, code: res.data.code }
        }
      }
      return { success: false, code: res.data.code }
    } catch (error) {
      return { success: false, code: 0 }
    } finally {
      loading.value = false
    }
  }

  // 获取用户信息
  const fetchUserInfo = async () => {
    try {
      if (!token.value) return
      const res = await userCurrent()
      // code 为 200 表示成功
      if (res.data.code === 200) {
        // 后端返回的数据在 data.data 中
        const userData = res.data.data
        if (userData) {
          // 映射后端返回的数据到前端用户类型
          user.value = {
            id: userData.userId, // 使用 userId 作为 id
            userId: userData.userId,
            username: userData.username,
            email: userData.email,
            phone: userData.phone,
            status: userData.status,
            roles: userData.roles || [],
          }
          isLoaded.value = true
        }
      }
    } catch (error) {
      // 获取用户信息失败，清除 token
      console.error('获取用户信息失败:', error)
      logout()
    }
  }

  // 退出登录
  const logout = async () => {
    try {
      if (token.value) {
        await userLogout()
      }
    } catch (error) {
      // 即使退出失败也清除本地状态
    } finally {
      token.value = ''
      user.value = null
      isLoaded.value = false
      localStorage.removeItem('token')
    }
  }

  // 初始化（从本地存储恢复 token 并获取用户信息）
  const init = async () => {
    if (token.value && !isLoaded.value) {
      await fetchUserInfo()
    }
  }

  return {
    user,
    token,
    isAuthenticated,
    isLoaded,
    loading,
    login,
    logout,
    fetchUserInfo,
    init,
  }
})
