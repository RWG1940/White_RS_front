<template>
  <div class="pricing-container">
    <!-- 顶部横幅 -->
    <div class="pricing-hero">
      <div class="hero-content">
        <h1 class="hero-title">
          <DollarOutlined />
          选择适合您的计划
        </h1>
        <p class="hero-subtitle">灵活定价，满足不同需求，助力您的AI创作之旅</p>
        
        <!-- 计费周期切换 -->
        <div class="billing-toggle">
          <span :class="{ active: billingCycle === 'monthly' }" @click="billingCycle = 'monthly'">
            月付
          </span>
          <div class="toggle-switch" @click="toggleBillingCycle">
            <div class="toggle-slider" :class="{ yearly: billingCycle === 'yearly' }"></div>
          </div>
          <span :class="{ active: billingCycle === 'yearly' }" @click="billingCycle = 'yearly'">
            年付
            <span class="discount-badge">节省 20%</span>
          </span>
        </div>
      </div>
    </div>

    <!-- 定价卡片 -->
    <div class="pricing-cards">
      <div 
        v-for="plan in pricingPlans" 
        :key="plan.id"
        :class="['pricing-card', { featured: plan.featured }]"
      >
        <div class="card-header">
          <div class="plan-name">{{ plan.name }}</div>
          <div class="plan-description">{{ plan.description }}</div>
          <div class="price-section">
            <div class="price">
              <span class="currency">¥</span>
              <span class="amount">{{ getPrice(plan) }}</span>
              <span class="period">/{{ billingCycle === 'monthly' ? '月' : '年' }}</span>
            </div>
            <div v-if="plan.originalPrice" class="original-price">
              ¥{{ plan.originalPrice }}
            </div>
          </div>
          <button 
            :class="['select-btn', { primary: plan.featured, outline: !plan.featured }]"
            @click="selectPlan(plan)"
          >
            {{ plan.featured ? '立即购买' : '选择此计划' }}
          </button>
        </div>

        <div class="card-features">
          <div class="features-title">包含功能</div>
          <div 
            v-for="feature in plan.features" 
            :key="feature"
            class="feature-item"
          >
            <CheckCircleOutlined class="feature-icon" />
            {{ feature }}
          </div>
        </div>

        <div v-if="plan.limitations" class="card-limitations">
          <div class="limitations-title">限制</div>
          <div 
            v-for="limitation in plan.limitations" 
            :key="limitation"
            class="limitation-item"
          >
            <ExclamationCircleOutlined class="limitation-icon" />
            {{ limitation }}
          </div>
        </div>
      </div>
    </div>

    <!-- 功能对比表 -->
    <div class="feature-comparison">
      <div class="comparison-header">
        <h2 class="comparison-title">详细功能对比</h2>
        <p class="comparison-subtitle">了解各计划的具体差异</p>
      </div>
      
      <div class="comparison-table">
        <div class="table-header">
          <div class="feature-column">功能特性</div>
          <div 
            v-for="plan in pricingPlans" 
            :key="plan.id"
            :class="['plan-column', { featured: plan.featured }]"
          >
            {{ plan.name }}
          </div>
        </div>
        
        <div 
          v-for="feature in comparisonFeatures" 
          :key="feature.name"
          class="table-row"
        >
          <div class="feature-column">
            <span class="feature-name">{{ feature.name }}</span>
            <span v-if="feature.description" class="feature-desc">{{ feature.description }}</span>
          </div>
          <div 
            v-for="plan in pricingPlans" 
            :key="plan.id"
            class="plan-column"
          >
            <template v-if="feature.values[plan.id]">
              <CheckCircleFilled v-if="feature.values[plan.id] === true" class="check-icon" />
              <span v-else-if="typeof feature.values[plan.id] === 'string'">{{ feature.values[plan.id] }}</span>
              <span v-else-if="typeof feature.values[plan.id] === 'number'">{{ feature.values[plan.id] }}</span>
            </template>
            <CloseCircleFilled v-else class="close-icon" />
          </div>
        </div>
      </div>
    </div>

    <!-- 常见问题 -->
    <div class="faq-section">
      <div class="faq-header">
        <h2 class="faq-title">常见问题</h2>
        <p class="faq-subtitle">解答您的疑问</p>
      </div>
      
      <div class="faq-list">
        <div 
          v-for="(faq, index) in faqs" 
          :key="index"
          class="faq-item"
          :class="{ active: activeFaq === index }"
          @click="toggleFaq(index)"
        >
          <div class="faq-question">
            <span>{{ faq.question }}</span>
            <DownOutlined class="faq-arrow" :class="{ rotated: activeFaq === index }" />
          </div>
          <div class="faq-answer">
            {{ faq.answer }}
          </div>
        </div>
      </div>
    </div>

    <!-- 底部行动号召 -->
    <div class="pricing-cta">
      <div class="cta-content">
        <h2 class="cta-title">还有疑问？</h2>
        <p class="cta-description">我们的客服团队随时为您提供帮助</p>
        <div class="cta-buttons">
          <button class="cta-btn primary">联系客服</button>
          <button class="cta-btn outline">查看文档</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  DollarOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  DownOutlined
} from '@ant-design/icons-vue'

