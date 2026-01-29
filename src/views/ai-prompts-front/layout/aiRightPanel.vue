<template>
  <div class="ai-right-panel">
    <loginModal
      :visible="showLoginModal"
      @update:visible="showLoginModal = $event"
      @signup="handleSignup"
    />
    <userCenterModal
      :visible="showUserCenterModal"
      @update:visible="showUserCenterModal = $event"
      @logout="handleLogout"
    />
    <div class="panel-header">
      <h3><SettingOutlined />&ensp;控制中心</h3>
      <a-button
        type="primary"
        :class="{ 'login-btn': true, authenticated: authStore.isAuthenticated }"
        @click="handleLoginBtnClick"
      >
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
        <WelcomCard />
      </template>
    </div>
    <PromptWeightPanel />
    <div style="display: flex; justify-content: center">
      <GenerateButton />
    </div>
  </div>
</template>
<script setup lang="ts">
import { UserOutlined, SettingOutlined } from '@ant-design/icons-vue'
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth-store'
import RightPanelPromptsPreview from '../components/rightPanelPromptsPreview.vue'
import LoadingGenerateCard from '../components/loadingGenerateCard.vue'
import GenerateButton from '../components/generateButton.vue'
import LoginModal from '../components/loginModal.vue'
import UserCenterModal from '../components/userCenterModal.vue'
import PromptWeightPanel from '../components/promptsWeightPanel.vue'
import { aiPromptsSelectedStore } from '@/stores/aiPromptsSelected-store'
import WelcomCard from '../components/welcomCard.vue'

const promptsStore = aiPromptsSelectedStore()
const authStore = useAuthStore()
const showLoginModal = ref(false)
const showUserCenterModal = ref(false)

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
  console.log('跳转到注册页面')
  // 这里可以添加跳转到注册页面的逻辑
}

const handleLogout = () => {
  console.log('已退出登录')
  // 退出登录后的处理
}
</script>
<style scoped>
.ai-right-panel {
  height: 100%;
  color: #fff;
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
</style>
