<template>
    <div class="ai-right-panel" id="ai-right-panel-target">
        <loginModal :visible="showLoginModal" @update:visible="showLoginModal = $event" @signup="handleSignup" />
        <registerModal :visible="showRegisterModal" @update:visible="showRegisterModal = $event" @login="handleLogin" />
        <userCenterModal :visible="showUserCenterModal" @update:visible="showUserCenterModal = $event"
            @logout="handleLogout" />
        <GeneratedImgModal 
            :visible="showGeneratedImgModal" 
            :prompt="generatedPrompt"
            @update:visible="showGeneratedImgModal = $event" 
            @close="handleImageModalClose" 
        />
        <UserSubscriptionModal 
            :visible="showSubscriptionModal" 
            @update:visible="showSubscriptionModal = $event" 
        />
        <div class="panel-header">
            <h3>
                <SettingOutlined />&ensp;控制中心
            </h3>
            <a-button type="primary" :class="{ 'login-btn': true, authenticated: authStore.isAuthenticated }"
                @click="handleLoginBtnClick">
                <template #icon>
                    <UserOutlined />
                </template>
                {{ authStore.isAuthenticated ? authStore.user?.username : '登录' }}
            </a-button>
        </div>
        <div class="panel-content">
            <!-- 加载中显示 -->
            <template v-if="promptsStore.isLoading">
                <LoadingGenerateCard />
            </template>
            <!-- 预览显示 -->
            <template v-else-if="promptsStore.showPreview">
                <RightPanelPromptsPreview />
            </template>
            <!-- 初始状态显示 -->
            <template v-else>
                <div style="margin-top: 10%;">
                    <WelcomCard />
                </div>
                <!-- 提示词连线switch开关 -->
                <div class="connection-switch-container">
                    <div class="switch-label">
                        <LinkOutlined style="margin-right: 8px;" />
                        提示词连线
                    </div>
                    <a-switch
                        v-model:checked="promptsStore.showConnectionLines"
                        @change="handleConnectionSwitchChange"
                        size="small"
                    />
                </div>

                <!-- 自动配置提示词switch开关 -->
                <div class="connection-switch-container">
                    <div class="switch-label">
                        <RobotOutlined style="margin-right: 8px;" />
                        自动配置提示词
                    </div>
                    <a-switch
                        v-model:checked="promptsStore.autoConfigPrompts"
                        @change="handleAutoConfigSwitchChange"
                        size="small"
                    />
                </div>

                <div class="connection-switch-container" @click="showSubscriptionInfo">
                    <!-- 用户角色信息 -->
                    <div class="switch-label">
                        <CrownOutlined style="margin-right: 8px;" />
                        当前套餐：
                        {{ getRoleName(authStore.user?.roles?.[0] as any) || '普通用户' }}
                    </div>
                </div>

                <!-- 清空所有提示词按钮 -->
                <div class="connection-switch-container"  v-if="promptsStore.selectedPromptIds.length > 0">
                     
                    <div  class="clear-all-prompts-btn" @click="handleClearAllPrompts">
                        <DeleteOutlined style="margin-right: 8px;" />
                        清空所有提示词
                    </div>
                
                </div>
            </template>
        </div>
        
        <PromptWeightPanel v-if="showBottomComponents" />
        <!-- 输出配置折叠面板 -->
         <OutputConfigPanel v-if="showBottomComponents" />
         
        <div style="display: flex; justify-content: center; " v-if="showBottomComponents">
            <GenerateButton @click="handleGenerateClick" />
        </div>
    </div>
</template>
<script setup lang="ts">
import { UserOutlined, SettingOutlined, LinkOutlined, RobotOutlined, DeleteOutlined,CrownOutlined } from '@ant-design/icons-vue'
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth-store'
import RightPanelPromptsPreview from '../components/rightPanelPromptsPreview.vue'
import LoadingGenerateCard from '../components/loadingGenerateCard.vue'
import GenerateButton from '../components/generateButton.vue'
import LoginModal from '../components/loginModal.vue'
import RegisterModal from '../components/registerModal.vue'
import UserCenterModal from '../components/userCenterModal.vue'
import PromptWeightPanel from '../components/promptsWeightPanel.vue'
import GeneratedImgModal from '../components/generatedImgModal.vue'
import UserSubscriptionModal from '../components/userSubscriptionModal.vue'
import { aiPromptsSelectedStore } from '@/stores/aiPromptsSelected-store'
import WelcomCard from '../components/welcomCard.vue'
import { message } from 'ant-design-vue'
import OutputConfigPanel from '../components/OutputConfigPanel.vue'
import { roleStore } from '@/stores/role-store'
import type { roleType } from '@/types/role-type'

const promptsStore = aiPromptsSelectedStore()
const authStore = useAuthStore()
const showLoginModal = ref(false)
const showRegisterModal = ref(false)
const showUserCenterModal = ref(false)
const showGeneratedImgModal = ref(false)
const showSubscriptionModal = ref(false)
const showBottomComponents = ref(false)
const generatedPrompt = ref('')
let animationTimer: number | null = null

// 获取角色名称
const getRoleName = (roleCode?: number): string => {
  if (!roleCode) return '游客'
  
  // 直接从角色store的list中查找对应的角色名称
  if (roleStore.list && Array.isArray(roleStore.list)) {
    const role = (roleStore.list as roleType[]).find((r: roleType) => r.code === roleCode)
    return role?.name || '未知角色'
  }
  
  return '未知角色'
}

const handleLoginBtnClick = () => {
    if (authStore.isAuthenticated) {
        // 已登录，显示个人中心
        showUserCenterModal.value = true
    } else {
        // 未登录，显示登录弹窗
        showLoginModal.value = true
    }
}

