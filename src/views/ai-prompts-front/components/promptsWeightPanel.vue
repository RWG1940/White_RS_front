<template>
  <div class="weight-panel" v-if="promptsStore.showPreview">
    <p class="weight-header">权重调整</p>
    <div class="weight-list">
      <div class="weight-card" v-for="promptId in promptsStore.previewPromptIds" :key="promptId">
        <div class="card-content">
          <div class="weight-info">
            <span class="weight-title">{{ getPromptLabel(promptId) }}</span>
          </div>
          <div class="weight-control">
            <a-select
              v-model:value="weightValues[promptId]"
              @change="(value: any) => handleWeightChange(promptId, value)"
              class="weight-select"
              size="small"
            >
              <a-select-option value="core">核心</a-select-option>
              <a-select-option value="important">重要</a-select-option>
              <a-select-option value="auxiliary">辅助</a-select-option>
            </a-select>
          </div>
          <div class="weight-close">
            <CloseCircleOutlined @click="removePrompt(promptId)" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { CloseCircleOutlined } from '@ant-design/icons-vue'
import { aiPromptsSelectedStore, type WeightLevel } from '@/stores/aiPromptsSelected-store'
import { aiPromptsStore } from '@/stores/aiPrompts-store'

const promptsStore = aiPromptsSelectedStore()

// 存储权重选择值
const weightValues = ref<Record<number, WeightLevel>>({})

// 初始化权重值
const initWeightValues = () => {
  weightValues.value = {}
  promptsStore.previewPromptIds.forEach(id => {
    weightValues.value[id] = promptsStore.getPromptWeight(id)
  })
}

// 获取提示词标签
const getPromptLabel = (id: number): string => {
  const prompt = aiPromptsStore.list.find((item: any) => item.id === id) as any
  return prompt?.label || '未知提示词'
}

// 处理权重变化
const handleWeightChange = (promptId: number, value: WeightLevel) => {
  promptsStore.setPromptWeight(promptId, value)
}

// 移除提示词
const removePrompt = (promptId: number) => {
  const index = promptsStore.previewPromptIds.indexOf(promptId)
  if (index > -1) {
    promptsStore.previewPromptIds.splice(index, 1)
    promptsStore.previewPromptWeights.delete(promptId)
  }
}

// 监听预览提示词 ID 的变化
watch(() => promptsStore.previewPromptIds, () => {
  initWeightValues()
}, { deep: true, immediate: true })
</script>

<style scoped>
.weight-panel {
  margin: 12px;
  margin-top: 0;
  padding: 10px;
  border-radius: 10px;
  border: solid 1px #555555;
  background-color: #222222;
  height: 220px;
  display: flex;
  flex-direction: column;
}

.weight-header {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 12px;
  margin-top: 0;
  color: #bdbdbd;
}

.weight-list {
  flex: 1;
  overflow-y: auto;
  padding-right: 4px;
}

.weight-list::-webkit-scrollbar {
  width: 6px;
}

.weight-list::-webkit-scrollbar-track {
  background: #333;
  border-radius: 3px;
}

.weight-list::-webkit-scrollbar-thumb {
  background: #555;
  border-radius: 3px;
}

.weight-list::-webkit-scrollbar-thumb:hover {
  background: #666;
}

.weight-card {
  border-radius: 8px;
  border: solid 1px #555555;
  height: 60px;
  margin-bottom: 8px;
  background-color: #2f2f2f;
  padding: 8px 12px;
}

.card-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  gap: 8px;
}

.weight-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1;
  min-width: 0;
}

.weight-title {
  font-size: 12px;
  color: #d6d6d6;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.weight-control {
  display: flex;
  align-items: center;
}

.weight-select {
  width: 100px;
}

.weight-select :deep(.ant-select-selector) {
  background-color: #444 !important;
  border-color: #666 !important;
}

.weight-select :deep(.ant-select-selector .ant-select-selection-item) {
  color: #fff !important;
}

.weight-select :deep(.ant-select-arrow) {
  color: #ccc !important;
}

.weight-close {
  color: rgb(126, 126, 126);
  cursor: pointer;
  flex-shrink: 0;
  font-size: 18px;
}

.weight-close:hover {
  color: rgb(254, 90, 90);
}
</style>