const billingCycle = ref<'monthly' | 'yearly'>('monthly')
const activeFaq = ref<number | null>(null)

const toggleBillingCycle = () => {
  billingCycle.value = billingCycle.value === 'monthly' ? 'yearly' : 'monthly'
}

const pricingPlans = [
  {
    id: 'free',
    name: '免费版',
    description: '适合个人用户入门体验',
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      '每日10次AI绘画生成',
      '基础图片分辨率',
      '5种基础艺术风格',
      '社区作品浏览',
      '基础教程访问'
    ],
    limitations: [
      '不支持商业用途',
      '生成图片带水印',
      '不支持批量生成'
    ],
    featured: false
  },
  {
    id: 'pro',
    name: '专业版',
    description: '适合创作者和设计师',
    monthlyPrice: 99,
    yearlyPrice: 79,
    originalPrice: 1188,
    features: [
      '无限次AI绘画生成',
      '高清图片分辨率',
      '50+种艺术风格',
      '自定义模型训练',
      '批量生成功能',
      '商业使用授权',
      '优先技术支持',
      '无水印输出'
    ],
    limitations: [],
    featured: true
  },
  {
    id: 'enterprise',
    name: '企业版',
    description: '适合团队和商业机构',
    monthlyPrice: 299,
    yearlyPrice: 239,
    originalPrice: 3588,
    features: [
      '所有专业版功能',
      '团队协作管理',
      'API接口访问',
      '私有模型部署',
      '专属客户经理',
      '定制化开发',
      'SLA服务保障',
      '数据安全保障'
    ],
    limitations: [],
    featured: false
  }
]

const comparisonFeatures = [
  {
    name: '生成次数',
    description: '每日AI绘画生成次数',
    values: {
      free: '10次/日',
      pro: '无限',
      enterprise: '无限'
    }
  },
  {
    name: '图片分辨率',
    description: '支持的最大图片分辨率',
    values: {
      free: '1024x1024',
      pro: '2048x2048',
      enterprise: '4096x4096'
    }
  },
  {
    name: '艺术风格',
    description: '可用的艺术风格数量',
    values: {
      free: 5,
      pro: '50+',
      enterprise: '100+'
    }
  },
  {
    name: '批量生成',
    values: {
      free: false,
      pro: true,
      enterprise: true
    }
  },
  {
    name: '商业授权',
    values: {
      free: false,
      pro: true,
      enterprise: true
    }
  },
  {
    name: 'API访问',
    values: {
      free: false,
      pro: false,
      enterprise: true
    }
  },
  {
    name: '团队协作',
    values: {
      free: false,
      pro: false,
      enterprise: true
    }
  },
  {
    name: '专属支持',
    values: {
      free: false,
      pro: true,
      enterprise: true
    }
  }
]

const faqs = [
  {
    question: '可以免费试用吗？',
    answer: '是的，我们提供免费版计划，包含基础功能供您体验。专业版和企业版也提供7天免费试用期。'
  },
  {
    question: '如何取消订阅？',
    answer: '您可以在账户设置中随时取消订阅，取消后服务将持续到当前计费周期结束。'
  },
  {
    question: '支持哪些支付方式？',
    answer: '我们支持支付宝、微信支付、银行卡等多种支付方式。'
  },
  {
    question: '是否可以升级或降级计划？',
    answer: '可以随时升级计划，升级后立即生效。降级将在当前计费周期结束后生效。'
  },
  {
    question: '是否支持发票？',
    answer: '是的，所有付费计划都支持开具增值税发票。'
  }
]

