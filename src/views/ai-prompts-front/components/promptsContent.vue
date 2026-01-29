<template>
  <div class="prompts-container">
    <div class="prompts-input">
      <div class="input-header">
        <p class="input-title">
          <BulbOutlined />
          请描述您希望获得的图片
        </p>
      </div>

      <div class="input-area">
        <div class="textarea-container">
          <textarea
            v-model="inputValue"
            :placeholder="placeholder"
            :maxlength="500"
            class="custom-textarea"
            @input="handleInput"
          ></textarea>
          <div class="char-count">{{ inputValue.length }}/500</div>
        </div>
      </div>

      <div class="submit-section">
        <div class="photo-type-buttons">
          <button
            v-for="type in photoTypes"
            :key="type.value"
            :class="['photo-type-btn', { active: selectedPhotoType === type.value }]"
            @click="selectPhotoType(type.value)"
          >
            {{ type.label }}
          </button>
        </div>
        <button :disabled="!inputValue.trim()"  @click="handleGenerateClick" class="submit-btn">
          <SendOutlined />
          生成提示词
        </button>
      </div>
    </div>
    <!-- 复用提示词卡片--人像摄影 -->
    <div v-show="selectedPhotoType === 'portrait'" class="prompts-cards-container">
      <!-- 人物配置提示词卡片 -->
      <promptsCard
        :title="personCard.title"
        :subcategories="personCard.subcategories"
        @apply="handleCardApply"
        @clear="handleCardClear"
      />
       <!-- 通用摄影卡片 -->
      <promptsCard
        :title="commonCard.title"
        :subcategories="commonCard.subcategories"
        @apply="handleCardApply"
        @clear="handleCardClear"
      />
      <!-- 通用输出提示词卡片 -->
       <promptsCard
        :title="commonOutputCard.title"
        :subcategories="commonOutputCard.subcategories"
        @apply="handleCardApply"
        @clear="handleCardClear"
      />
      <!-- 构图与视角提示词卡片 -->
      <promptsCard
        :title="compositionCard.title"
        :subcategories="compositionCard.subcategories"
        @apply="handleCardApply"
        @clear="handleCardClear"
      />
      
      <!-- 光线系统提示词卡片 -->
      <promptsCard
        :title="lightingCard.title"
        :subcategories="lightingCard.subcategories"
        @apply="handleCardApply"
        @clear="handleCardClear"
      />
      <!-- 色彩与风格提示词卡片 -->
      <promptsCard
        :title="colorStyleCard.title"
        :subcategories="colorStyleCard.subcategories"
        @apply="handleCardApply"
        @clear="handleCardClear"
      />
      <!-- 场景与环境提示词卡片 -->
      <promptsCard
        :title="sceneCard.title"
        :subcategories="sceneCard.subcategories"
        @apply="handleCardApply"
        @clear="handleCardClear"
      />
      <!-- 后期与氛围提示词卡片 -->
      <promptsCard
        :title="postProcessingCard.title"
        :subcategories="postProcessingCard.subcategories"
        @apply="handleCardApply"
        @clear="handleCardClear"
      />
     
    </div>
    <!-- 复用提示词卡片--产品摄影 -->
    <div v-show="selectedPhotoType === 'product'" class="prompts-cards-container">
      <!-- 产品配置提示词卡片 -->
      <promptsCard
        :title="productCard.title"
        :subcategories="productCard.subcategories"
        @apply="handleCardApply"
        @clear="handleCardClear"
      />
      <!-- 通用摄影卡片 -->
      <promptsCard
        :title="commonCard.title"
        :subcategories="commonCard.subcategories"
        @apply="handleCardApply"
        @clear="handleCardClear"
      />
      <!-- 通用输出提示词卡片 -->
       <promptsCard
        :title="commonOutputCard.title"
        :subcategories="commonOutputCard.subcategories"
        @apply="handleCardApply"
        @clear="handleCardClear"
      />
      <!-- 构图与视角提示词卡片 -->
      <promptsCard
        :title="compositionCardProduct.title"
        :subcategories="compositionCardProduct.subcategories"
        @apply="handleCardApply"
        @clear="handleCardClear"
      />
      <!-- 灯光系统提示词卡片 -->
      <promptsCard
        :title="lightingCardProduct.title"
        :subcategories="lightingCardProduct.subcategories"
        @apply="handleCardApply"
        @clear="handleCardClear"
      />
      <!-- 背景与场景提示词卡片 -->
      <promptsCard
        :title="backgroundCardProduct.title"
        :subcategories="backgroundCardProduct.subcategories"
        @apply="handleCardApply"
        @clear="handleCardClear"
      />
      <!-- 色彩与风格提示词卡片 -->
      <promptsCard
        :title="colorStyleCardProduct.title"
        :subcategories="colorStyleCardProduct.subcategories"
        @apply="handleCardApply"
        @clear="handleCardClear"
      />
      <!-- 使用场景/氛围提示词卡片 -->
      <promptsCard
        :title="useSeceneCardProduct.title"
        :subcategories="useSeceneCardProduct.subcategories"
        @apply="handleCardApply"
        @clear="handleCardClear"
      />
      <!-- 后期与商业风格提示词卡片 -->
      <promptsCard
        :title="postProcessingCardProduct.title"
        :subcategories="postProcessingCardProduct.subcategories"
        @apply="handleCardApply"
        @clear="handleCardClear"
      />
    </div>
    <!-- 复用提示词卡片--风景摄影 -->
    <div v-show="selectedPhotoType === 'landscape'" class="prompts-cards-container">
      <!-- 场景主体提示词卡片 -->
      <promptsCard
        :title="landscapeCard.title"
        :subcategories="landscapeCard.subcategories"
        @apply="handleCardApply"
        @clear="handleCardClear"
      />
      <!-- 通用摄影卡片 -->
      <promptsCard
        :title="commonCard.title"
        :subcategories="commonCard.subcategories"
        @apply="handleCardApply"
        @clear="handleCardClear"
      />
      <!-- 通用输出提示词卡片 -->
       <promptsCard
        :title="commonOutputCard.title"
        :subcategories="commonOutputCard.subcategories"
        @apply="handleCardApply"
        @clear="handleCardClear"
      />
      <!-- 地理环境提示词卡片 -->
      <promptsCard
        :title="placeCard.title"
        :subcategories="placeCard.subcategories"
        @apply="handleCardApply"
        @clear="handleCardClear"
      />
      <!-- 构图与视角提示词卡片 -->
      <promptsCard
        :title="compositionCardLandscape.title"
        :subcategories="compositionCardLandscape.subcategories"
        @apply="handleCardApply"
        @clear="handleCardClear"
      />
      <!-- 光线与时间提示词卡片 -->
      <promptsCard
        :title="lightingCardLandscape.title"
        :subcategories="lightingCardLandscape.subcategories"
        @apply="handleCardApply"
        @clear="handleCardClear"
      />
      <!-- 天气与自然元素提示词卡片 -->
      <promptsCard
        :title="weatherCard.title"
        :subcategories="weatherCard.subcategories"
        @apply="handleCardApply"
        @clear="handleCardClear"
      />
      <!-- 色彩与风格提示词卡片 -->
      <promptsCard
        :title="colorStyleCardLandscape.title"
        :subcategories="colorStyleCardLandscape.subcategories"
        @apply="handleCardApply"
        @clear="handleCardClear"
      />
      <!-- 季节与氛围提示词卡片 -->
      <promptsCard
        :title="seasonCard.title"
        :subcategories="seasonCard.subcategories"
        @apply="handleCardApply"
        @clear="handleCardClear"
      />
      <!-- 后期与艺术风格提示词卡片 -->
      <promptsCard
        :title="postProcessingCardLandscape.title"
        :subcategories="postProcessingCardLandscape.subcategories"
        @apply="handleCardApply"
        @clear="handleCardClear"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { BulbOutlined, SendOutlined } from '@ant-design/icons-vue'
