<template>
  <div class="prompts-card">
    <div class="card-header">
      <h3 class="category-title">{{ title }}</h3>
    </div>

    <div class="card-content">
      <div v-for="subcategory in subcategories" :key="subcategory.id" class="subcategory-section">
        <h4 class="subcategory-title">{{ subcategory.name }}</h4>
        <div class="prompts-grid">
          <button
            v-for="prompt in subcategory.prompts"
            :key="prompt.id"
            :class="['prompt-btn', { active: selectedPrompts.includes(prompt.id!) }]"
            @click="togglePrompt(prompt.id!)"
          >
            {{ prompt.label }}
          </button>
        </div>
      </div>
      <slot name="custom-content"></slot>
    </div>

    <div class="card-footer">
      <div class="selected-count">已选择: {{ selectedPrompts.length }} 个提示词</div>
      <div class="action-buttons">
        <button class="clear-btn" @click="clearSelection">清空</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { AiPromptsType } from '@/types/aiPrompts-type'
import { aiPromptsSelectedStore } from '@/stores/aiPromptsSelected-store'
// 大类定义
interface Subcategory {
  id: number
  name: string
  prompts: AiPromptsType[]
}
// props定义
interface Props {
  title?: string
  subcategories?: Subcategory[]
}
// 默认值
const props = withDefaults(defineProps<Props>(), {
  title: '提示词库',
  subcategories: () => [],
})
// emit定义
const emit = defineEmits<{
  apply: [selectedPrompts: number[]]
  clear: []
}>()
// 选中的提示词
const selectedPrompts = ref<number[]>([])
const promptsStore = aiPromptsSelectedStore()
const previousSelection = ref<number[]>([])

// 监听 store 中的 selectedPromptIds 变化，同步本地状态
watch(
  () => promptsStore.selectedPromptIds,
  (newIds) => {
    selectedPrompts.value = [...newIds]
    previousSelection.value = [...newIds]
  },
  { deep: true }
)

// 切换提示词
const togglePrompt = (promptId: number) => {
  const index = selectedPrompts.value.indexOf(promptId)
  if (index > -1) {
    selectedPrompts.value.splice(index, 1)
  } else {
    selectedPrompts.value.push(promptId)
  }

  // 计算当前卡片的变化（添加或移除的 ID）
  const globalIds = [...promptsStore.selectedPromptIds]

  // 比较前后变化
  const currentSelection = new Set(selectedPrompts.value)
  const prevSelection = new Set(previousSelection.value)

  // 找出新添加的项
  const added = Array.from(currentSelection).filter((id) => !prevSelection.has(id))
  // 找出被移除的项
  const removed = Array.from(prevSelection).filter((id) => !currentSelection.has(id))

  // 更新全局状态：添加新项，移除已删除的项
  let newGlobalIds = [...globalIds]

  // 添加新选项
  added.forEach((id) => {
    if (!newGlobalIds.includes(id)) {
      newGlobalIds.push(id)
    }
  })

  // 移除取消选项
  removed.forEach((id) => {
    const idx = newGlobalIds.indexOf(id)
    if (idx > -1) {
      newGlobalIds.splice(idx, 1)
    }
  })

  // 更新全局 store
  promptsStore.setSelectedPrompts(newGlobalIds)
  // 更新本卡片的前一状态
  previousSelection.value = [...selectedPrompts.value]
}
// 清空选中
const clearSelection = () => {
  selectedPrompts.value = []
  emit('clear')
  // 清空全局 store
  promptsStore.clearSelectedPrompts()
}
</script>

<style scoped>
.prompts-card {
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 12px;
  padding: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.card-header {
  background: #252525;
  padding: 16px 20px;
  border-bottom: 1px solid #333;
}

.category-title {
  color: #dcdcdc;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.card-content {
  max-height: 400px;
  overflow-y: auto;
  padding: 16px 20px;
}

.subcategory-section {
  margin-bottom: 24px;
}

.subcategory-section:last-child {
  margin-bottom: 0;
}

.subcategory-title {
  color: #b3b3b3;
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 12px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #333;
}

.prompts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 8px;
}

.prompt-btn {
  padding: 8px 12px;
  border: 1px solid #444;
  border-radius: 6px;
  background: #2a2a2a;
  color: #888;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.prompt-btn:hover {
  border-color: #18d5ff;
  color: #dcdcdc;
  background: #333;
}

.prompt-btn.active {
  background: linear-gradient(135deg, #0b4276, #0f6a56);
  border-color: #18d5ff;
  color: #fff;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.3);
}

.prompt-btn.active:hover {
  background: linear-gradient(135deg, #0b4276, #0f6a56);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.4);
}

.card-footer {
  background: #252525;
  padding: 16px 20px;
  border-top: 1px solid #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.selected-count {
  color: #b3b3b3;
  font-size: 12px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.clear-btn,
.apply-btn {
  padding: 6px 12px;
  border: 1px solid #444;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.clear-btn {
  background: #2a2a2a;
  color: #888;
}

.clear-btn:hover {
  background: #333;
  color: #dcdcdc;
  border-color: #ff4d4f;
}

.apply-btn {
  background: linear-gradient(135deg, #0b355c, #083228);
  color: #fff;
  border: solid 1px #25baff;
}

.apply-btn:hover {
  transform: translateY(-1px);
  border: solid 1px #25baff;
}

/* 滚动条样式 */
.card-content::-webkit-scrollbar {
  width: 6px;
}

.card-content::-webkit-scrollbar-track {
  background: #2a2a2a;
  border-radius: 3px;
}

.card-content::-webkit-scrollbar-thumb {
  background: #444;
  border-radius: 3px;
}

.card-content::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