const getPrice = (plan: any) => {
  return billingCycle.value === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice
}

const selectPlan = (plan: any) => {
  console.log('选择计划:', plan.name)
  // 这里可以添加实际的选择逻辑
}

const toggleFaq = (index: number) => {
  activeFaq.value = activeFaq.value === index ? null : index
}
</script>

<style scoped>
.pricing-container {
  min-height: 100%;
  background: #202020;
  color: #fff;
  padding-bottom: 60px;
}

/* 顶部横幅 */
.pricing-hero {
  background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
  padding: 60px 0 40px;
  text-align: center;
  border-bottom: 1px solid #333;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

.hero-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #18d5ff, #1ac49f);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.hero-subtitle {
  font-size: 1.2rem;
  color: #ccc;
  margin-bottom: 40px;
}

/* 计费周期切换 */
.billing-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  background: #2a2a2a;
  padding: 12px 24px;
  border-radius: 8px;
  border: 1px solid #333;
  max-width: 300px;
  margin: 0 auto;
}

.billing-toggle span {
  color: #999;
  cursor: pointer;
  transition: color 0.3s ease;
  font-weight: 500;
  position: relative;
}

.billing-toggle span.active {
  color: #18d5ff;
}

.discount-badge {
  position: absolute;
  top: -20px;
  right: -10px;
  background: #ff4d4f;
  color: #fff;
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: normal;
}

.toggle-switch {
  width: 50px;
  height: 24px;
  background: #444;
  border-radius: 12px;
  position: relative;
  cursor: pointer;
  transition: background 0.3s ease;
}

.toggle-switch:hover {
  background: #555;
}

.toggle-slider {
  width: 20px;
  height: 20px;
  background: #fff;
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: transform 0.3s ease;
}

.toggle-slider.yearly {
  transform: translateX(26px);
}

/* 定价卡片 */
.pricing-cards {
  max-width: 1200px;
  margin: 0 auto;
  padding: 60px 20px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 30px;
}

.pricing-card {
  background: #2a2a2a;
  border-radius: 12px;
  border: 1px solid #333;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.pricing-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.pricing-card.featured {
  border-color: #18d5ff;
  box-shadow: 0 0 0 1px #18d5ff;
}

