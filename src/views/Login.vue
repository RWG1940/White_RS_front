<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth-store'
import { message } from 'ant-design-vue'
import type { Rule } from 'ant-design-vue/es/form'
import LoginLoading from '@/components/LoginLoading.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const loginForm = ref({
  username: '',
  password: '',
})

const formRef = ref()
const loading = ref(false)

// 表单校验规则
const rules: Record<string, Rule[]> = {
  username: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { min: 2, max: 20, message: '账号长度应在 2-20 个字符之间', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 2, max: 20, message: '密码长度应在 2-20 个字符之间', trigger: 'blur' },
  ],
}

const handleLogin = async () => {
  try {
    // 表单校验
    const values = await formRef.value.validate()
    // 验证通过，values 包含表单值
    if (!values) {
      return
    }
  } catch (error: any) {
    // 如果 errorFields 不为空，说明有验证错误
    if (error?.errorFields && error.errorFields.length > 0) {
      // 校验失败，不执行登录
      return
    }
    // 如果 errorFields 为空，说明验证通过，继续执行登录
  }

  try {
    loading.value = true
    const result = await authStore.login(loginForm.value)
    if (result && result.success) {

      // 登录成功提示
      message.success({
        content: '登录成功',
        duration: 2,
      })

      // 获取跳转路径，优先使用 redirect 参数，否则跳转到首页
      const redirect = (route.query.redirect as string) || '/'

      // 确保跳转路径是有效的，如果是登录页则跳转到首页
      const targetPath = redirect === '/login' ? '/' : redirect

      // 延迟一下再跳转，让用户看到成功提示
      setTimeout(() => {
        router.push(targetPath).catch((err) => {
          // 如果跳转失败，尝试跳转到首页
          console.error('路由跳转失败:', err)
          if (targetPath !== '/') {
            router.push('/')
          }
        })
      }, 500)
    } else {
      // 登录失败（但不会抛出异常，因为错误已在拦截器中处理）
      // 这里不需要额外处理，拦截器已经显示了错误消息
    }
  } catch (error) {
    // 错误已在拦截器中处理
    console.error('登录错误:', error)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-container">
    <a-row justify="center" align="middle" class="login-row">
      <a-col :xs="22" :sm="18" :md="14" :lg="10" :xl="8" :xxl="6">
        <a-card class="login-card" :bordered="false">
          <template #title>
            <h2 class="login-title">登录</h2>
          </template>
          <a-form
          v-show="!loading"
            ref="formRef"
            :model="loginForm"
            :rules="rules"
            @submit.prevent="handleLogin"
            layout="vertical"
          >
            <a-form-item label="账号" name="username">
              <a-input v-model:value="loginForm.username" placeholder="请输入账号" size="large" />
            </a-form-item>
            <a-form-item label="密码" name="password">
              <a-input-password
                v-model:value="loginForm.password"
                placeholder="请输入密码"
                size="large"
                @press-enter="handleLogin"
              />
            </a-form-item>
            <a-form-item>
              <a-button type="primary" html-type="submit" size="large" block :loading="loading">
                登录
              </a-button>
            </a-form-item>
          </a-form>
          <LoginLoading v-show="loading"/>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #8bdbb6ff 100%);
  padding: 20px;
  box-sizing: border-box;
}

.login-row {
  min-height: calc(100vh - 40px);
}

.login-card {
  background-color: rgba(255, 255, 255, 0.66);
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-radius: 15px;
}

.login-title {
  text-align: left;
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .login-container {
    padding: 16px;
  }

  .login-card {
    border-radius: 12px;
  }

  .login-title {
    font-size: 20px;
  }

  /* 移动端表单标签和输入框优化 */
  :deep(.ant-form-item-label) {
    padding-bottom: 4px;
  }

  :deep(.ant-form-item) {
    margin-bottom: 20px;
  }
}

/* 超小屏幕优化 */
@media (max-width: 480px) {
  .login-container {
    padding: 12px;
  }

  .login-title {
    font-size: 18px;
  }

  :deep(.ant-form-item) {
    margin-bottom: 16px;
  }
}

/* 横屏适配 */
@media (max-height: 600px) and (orientation: landscape) {
  .login-row {
    min-height: auto;
    padding: 20px 0;
  }
}
</style>