import PromptsCard from './promptsCard.vue'
import { aiPromptsStore } from '@/stores/aiPrompts-store'
import { aiPromptsSelectedStore } from '@/stores/aiPromptsSelected-store'
import type { AiPromptsType } from '@/types/aiPrompts-type'

const promptsStore = aiPromptsSelectedStore()
// 生成提示词预览
const handleGenerateClick = async () => {
  promptsStore.setTextareaValue(inputValue.value)
  await promptsStore.generatePreview()
}

const inputValue = ref('')
const selectedPhotoType = ref('portrait') // 默认选中人像摄影

const photoTypes = [
  { value: 'portrait', label: '人像摄影' },
  { value: 'product', label: '产品摄影' },
  { value: 'landscape', label: '风景摄影' },
]

// 可复用的方法：根据category生成card数据
const generateCardData = (category: string, title: string) => {
  // 过滤出指定category的数据
  const categoryData = aiPromptsStore.list.filter(
    (item: any) => item.category === category,
  ) as AiPromptsType[]

  // 按subcategory分组
  const subcategoryGroups: Record<string, AiPromptsType[]> = {}
  categoryData.forEach((item) => {
    if (item.subcategory) {
      if (!subcategoryGroups[item.subcategory]) {
        subcategoryGroups[item.subcategory] = []
      }
      subcategoryGroups[item.subcategory]!.push(item)
    }
  })

  // 转换为subcategories格式
  const subcategories = Object.entries(subcategoryGroups).map(
    ([subcategoryName, prompts], index) => ({
      id: index + 1,
      name: subcategoryName,
      prompts: prompts.map((prompt) => ({
        id: prompt.id || 0,
        label: prompt.label || '',
        category: prompt.category || '',
        subcategory: prompt.subcategory || '',
        value: prompt.value || '',
        description: prompt.description || '',
      })),
    }),
  )

  return {
    title,
    subcategories,
  }
}