.pricing-card.featured::before {
  content: '推荐';
  position: absolute;
  top: 0;
  right: 0;
  background: linear-gradient(135deg, #18d5ff, #1ac49f);
  color: #fff;
  padding: 4px 12px;
  font-size: 0.8rem;
  font-weight: 500;
  border-bottom-left-radius: 8px;
}

.card-header {
  padding: 30px;
  text-align: center;
  border-bottom: 1px solid #333;
}

.plan-name {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: #fff;
}

.plan-description {
  color: #ccc;
  margin-bottom: 20px;
  font-size: 0.9rem;
}

.price-section {
  margin-bottom: 24px;
}

.price {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 4px;
  margin-bottom: 8px;
}

.currency {
  font-size: 1.2rem;
  color: #18d5ff;
}

.amount {
  font-size: 3rem;
  font-weight: 700;
  color: #18d5ff;
  line-height: 1;
}

.period {
  color: #999;
  font-size: 1rem;
}

.original-price {
  color: #999;
  text-decoration: line-through;
  font-size: 0.9rem;
}

.select-btn {
  width: 100%;
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.select-btn.primary {
  background: linear-gradient(135deg, #1890ff, #1ac49f);
  color: #fff;
}

.select-btn.primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
}

.select-btn.outline {
  background: transparent;
  border: 1px solid #444;
  color: #ccc;
}

.select-btn.outline:hover {
  border-color: #18d5ff;
  color: #fff;
}

.card-features {
  padding: 24px 30px;
}

.features-title {
  font-weight: 600;
  margin-bottom: 16px;
  color: #fff;
  font-size: 1.1rem;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  color: #ccc;
  font-size: 0.9rem;
}

.feature-icon {
  color: #1ac49f;
  font-size: 0.8rem;
}

.card-limitations {
  padding: 20px 30px;
  background: #1a1a1a;
  border-top: 1px solid #333;
}

.limitations-title {
  font-weight: 600;
  margin-bottom: 12px;
  color: #ff4d4f;
  font-size: 0.9rem;
}

.limitation-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  color: #999;
  font-size: 0.8rem;
}

.limitation-icon {
  color: #ff4d4f;
  font-size: 0.7rem;
}

/* 功能对比表 */
.feature-comparison {
  max-width: 1200px;
  margin: 0 auto 60px;
  padding: 0 20px;
}

.comparison-header {
  text-align: center;
  margin-bottom: 40px;
}

.comparison-title {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: #fff;
}

.comparison-subtitle {
  color: #ccc;
  font-size: 1.1rem;
}

.comparison-table {
  background: #2a2a2a;
  border-radius: 12px;
  border: 1px solid #333;
  overflow: hidden;
}

.table-header {
  display: grid;
  grid-template-columns: 1fr repeat(3, 1fr);
  background: #1a1a1a;
  border-bottom: 1px solid #333;
}

.feature-column {
  padding: 20px;
  font-weight: 600;
  color: #fff;
}

.plan-column {
  padding: 20px;
  text-align: center;
  font-weight: 600;
  color: #fff;
  border-left: 1px solid #333;
}

.plan-column.featured {
  background: linear-gradient(135deg, #11589a, #0b5142);
}

.table-row {
  display: grid;
  grid-template-columns: 1fr repeat(3, 1fr);
  border-bottom: 1px solid #333;
}

.table-row:last-child {
  border-bottom: none;
}

.table-row .feature-column {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.feature-name {
  font-weight: 500;
}

.feature-desc {
  font-size: 0.8rem;
  color: #999;
  font-weight: normal;
}

.table-row .plan-column {
  display: flex;
  align-items: center;
  justify-content: center;
  border-left: 1px solid #333;
}

.check-icon {
  color: #1ac49f;
  font-size: 1.2rem;
}

.close-icon {
  color: #ff4d4f;
  font-size: 1.2rem;
}

/* 常见问题 */
.faq-section {
  max-width: 800px;
  margin: 0 auto 60px;
  padding: 0 20px;
}

.faq-header {
  text-align: center;
  margin-bottom: 40px;
}

.faq-title {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: #fff;
}

.faq-subtitle {
  color: #ccc;
  font-size: 1.1rem;
}

.faq-list {
  background: #2a2a2a;
  border-radius: 12px;
  border: 1px solid #333;
  overflow: hidden;
}

.faq-item {
  border-bottom: 1px solid #333;
  cursor: pointer;
  transition: background 0.3s ease;
}

.faq-item:last-child {
  border-bottom: none;
}

.faq-item:hover {
  background: #3a3a3a;
}

.faq-item.active {
  background: #3a3a3a;
}

.faq-question {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 500;
  color: #fff;
}

.faq-arrow {
  transition: transform 0.3s ease;
  color: #999;
}

.faq-arrow.rotated {
  transform: rotate(180deg);
}

.faq-answer {
  padding: 0 20px 20px;
  color: #ccc;
  line-height: 1.6;
  display: none;
}

.faq-item.active .faq-answer {
  display: block;
}

/* 底部行动号召 */
.pricing-cta {
  max-width: 600px;
  margin: 0 auto;
  padding: 0 20px;
  text-align: center;
}

.cta-content {
  background: #2a2a2a;
  border-radius: 12px;
  padding: 40px;
  border: 1px solid #333;
}

.cta-title {
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 16px;
  color: #fff;
}

.cta-description {
  color: #ccc;
  margin-bottom: 30px;
  font-size: 1.1rem;
}

.cta-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.cta-btn {
  padding: 12px 32px;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.cta-btn.primary {
  background: linear-gradient(135deg, #1890ff, #1ac49f);
  color: #fff;
}

.cta-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(24, 144, 255, 0.3);
}

.cta-btn.outline {
  background: transparent;
  border: 1px solid #444;
  color: #ccc;
}

.cta-btn.outline:hover {
  border-color: #18d5ff;
  color: #fff;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .pricing-cards {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .comparison-table,
  .table-header,
  .table-row {
    grid-template-columns: 1fr;
  }
  
  .feature-column,
  .plan-column {
    border-left: none;
    border-bottom: 1px solid #333;
    text-align: left;
  }
  
  .plan-column.featured {
    background: #1a1a1a;
  }
  
  .cta-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .cta-btn {
    width: 100%;
    max-width: 300px;
  }
}
</style>