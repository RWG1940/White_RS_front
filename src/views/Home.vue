<template>
  <scroll-content>
    <template #content>
      <a-card
        v-show="authStore.user?.roles!.includes('3294')"
        title="快捷操作栏"
        style="margin-bottom: 16px"
      >
        <div style="display: flex; gap: 16px">
          <a-button @click="handleAsPayInfo">辅料工厂收款信息管理</a-button>
        </div>
      </a-card>
      <!--若为辅料工厂角色则显示其收款信息-->
      <a-card
        v-if="authStore.user?.roles!.includes('6666') && currentFactoryPayInfo"
        title="我的收款信息"
        style="margin-bottom: 16px"
      >
        <!-- 收款信息展示 -->
        <div v-if="currentFactoryPayInfo">
          <div class="bank-info">
            <div class="info-item">
              <span class="label">银行账号：</span>
              <span class="value">{{ currentFactoryPayInfo.bankNum || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="label">开户行：</span>
              <span class="value">{{ currentFactoryPayInfo.bankName || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="label">户名：</span>
              <span class="value">{{ currentFactoryPayInfo.huName || '-' }}</span>
            </div>
          </div>
          <a-divider />
          <a-row :gutter="[24, 16]">
            <a-col v-if="currentFactoryPayInfo.wechatQr" :xs="24" :sm="8">
              <div class="qr-code-item">
                <div class="qr-title">微信好友二维码</div>
                <a-image
                  :width="180"
                  :height="230"
                  :src="getImageUrl(currentFactoryPayInfo.wechatQr)"
                  style="border-radius: 10px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1)"
                />
              </div>
            </a-col>
            <a-col v-if="currentFactoryPayInfo.wechatPay" :xs="24" :sm="8">
              <div class="qr-code-item">
                <div class="qr-title">微信收款码</div>
                <a-image
                  :width="180"
                  :height="230"
                  :src="getImageUrl(currentFactoryPayInfo.wechatPay)"
                  style="border-radius: 10px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1)"
                />
              </div>
            </a-col>
            <a-col v-if="currentFactoryPayInfo.aliPay" :xs="24" :sm="8">
              <div class="qr-code-item">
                <div class="qr-title">支付宝收款码</div>
                <a-image
                  :width="180"
                  :height="230"
                  :src="getImageUrl(currentFactoryPayInfo.aliPay)"
                  style="border-radius: 10px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1)"
                />
              </div>
            </a-col>
          </a-row>
        </div>
      </a-card>

      <!-- 辅料工厂未设置收款信息提示 -->
      <a-card
        v-if="authStore.user?.roles!.includes('6666') && !currentFactoryPayInfo"
        title="我的收款信息"
        style="margin-bottom: 16px"
      >
        <a-empty description="暂未设置收款信息" />
      </a-card>
      <!-- 批次收款信息卡片 -->
      <template v-for="(batches, key) in batchGroups" :key="key">
        <a-card style="margin-bottom: 16px">
          <!-- 折叠/展开按钮和标题 -->
          <div class="pay-info-header">
            <h3 class="pay-info-title">收款信息</h3>
            <a-button type="link" @click="toggleCollapse(key)" style="padding: 0">
              {{ collapsedPayInfos[key] ? '展开' : '收起' }}
              <template #icon>
                <span>{{ collapsedPayInfos[key] ? '▼' : '▲' }}</span>
              </template>
            </a-button>
          </div>

          <!-- 收款信息 -->
          <div v-if="!collapsedPayInfos[key] && batches[0]?.payInfo">
            <div class="bank-info">
              <div class="info-item">
                <span class="label">银行账号：</span>
                <span class="value">{{ batches[0].payInfo.bankNum || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="label">开户行：</span>
                <span class="value">{{ batches[0].payInfo.bankName || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="label">户名：</span>
                <span class="value">{{ batches[0].payInfo.huName || '-' }}</span>
              </div>
            </div>
            <a-divider />
            <a-row :gutter="[24, 16]">
              <a-col v-if="batches[0].payInfo.wechatQr" :xs="24" :sm="8">
                <div class="qr-code-item">
                  <div class="qr-title">微信好友二维码</div>
                  <a-image
                    :width="180"
                    :height="230"
                    :src="getImageUrl(batches[0].payInfo.wechatQr)"
                    style="border-radius: 10px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1)"
                  />
                </div>
              </a-col>
              <a-col v-if="batches[0].payInfo.wechatPay" :xs="24" :sm="8">
                <div class="qr-code-item">
                  <div class="qr-title">微信收款码</div>
                  <a-image
                    :width="180"
                    :height="230"
                    :src="getImageUrl(batches[0].payInfo.wechatPay)"
                    style="border-radius: 10px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1)"
                  />
                </div>
              </a-col>
              <a-col v-if="batches[0].payInfo.aliPay" :xs="24" :sm="8">
                <div class="qr-code-item">
                  <div class="qr-title">支付宝收款码</div>
                  <a-image
                    :width="180"
                    :height="230"
                    :src="getImageUrl(batches[0].payInfo.aliPay)"
                    style="border-radius: 10px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1)"
                  />
                </div>
              </a-col>
            </a-row>
          </div>
          <div v-if="!collapsedPayInfos[key] && !batches[0]?.payInfo" class="no-pay-info">
            <a-empty description="暂无收款信息" :image-style="{ height: '80px' }" />
          </div>

          <!-- 关联的批次列表 -->
          <a-divider v-if="!collapsedPayInfos[key]" />
          <h4 v-if="!collapsedPayInfos[key]" class="batch-list-title">
            订单 ({{ batches.length }})
          </h4>
          <div v-if="!collapsedPayInfos[key]" class="batch-list">
            <div v-for="batch in batches" :key="batch.id" class="batch-item">
              <a-tag color="blue">{{ batch.fileName || batch.period }}</a-tag>
            
            </div>
          </div>
        </a-card>
      </template>

      <!-- 无收款信息的批次 -->
      <a-card v-if="Object.keys(batchGroups).length === 0" style="margin-bottom: 16px">
        <a-empty description="暂无批次收款信息" />
      </a-card>

      <a-card title="公告">
        <div class="announcement-list">
          <div
            v-for="(announcement, index) in announcements"
            :key="index"
            class="announcement-item"
          >
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
      <a-card title="最近系统更新内容-2026.03.23" style="margin-top: 16px">
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

      <!-- 支付信息管理弹窗 -->
      <as-pay-info-modal ref="asPayInfoModalRef" />
    </template>
  </scroll-content>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth-store'

import ScrollContent from '@/components/scrollContent.vue'
import FeedbackModal from './home/feedbackModal.vue'
import InstructionModal from './home/instructionModal.vue'
import AsPayInfoModal from './home/asPayInfoModal.vue'
import {
  asUserOptions,
  getSupplyFactory,
  getBatchesByFactory,
  factoryBatchs,
} from '@/stores/acc-store'
import { useAsPayInfoStore } from '@/stores/asPayInfo-store'
import type { AsPayInfoType } from '@/types/asPayInfo-type'
import { getBackendUrl } from '@/utils/getApiUrl'

const authStore = useAuthStore()
const feedbackModalRef = ref()
const instructionModalRef = ref()
const asPayInfoModalRef = ref()

// 收款信息Store
const asPayInfoStore = useAsPayInfoStore()

// 公告数据
const announcements = ref([
  { content: '当前系统已适配手机版网页' },
  { content: '若系统出错请重新登录' },
])
// 更新内容数据
const updates = ref([
  { content: '限制辅料工厂无法新建批次号' },
  { content: '“数量”字段重命名为“洗标数量”' },
  { content: '新增“吊牌数量”字段（位于洗标与吊牌实际出货数量之间）' },
  { content: '各页面辅料数据按时间升序排列' },
  { content: '工作台支持批次号隐藏功能' },
  { content: '工作台支持季度隐藏功能' },
  { content: '辅料工厂页面新增批次号备注功能' },
  { content: '优化辅料工厂页面字段展示' },
  { content: '支持勾选项数量自动汇总' },
  { content: '备注字段支持导入与导出' },
  { content: '支持多个辅料工厂管理' },
  { content: '支持查看不同辅料工厂的收款信息' },
])


// 处理反馈按钮点击
const handleFeedback = () => {
  feedbackModalRef.value?.open()
}

// 处理操作说明按钮点击
const handleInstruction = () => {
  instructionModalRef.value?.open()
}

// 处理支付信息管理按钮点击
const handleAsPayInfo = () => {
  asPayInfoModalRef.value?.open()
}

// 图片URL处理
const getImageUrl = (imageUrl: string | undefined) => {
  if (!imageUrl) return ''
  const baseUrl = getBackendUrl()
  if (
    imageUrl.startsWith('http://') ||
    imageUrl.startsWith('https://') ||
    imageUrl.startsWith('data:')
  ) {
    return imageUrl
  }
  return `${baseUrl}${imageUrl}`
}

// 根据辅料工厂ID获取工厂名称
const getFactoryName = (asId: number | undefined) => {
  if (!asId) return '未关联辅料工厂'
  const factory = asUserOptions.value.find((item: any) => item.value === asId)
  return factory ? factory.label : '未知的辅料工厂'
}

// 根据辅料工厂ID获取收款信息
const getPayInfoByFactoryId = (asId: number | undefined) => {
  if (!asId) return null
  const payInfos = asPayInfoStore.list as AsPayInfoType[]
  return payInfos.find((info: AsPayInfoType) => info.asName === getFactoryName(asId))
}

// 折叠状态
const collapsedPayInfos = ref<Record<string, boolean>>({})

// 切换折叠状态
const toggleCollapse = (key: string) => {
  collapsedPayInfos.value[key] = !collapsedPayInfos.value[key]
}

// 计算按收款信息分组的批次
const batchGroups = computed(() => {
  const batches = factoryBatchs.value as any[]
  const groups: Record<string, any[]> = {}

  batches.forEach((batch) => {
    if (!batch.asId) return

    const payInfo = getPayInfoByFactoryId(batch.asId)
    const key = payInfo
      ? payInfo.id || payInfo.asName || `unknown-${batch.asId}`
      : `no-payinfo-${batch.asId}`

    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push({ ...batch, payInfo })
  })

  return groups
})

// 获取当前用户名对应的辅料工厂收款信息
const getCurrentASUserPayInfo = async () => {
  asPayInfoStore.exactData = { as_name: authStore.user?.username } as any
  asPayInfoStore.exact()
}

// 当前辅料工厂的收款信息
const currentFactoryPayInfo = computed(() => {
  if (!authStore.user?.roles!.includes('6666')) return null
  const results = asPayInfoStore.searchResults as AsPayInfoType[]
  return results && results.length > 0 ? results[0] : null
})
// 初始化
onMounted(async () => {
  if (!authStore.isLoaded) {
    await authStore.init()
  }
  await getBatchesByFactory(authStore.user?.username!)
  await getSupplyFactory()
  await asPayInfoStore.fetchAll()
  await getCurrentASUserPayInfo()
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

/* 收款信息卡片样式 */
.pay-info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.pay-info-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

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

.no-pay-info {
  padding: 20px 0;
}

.batch-list-title {
  margin: 16px 0 12px 0;
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.batch-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 6px;
}

.batch-item {
  display: flex;
  align-items: center;
  gap: 8px;
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

  .pay-info-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