// 人像摄影提示词卡片数据
const personCard = computed(() => generateCardData('人物主体', '人物主体配置'))
const compositionCard = computed(() => generateCardData('构图与视角(人像)', '构图与视角配置'))
const lightingCard = computed(() => generateCardData('光线系统', '光线系统配置'))
const colorStyleCard = computed(() => generateCardData('色彩与风格(人像)', '色彩与风格配置'))
const sceneCard = computed(() => generateCardData('场景与环境', '场景与环境配置'))
const postProcessingCard = computed(() => generateCardData('后期与氛围', '后期与氛围配置'))
// 通用摄影提示词卡片数据
const commonCard = computed(() => generateCardData('镜头与参数', '通用摄影配置'))
const commonOutputCard = computed(() => generateCardData('输出配置', '通用输出配置'))
// 产品摄影提示词卡片数据
const productCard = computed(() => generateCardData('产品主体', '产品主体配置'))
const compositionCardProduct = computed(() => generateCardData('构图与视角(产品)', '构图与视角配置'))
const lightingCardProduct = computed(() => generateCardData('灯光系统', '灯光系统配置') )
const backgroundCardProduct = computed(() => generateCardData('背景与场景', '背景与场景配置'))
const colorStyleCardProduct = computed(() => generateCardData('色彩与风格(产品)', '色彩与风格配置'))
const useSeceneCardProduct = computed(() => generateCardData('使用场景/氛围', '使用场景/氛围配置'))
const postProcessingCardProduct = computed(() => generateCardData('后期与商业风格', '后期与商业风格配置'))
// 风景摄影提示词卡片数据
const landscapeCard = computed(() => generateCardData('场景主体', '场景主体配置'))
const placeCard = computed(() => generateCardData('地理环境', '地理环境配置'))
const compositionCardLandscape = computed(() => generateCardData('构图与视角(风景)', '构图与视角配置'))
const lightingCardLandscape = computed(() => generateCardData('光线与时间', '光线与时间配置'))
const weatherCard = computed(() => generateCardData('天气与自然元素', '天气与自然元素配置'))
const colorStyleCardLandscape = computed(() => generateCardData('色彩与风格(风景)', '色彩与风格配置'))
const seasonCard = computed(() => generateCardData('季节与氛围', '季节与氛围配置'))
const postProcessingCardLandscape = computed(() => generateCardData('后期与艺术风格', '后期与艺术风格配置'))
const placeholder = computed(() => {
  return '清晰描述需求可以获得更准确的提示词'
})