const handleSignup = () => {
    showLoginModal.value = false
    showRegisterModal.value = true
}

const handleLogin = () => {
    showRegisterModal.value = false
    showLoginModal.value = true
}

const handleLogout = () => {
    console.log('已退出登录')
    // 退出登录后的处理
}

// 处理生成按钮点击
const handleGenerateClick = async () => {
    // 获取预览的提示词
    const prompt = promptsStore.previewPromptsValue
    
    if (!prompt.trim()) {
        message.warning('请先选择提示词或输入描述')
        return
    }
    
    // 设置生成的提示词
    generatedPrompt.value = prompt
    
    // 显示图片生成模态框
    showGeneratedImgModal.value = true
}

// 处理图片模态框关闭
const handleImageModalClose = () => {
    showGeneratedImgModal.value = false
    generatedPrompt.value = ''
}

// 处理连线开关变化
const handleConnectionSwitchChange = (checked: boolean) => {
    if (checked && promptsStore.autoConfigPrompts) {
        // 如果开启连线，自动关闭自动配置
        promptsStore.autoConfigPrompts = false
    }
    // 触发所有提示词卡片重新绘制连接线
    const event = new CustomEvent('connectionLinesToggled', { detail: { show: checked } })
    window.dispatchEvent(event)
}

// 处理自动配置开关变化
const handleAutoConfigSwitchChange = (checked: boolean) => {
    if (checked && promptsStore.showConnectionLines) {
        // 如果开启自动配置，自动关闭连线
        promptsStore.showConnectionLines = false
        // 触发连接线关闭事件
        const event = new CustomEvent('connectionLinesToggled', { detail: { show: false } })
        window.dispatchEvent(event)
    }
    // 开关状态变化处理
    console.log('自动配置提示词开关状态:', checked)
}

// 处理清空所有提示词
const handleClearAllPrompts = () => {
    promptsStore.clearSelectedPrompts()
    message.success('已清空所有提示词')
}

// 显示订阅信息
const showSubscriptionInfo = () => {
    if (!authStore.isAuthenticated) {
        message.warning('请先登录查看订阅信息')
        return
    }
    showSubscriptionModal.value = true
}

// 监听加载状态变化
watch(() => promptsStore.isLoading, (newVal, oldVal) => {
    if (newVal && !oldVal) {
        // 开始加载时，隐藏底部组件
        showBottomComponents.value = false
        
        // 清除之前的定时器
        if (animationTimer) {
            clearTimeout(animationTimer)
            animationTimer = null
        }
        
        // 设置4秒后显示底部组件（动画播放时间）
        animationTimer = setTimeout(() => {
            showBottomComponents.value = true
        }, 4000)
    } else if (!newVal && oldVal) {
        // 加载结束时，立即显示底部组件
        showBottomComponents.value = true
        
        // 清除定时器
        if (animationTimer) {
            clearTimeout(animationTimer)
            animationTimer = null
        }
    }
}, { immediate: true })

// 组件挂载时加载角色数据
onMounted(() => {
  // 如果角色数据未加载，则加载角色数据
  if (!roleStore.list || roleStore.list.length === 0) {
    if(useAuthStore().token.length > 1) {
      roleStore.fetchAll()
    }
  }
})

// 组件卸载时清理定时器
onUnmounted(() => {
    if (animationTimer) {
        clearTimeout(animationTimer)
        animationTimer = null
    }
})
</script>
<style scoped>
.ai-right-panel {
    height: 100%;
    color: #fff;
    overflow-x: hidden;
}

.panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid #333;
}

.panel-content {
    padding: 12px;
}

h3 {
    color: #fff;
    margin: 0;
    font-size: 18px;
}

.login-btn {
    background: linear-gradient(90deg, #222222, #111111);
    font-weight: lighter;
    border: none;
    border-radius: 6px;
    height: 32px;
    font-weight: bold;
    transition: all 0.3s ease;
    color: #c3c3c3;
}

.login-btn:hover {
    box-shadow: 0 4px 12px rgba(255, 255, 255, 0.3);
}

.login-btn.authenticated {
    background: linear-gradient(135deg, #0a1f32, #0e4a41);
    border: solid 1px #1fffe9;
    color: #fff;
}

.login-btn.authenticated:hover {
    background: linear-gradient(135deg, #18b9f4, #1cd2ffde);
    color: black;
    box-shadow: 0 4px 12px rgba(24, 197, 255, 0.948);
}

p {
    color: #ccc;
    line-height: 1.6;
}

.prompts-title {
    font-weight: lighter;
    margin-bottom: 5px;
}

/* 滚动条样式 */
.ai-right-panel::-webkit-scrollbar {
  width: 10px;
}

.ai-right-panel::-webkit-scrollbar-track {
  background: #202020;
  border-radius: 3px;
}

.ai-right-panel::-webkit-scrollbar-thumb {
  background: #393939;
  border-radius: 3px;
}

.ai-right-panel::-webkit-scrollbar-thumb:hover {
  background: #1cacb9;
}

/* 连线开关样式 */
.connection-switch-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  margin: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.switch-label {
  display: flex;
  align-items: center;
  color: #ccc;
  font-size: 14px;
  font-weight: 500;
}

/* 绿色开关样式 */
:deep(.ant-switch-checked) {
  background-color: #00bfa8;
}

:deep(.ant-switch-checked:hover) {
  background-color: #00cdb5;
}
.clear-all-prompts-btn {
    color: #c4c4c4;
    cursor: pointer;
}
.clear-all-prompts-btn:hover {

       color: #fff;

}
</style>
