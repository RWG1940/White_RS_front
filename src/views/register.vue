<template>
    <div class="register-container">
        <a-row justify="center" align="middle" class="register-row">
            <a-col :xs="22" :sm="18" :md="14" :lg="10" :xl="8" :xxl="6">
                <a-card class="register-card" :bordered="false">
                    <template #title>
                        <h2 class="register-title">注册账号</h2>
                        <p class="register-subtitle">创建您的专属账号</p>
                    </template>
                    <a-form v-show="!loading" ref="formRef" :model="registerForm" :rules="rules"
                        @submit.prevent="handleRegister" layout="vertical">
                        <a-form-item label="用户名" name="username">
                            <a-input v-model:value="registerForm.username" placeholder="请输入用户名" size="large"
                                allow-clear>
                                <template #prefix>
                                    <UserOutlined />
                                </template>
                            </a-input>
                        </a-form-item>

                        <a-form-item label="邮箱" name="email">
                            <a-input v-model:value="registerForm.email" placeholder="请输入邮箱地址" size="large" allow-clear>
                                <template #prefix>
                                    <MailOutlined />
                                </template>
                            </a-input>
                        </a-form-item>

                        <a-form-item label="手机号" name="phone">
                            <a-input v-model:value="registerForm.phone" placeholder="请输入手机号" size="large" allow-clear>
                                <template #prefix>
                                    <PhoneOutlined />
                                </template>
                            </a-input>
                        </a-form-item>

                        <a-form-item label="密码" name="password">
                            <a-input-password v-model:value="registerForm.password" placeholder="请输入密码" size="large"
                                @press-enter="handleRegister">
                                <template #prefix>
                                    <LockOutlined />
                                </template>
                            </a-input-password>
                        </a-form-item>

                        <a-form-item label="确认密码" name="confirmPassword">
                            <a-input-password v-model:value="registerForm.confirmPassword" placeholder="请再次输入密码"
                                size="large" @press-enter="handleRegister">
                                <template #prefix>
                                    <SafetyOutlined />
                                </template>
                            </a-input-password>
                        </a-form-item>

                        <a-form-item>
                            <a-button type="primary" html-type="submit" size="large" block :loading="loading">
                                立即注册
                            </a-button>
                            <div class="register-footer">
                                <span>已有账号？</span>
                                <a-button type="link" @click="router.push('/login')">立即登录</a-button>
                            </div>
                        </a-form-item>
                    </a-form>
                    <LoginLoading v-show="loading" />
                </a-card>
            </a-col>
        </a-row>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth-store'
import { message } from 'ant-design-vue'
import {
    UserOutlined,
    MailOutlined,
    PhoneOutlined,
    LockOutlined,
    SafetyOutlined
} from '@ant-design/icons-vue'
import type { Rule } from 'ant-design-vue/es/form'
import LoginLoading from '@/components/LoginLoading.vue'

const router = useRouter()
const authStore = useAuthStore()

const registerForm = reactive({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
})

const formRef = ref()
const loading = ref(false)

// 自定义确认密码验证
const validateConfirmPassword = async (_rule: Rule, value: string) => {
    if (value === '') {
        return Promise.reject('请确认密码')
    } else if (value !== registerForm.password) {
        return Promise.reject('两次输入的密码不一致')
    } else {
        return Promise.resolve()
    }
}


// 表单校验规则
const rules: Record<string, Rule[]> = {
    username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 2, max: 20, message: '用户名长度应在 2-20 个字符之间', trigger: 'blur' },
        { pattern: /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/, message: '用户名只能包含字母、数字、下划线和中文字符', trigger: 'blur' }
    ],

    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 3, max: 20, message: '密码长度应在 3-20 个字符之间', trigger: 'blur' },
    ],
    confirmPassword: [
        { required: true, message: '请确认密码', trigger: 'blur' },
        { validator: validateConfirmPassword, trigger: 'blur' }
    ],
}

const handleRegister = async () => {
    try {
        // 表单校验
        const values = await formRef.value.validate()
        if (!values) {
            return
        }
    } catch (error: any) {
        if (error?.errorFields && error.errorFields.length > 0) {
            return
        }
    }

    try {
        loading.value = true
        const result = await authStore.register({
            username: registerForm.username,
            email: registerForm.email,
            phone: registerForm.phone,
            password: registerForm.password
        })

        if (result && result.success) {
            message.success({
                content: '注册成功，即将跳转到登录页',
                duration: 2,
            })

            // 延迟跳转到登录页
            setTimeout(() => {
                router.push('/login')
            }, 1500)
        } else {
            const errorMessage = result?.code === 400 ? '用户名或邮箱已存在' : '注册失败，请重试'
            message.error({
                content: errorMessage,
                duration: 2,
            })
        }
    } catch (error) {
        message.error({
            content: '注册失败，请检查网络连接',
            duration: 2,
        })
    } finally {
        loading.value = false
    }
}
</script>

<style scoped>
.register-container {
    min-height: 100vh;
    background-image: url('../../public/images/login-bg.jpg');
    background-size: cover;
    background-position: center;
    padding: 20px;
    box-sizing: border-box;
}

.register-row {
    min-height: calc(100vh - 40px);
}

.register-card {
    background-color: rgba(255, 255, 255, 0.85);
    width: 100%;
    max-width: 450px;
    margin: 0 auto;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    border-radius: 16px;
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.2);
}

.register-title {
    text-align: center;
    margin: 0 0 8px 0;
    font-size: 28px;
    font-weight: 600;
    color: #1890ff;
    background: linear-gradient(135deg, #1890ff 0%, #6a80ff 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.register-subtitle {
    text-align: center;
    margin: 0;
    font-size: 14px;
    color: #666;
    font-weight: 400;
}

.register-footer {
    text-align: center;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #f0f0f0;
}

.register-footer span {
    color: #666;
    font-size: 14px;
}

/* 输入框样式优化 */
:deep(.ant-input-affix-wrapper) {
    border-radius: 8px;
    border: 1px solid #d9d9d9;
    transition: all 0.3s ease;
}

:deep(.ant-input-affix-wrapper:hover) {
    border-color: #40a9ff;
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
}

:deep(.ant-input-affix-wrapper-focused) {
    border-color: #40a9ff;
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

:deep(.ant-input) {
    border-radius: 8px;
}

/* 按钮样式优化 */
:deep(.ant-btn-primary) {
    border-radius: 8px;
    height: 48px;
    font-size: 16px;
    font-weight: 500;
    background: linear-gradient(135deg, #1890ff 0%, #364dcf 100%);
    border: none;
    transition: all 0.3s ease;
}

:deep(.ant-btn-primary:hover) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
}

:deep(.ant-btn-link) {
    padding: 0;
    height: auto;
    color: #1890ff;
}

/* 移动端优化 */
@media (max-width: 768px) {
    .register-container {
        padding: 16px;
    }

    .register-card {
        border-radius: 12px;
        max-width: 100%;
    }

    .register-title {
        font-size: 24px;
    }

    .register-subtitle {
        font-size: 13px;
    }

    :deep(.ant-form-item) {
        margin-bottom: 20px;
    }

    :deep(.ant-btn-primary) {
        height: 44px;
        font-size: 15px;
    }
}

/* 超小屏幕优化 */
@media (max-width: 480px) {
    .register-container {
        padding: 12px;
    }

    .register-title {
        font-size: 22px;
    }

    :deep(.ant-form-item) {
        margin-bottom: 16px;
    }
}

/* 横屏适配 */
@media (max-height: 600px) and (orientation: landscape) {
    .register-row {
        min-height: auto;
        padding: 20px 0;
    }
}
</style>