const selectPhotoType = (type: any) => {
  selectedPhotoType.value = type
}

const handleInput = () => {
  // 字符计数逻辑
}

const handleSubmit = () => {
  if (!inputValue.value.trim()) return

  console.log('提交需求：', inputValue.value)
  console.log('选择的摄影类型：', selectedPhotoType.value)
  // 这里可以添加实际的提交逻辑
  // 例如调用API生成提示词
}

const handleCardApply = (selectedPrompts: number[]) => {
  // 由于 togglePrompt 已实时同步，此方法可以保留用于事件处理
  console.log('提示词已实时更新')
}

const handleCardClear = () => {
  const selectedStore = aiPromptsSelectedStore()
  console.log('已清空提示词')
  // 清空全局 store
  selectedStore.clearSelectedPrompts()
  // 清空全局 store 中的选中提示词
  selectedStore.clearSelectedPrompts()
}

onMounted(() => {
  aiPromptsStore.fetchAll()
})
</script>

<style scoped>
.prompts-input {
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 12px;
  padding: 18px;
  margin-bottom: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.input-header {
  margin-bottom: 10px;
}

.input-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #dcdcdc;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.input-area {
  margin-bottom: 20px;
}

.textarea-container {
  position: relative;
}

.custom-textarea {
  width: 100%;
  min-height: 120px;
  padding: 12px;
  background: #2a2a2a;
  border: 1px solid #444;
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  line-height: 1.5;
  resize: vertical;
  font-family: inherit;
}

.custom-textarea::placeholder {
  color: #666;
  font-style: italic;
}

.custom-textarea:focus {
  outline: none;
  border-color: #18d5ff;
  box-shadow: 11px 1px 15px rgba(68, 239, 255, 0.474);
}

.char-count {
  position: absolute;
  bottom: 8px;
  right: 12px;
  color: #666;
  font-size: 12px;
  background: rgba(42, 42, 42, 0.9);
  padding: 2px 6px;
  border-radius: 4px;
}

.submit-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.photo-type-buttons {
  display: flex;
  gap: 8px;
}

.photo-type-btn {
  padding: 8px 16px;
  border: 1px solid #444;
  border-radius: 6px;
  background: #2a2a2a;
  color: #888;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 80px;
}

.photo-type-btn:hover {
  border-color: #18d5ff;
  color: #dcdcdc;
  background: #333;
}

.photo-type-btn.active {
  background: linear-gradient(135deg, #11589a, #0b5142);
  border-color: #18d5ff;
  color: #fff;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.3);
}

.photo-type-btn.active:hover {
  background: linear-gradient(135deg, #11589a, #0b5142);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.4);
}

.submit-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #1890ff, #1ac49f);
  border: none;
  border-radius: 6px;
  font-weight: 500;
  padding: 8px 20px;
  color: #fff;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.submit-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #40a9ff, #3dd1b1);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
}

.submit-btn:disabled {
  background: #555;
  color: #888;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.prompts-cards-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .prompts-cards-container {
    grid-template-columns: 1fr;
  }
}
</style>
