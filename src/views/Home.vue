<template>
  <scroll-content>
    <template #content>

      <a-card title="辅料工厂收款信息" style="margin-bottom: 16px;">
        <a-row :gutter="[16, 16]">
          <a-col :span="24">
            <div class="bank-info">
              <div class="info-item">
                <span class="label">银行账号：</span>
                <span class="value">6217 0014 3000 9420 110</span>
              </div>
              <div class="info-item">
                <span class="label">开户行：</span>
                <span class="value">建设银行（开户网点：建行海盐南门支行）</span>
              </div>
              <div class="info-item">
                <span class="label">户名：</span>
                <span class="value">王雪峰</span>
              </div>
            </div>
          </a-col>
        </a-row>
        <a-divider />
        <a-row :gutter="[24, 16]">
          <a-col :xs="24" :sm="8">
            <div class="qr-code-item">
              <div class="qr-title">辅料工厂微信</div>
              <a-image :width="180" :height="230" src="/images/flgc_wechat.png" style="border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);" />
            </div>
          </a-col>
          <a-col :xs="24" :sm="8">
            <div class="qr-code-item">
              <div class="qr-title">辅料工厂微信收款码</div>
              <a-image :width="180" :height="230" src="/images/flgc_wechat_pay.png" style="border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);" />
            </div>
          </a-col>
          <a-col :xs="24" :sm="8">
            <div class="qr-code-item">
              <div class="qr-title">辅料工厂支付宝收款码</div>
              <a-image :width="180" :height="230" src="/images/flgc_zfb_pay.jpg" style="border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);" />
            </div>
          </a-col>
        </a-row>
      </a-card>

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
      <a-card title="最近系统更新内容-2026.01.09" style="margin-top: 16px;">
        <div class="announcement-list">
          <div v-for="(announcement, index) in updates" :key="index" class="announcement-item">
            <span class="update-number">{{ index + 1 }}、</span>
            <span class="announcement-content">{{ announcement.content }}</span>
          </div>
        </div>
      </a-card>

      <a-card title="未来将要更新内容" style="margin-top: 16px;">
        <div class="announcement-list">
          <div v-for="(announcement, index) in fetureUpdates" :key="index" class="announcement-item">
            <span class="feture-update-number">{{ index + 1 }}、</span>
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
  { content: '首页展示辅料工厂收款信息' },
  { content: '表格选中数据的总金额保留四位小数' },
  { content: '工厂页、跟单页显示错误' },


])
// 待更新内容数据
const fetureUpdates = ref([
  { content: '“优鼎云盘-通过excel分发文件给对应工厂”功能' },
  { content: '“工作台-一次性导入多个批次数据”功能' },
  { content: '“优鼎云盘-个人云盘”功能，所有用户都能使用云盘功能' },
  { content: '“个人中心-我分享的文件”功能，能撤销分享的文件' },
  { content: '“数据统计”功能，能查看各工作台数据统计，直观查看如数据更新条数，数量金额统计等，以统计图的形式显示' },
  { content: '“用户资料的细化，头像修改，找回密码等' },
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

.feture-update-number {
  color: #fa8c16;
  font-weight: 500;
  margin-right: 8px;
  min-width: 20px;
}

/* 辅料工厂信息样式 */
.bank-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 8px 0;
}

.info-item {
  display: flex;
  align-items: center;
  font-size: 15px;
  line-height: 1.5;
}

.info-item .label {
  color: #666;
  font-weight: 500;
  min-width: 70px;
  margin-right: 8px;
}

.info-item .value {
  color: #333;
  font-weight: 400;
}

.qr-code-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  background: #fafafa;
}

.qr-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin: 0;
}

.qr-image {
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 响应式适配 */
@media (max-width: 768px) {
  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .info-item .label {
    min-width: auto;
  }

  .qr-code-item {
    margin-bottom: 16px;
  }
}
</style>