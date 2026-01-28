<template>
  <div class="prompts-container">
    <div class="prompts-input">
      <div class="input-header">
        <h3 class="input-title">
          <BulbOutlined />
          请描述您希望获得的图片
        </h3>
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
        <button :disabled="!inputValue.trim()" @click="handleSubmit" class="submit-btn">
          <SendOutlined />
          生成提示词
        </button>
      </div>
    </div>
    <!-- 复用提示词卡片 -->
    <div class="prompts-cards-container">
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

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { BulbOutlined, SendOutlined } from '@ant-design/icons-vue'
import PromptsCard from './promptsCard.vue'
import { aiPromptsStore } from '@/stores/aiPrompts-store'
import type { AiPromptsType } from '@/types/aiPrompts-type'

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

// 从store中动态获取各分类数据
const personCard = computed(() => generateCardData('人物主体', '人物主体配置'))
const compositionCard = computed(() => generateCardData('构图与视角(人像)', '构图与视角配置'))
const lightingCard = computed(() => generateCardData('光线系统', '光线系统配置'))
const colorStyleCard = computed(() => generateCardData('色彩与风格(人像)', '色彩与风格配置'))
const sceneCard = computed(() => generateCardData('场景与环境', '场景与环境配置'))
const postProcessingCard = computed(() => generateCardData('后期与氛围', '后期与氛围配置'))
const commonCard = computed(() => generateCardData('通用摄影', '通用摄影配置'))

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
  console.log('应用提示词：', selectedPrompts)
  // 处理提示词应用逻辑
}

const handleCardClear = () => {
  console.log('清空提示词')
  // 处理清空逻辑
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
