<template>
  <div class="output-panel">
    <div class="panel-header">
      <p class="output-header">输出配置调整</p>
      <a-button type="primary" class="collapse-btn" @click="toggleCollapse">
        {{ isCollapsed ? '展开' : '收起' }}
      </a-button>
    </div>

    <!-- 配置内容区域，通过CSS控制高度 -->
    <div class="panel-content" :class="{ collapsed: isCollapsed }">
      <div class="output-list" v-if="outputConfigs.length > 0">
        <div 
          v-for="config in outputConfigs" 
          :key="config.id"
          class="output-card"
          :class="{ active: selectedOutputConfig === config.value }"
          @click="selectOutputConfig(config.value)"
        >
          <div class="card-content">
            <div class="output-info">
              <span class="output-title">{{ config.label }}</span>
              <span class="output-subtitle">{{ config.value }}</span>
            </div>
            <div class="output-actions">
              <div class="output-select-status">
                <span v-if="selectedOutputConfig === config.value" class="selected-indicator">
                  ✓ 已选择
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="no-configs">
        <p>暂无输出配置</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { aiPromptsStore } from '@/stores/aiPrompts-store'
import { aiPromptsSelectedStore } from '@/stores/aiPromptsSelected-store'

const promptsStore = aiPromptsSelectedStore()
const aiPromptsStoreInstance = aiPromptsStore

// 收起/展开状态
const isCollapsed = ref(false)

// 当前选中的输出配置
const selectedOutputConfig = computed({
  get: () => promptsStore.selectedOutputConfig,
  set: (value) => promptsStore.setOutputConfig(value)
})

// 获取输出配置数据
const outputConfigs = computed(() => {
  // 过滤出输出配置类别的数据
  const configData = aiPromptsStoreInstance.list.filter(
    (item: any) => item.category === '输出配置'
  )
  
  return configData.map((item: any) => ({
    id: item.id,
    label: item.label || '',
    value: item.value || '',
    description: item.description || ''
  }))
})

// 切换收起/展开
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}

// 选择输出配置
const selectOutputConfig = (configValue: string) => {
  selectedOutputConfig.value = configValue
}

// 组件挂载时加载数据
onMounted(() => {
  if (aiPromptsStoreInstance.list.length === 0) {
    aiPromptsStoreInstance.fetchAll()
  }
})
</script>

<style scoped>
.output-panel {
  margin: 12px;
  margin-top: 0;
  padding: 10px;
  border-radius: 10px;
  border: solid 1px #555555;
  background-color: #222222;
  min-height: 60px;
  height: auto;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.output-header {
  font-size: 15px;
  font-weight: 600;
  margin: 0;
  color: #bdbdbd;
}

.output-list {
  flex: 1;
  overflow-y: auto;
  padding-right: 4px;
  max-height: 165px;
  min-height: 60px;
}

.output-list::-webkit-scrollbar {
  width: 6px;
}

.output-list::-webkit-scrollbar-track {
  background: #333;
  border-radius: 3px;
}

.output-list::-webkit-scrollbar-thumb {
  background: #555;
  border-radius: 3px;
}

.output-list::-webkit-scrollbar-thumb:hover {
  background: #666;
}

.output-card {
  border-radius: 8px;
  border: solid 1px #555555;
  height: 60px;
  margin-bottom: 8px;
  background-color: #2f2f2f;
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.output-card:hover {
  border-color: #00eaff;
  background-color: #3a3a3a;
}

.output-card.active {
  border-color: #00eaff;
  background-color: #1a3a4a;
  box-shadow: 0 0 8px rgba(0, 234, 255, 0.3);
}

.card-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  gap: 8px;
}

.output-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1;
  min-width: 0;
}

.output-title {
  font-size: 12px;
  color: #d6d6d6;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 600;
}

.output-subtitle {
  font-size: 11px;
  color: #a0a0a0;
  margin-top: 2px;
}

.output-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.selected-indicator {
  color: #00eaff;
  font-size: 11px;
  font-weight: 600;
}

.no-configs {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #888;
  font-size: 12px;
}

/* 面板内容区域样式 */
.panel-content {
  flex: 1;
  max-height: 180px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.panel-content.collapsed {
  max-height: 0;
  min-height: 0;
}

.collapse-btn {
  background: rgb(53, 53, 53);
  border: solid 1px #696969;
  color: #c8c8c8;
  font-weight: bold;
  border-radius: 4px;
  height: 24px;
  padding: 0 8px;
  font-size: 12px;
  transition: all 0.3s ease;
}

.collapse-btn:hover {
  color: rgb(255, 255, 255);
  background: rgb(53, 53, 53);
  border: solid 1px #00eaff;
}
</style>
