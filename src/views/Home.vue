<template>
  <scroll-content>
    <template #content>
      <a-card title="公告">
        <div class="announcement-list">
          <div v-for="(announcement, index) in announcements" :key="index" class="announcement-item">
            <span class="announcement-number">{{ index + 1 }}、</span>
            <span class="announcement-content">{{ announcement.content }}</span>
          </div>
        </div>
      </a-card>
      <a-card title="工具栏" class="message-card">
        <a-row :gutter="[8, 8]">
          <a-col><a-button @click="handleFeedback">点我反馈意见</a-button></a-col>
          <a-col><a-button @click="handleInstruction">点我查看操作说明</a-button></a-col>
        </a-row>

      </a-card>
      <a-card title="最近系统更新内容" style="margin-top: 16px;">
        <div class="announcement-list">
          <div v-for="(announcement, index) in updates" :key="index" class="announcement-item">
            <span class="update-number">{{ index + 1 }}、</span>
            <span class="announcement-content">{{ announcement.content }}</span>
          </div>
        </div>
      </a-card>
      <!-- 反馈弹窗 -->
      <feedback-modal ref="feedbackModalRef" />

      <!-- 操作说明弹窗 -->
      <instruction-modal ref="instructionModalRef" />

    </template>
  </scroll-content>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth-store'

import ScrollContent from '@/components/scrollContent.vue'
import FeedbackModal from './home/feedbackModal.vue'
import InstructionModal from './home/instructionModal.vue'

const authStore = useAuthStore()
const feedbackModalRef = ref()
const instructionModalRef = ref()

// 公告数据
const announcements = ref([
  { content: '当前系统已适配手机版网页' },
  { content: '若系统出错请重新登录' }
])
// 更新内容数据
const updates = ref([
  { content: '优鼎工作台新增客户管理、客户-批次数据关联管理' },
  { content: '新增各工作台手机端网页' },
  { content: '首页新增“反馈”功能' },
  { content: '首页新增“操作说明”功能' },
  { content: '新增“优鼎云盘”功能，共享文件上传下载功能，目前是优鼎角色可用（公共云盘）' },
  { content: '优化界面布局、修复网页性能问题' },
])
// 处理反馈按钮点击
const handleFeedback = () => {
  feedbackModalRef.value?.open()
}

// 处理操作说明按钮点击
const handleInstruction = () => {
  instructionModalRef.value?.open()
}

// 初始化
onMounted(async () => {
  if (!authStore.isLoaded) {
    await authStore.init()
  }
})

</script>

<style scoped>
.status-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
}

.label {
  color: #7a7a7a;
}

.hint {
  margin-top: 12px;
  font-size: 13px;
  color: #fa8c16;
}

.message-card {
  margin-top: 16px;
}

.announcement-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.announcement-item {
  display: flex;
  align-items: flex-start;
  line-height: 1.5;
}

.announcement-number {
  color: #1890ff;
  font-weight: 500;
  margin-right: 8px;
  min-width: 20px;
}

.update-number {
  color: #2ee38f;
  font-weight: 500;
  margin-right: 8px;
  min-width: 20px;
}

.announcement-content {
  flex: 1;
  word-break: break-word;
}
</style>