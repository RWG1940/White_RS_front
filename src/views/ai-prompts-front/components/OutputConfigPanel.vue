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
        
      <div class="output-list" v-if="filteredOutputConfigs.length > 0">
        <div 
          v-for="config in filteredOutputConfigs" 
          :key="config.id"
          class="output-card"
          :class="{ 
            active: selectedOutputConfig === config.value,
            disabled: !config.enabled,
            'disabled-active': selectedOutputConfig === config.value && !config.enabled
          }"
          @click="config.enabled ? selectOutputConfig(config.value) : null"
        >
          <div class="card-content">
            <div class="output-info">
              <span class="output-title">{{ config.label }}</span>
              <span class="output-subtitle">{{ config.value }}</span>
              <span v-if="!config.enabled" class="disabled-hint">
                {{ config.roleHint }}
              </span>
            </div>
            <div class="output-actions">
              <div class="output-select-status">
                <span v-if="selectedOutputConfig === config.value" class="selected-indicator">
                  ✓ 已选择
                </span>
                <span v-if="!config.enabled" class="disabled-icon">🔒</span>
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
import { useAuthStore } from '@/stores/auth-store'
import { message } from 'ant-design-vue'

const promptsStore = aiPromptsSelectedStore()
const aiPromptsStoreInstance = aiPromptsStore
const authStore = useAuthStore()

// 收起/展开状态
const isCollapsed = ref(false)

// 当前选中的输出配置
const selectedOutputConfig = computed({
  get: () => promptsStore.selectedOutputConfig,
  set: (value) => promptsStore.setOutputConfig(value)
})



// 获取用户角色
const userRole = computed(() => {
  const role = authStore.user?.roles?.[0] as number
  return role // 默认普通用户
})

// 定义分辨率权限配置
const resolutionPermissions: Record<number, string[]> = {
  // 普通用户 (1502) - 高清分辨率 + 1024*1024
  1502: ['1280*720', '1024*1024','720*1280'],
  // 套餐1 (1234) - 高清 + 全高清 + 1024*1024
  1234: ['1280*720', '1080*1920', '1024*1024','720*1280', '1920*1080'],
  // 套餐2 (1235) - 高清 + 全高清 + 2K + 1024*1024
  1235: ['1280*720', '1080*1920', '1440*2560', '1024*1024','720*1280', '1920*1080', '2560*1440','293*413','413*626'],
  // 套餐3 (1236) - 高清 + 全高清 + 2K + 4K + 1024*1024
  1236: ['1280*720', '1080*1920', '1440*2560', '1024*1024','720*1280', '1920*1080', '2560*1440', '2160*3840', '3840*2160','293*413','413*626','2480*3508','3508*2480'],
  3294: ['1280*720', '1080*1920', '1440*2560', '1024*1024','720*1280', '1920*1080', '2560*1440', '2160*3840', '3840*2160','293*413','413*626','2480*3508','3508*2480']

}

// 安全获取允许的分辨率列表
const getAllowedResolutions = (roleCode: number): string[] => {
  const resolutions = resolutionPermissions[roleCode]
  return resolutions ? resolutions : ['1280*720','720*1280'] // 默认普通用户权限
}

// 获取分辨率对应的角色提示
const getResolutionRoleHint = (resolution: string) => {
  const requiredRoles = []
  
  // 横向分辨率对应的套餐要求
  if (resolution === '1080*1920') requiredRoles.push('小杯可乐')
  if (resolution === '1440*2560') requiredRoles.push('中杯可乐')
  if (resolution === '2160*3840') requiredRoles.push('大杯可乐')
  if (resolution === '1920*1080') requiredRoles.push('小杯可乐')
  if (resolution === '2560*1440') requiredRoles.push('中杯可乐')
  if (resolution === '3840*2160') requiredRoles.push('大杯可乐')
  
  // 特殊尺寸的分辨率要求
  if (resolution === '293*413') requiredRoles.push('中杯可乐')
  if (resolution === '413*626') requiredRoles.push('大杯可乐')
  if (resolution === '2480*3508') requiredRoles.push('大杯可乐')
  if (resolution === '3508*2480') requiredRoles.push('大杯可乐')

  if (requiredRoles.length > 0) {
    return `开通${requiredRoles.join('或')}套餐立享`
  }
  return ''
}

// 获取输出配置数据并添加权限控制
const filteredOutputConfigs = computed(() => {
  // 过滤出输出配置类别的数据
  const configData = aiPromptsStoreInstance.list.filter(
    (item: any) => item.category === '输出配置'
  )
  
  // 获取当前用户可用的分辨率，确保类型安全
  const allowedResolutions = getAllowedResolutions(userRole.value)
  
  return configData.map((item: any) => {
    const resolution = item.value || ''
    const enabled = allowedResolutions.includes(resolution)
    
    return {
      id: item.id,
      label: item.label || '',
      value: resolution,
      description: item.description || '',
      enabled: enabled,
      roleHint: enabled ? '' : getResolutionRoleHint(resolution)
    }
  })
})

// 切换收起/展开
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}

// 选择输出配置
const selectOutputConfig = (configValue: string) => {
  // 检查用户是否有权限使用该分辨率，确保类型安全
  const allowedResolutions = getAllowedResolutions(userRole.value)
  if (!allowedResolutions.includes(configValue)) {
    // 获取需要升级的套餐提示
    const requiredRole = getResolutionRoleHint(configValue)
    const message = `您当前的套餐不支持该分辨率。${requiredRole}`
    
    // 这里可以添加升级套餐的提示，暂时使用控制台输出
    console.warn(message)
    return
  }
  
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

/* 禁用状态样式 */
.output-card.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: #2a2a2a;
}

.output-card.disabled:hover {
  border-color: #555555;
  background-color: #2a2a2a;
}

.output-card.disabled-active {
  border-color: #ff6b6b;
  background-color: #3a1a1a;
  opacity: 0.7;
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

.disabled-hint {
  font-size: 10px;
  color: #ff6b6b;
  margin-top: 2px;
  font-style: italic;
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

.disabled-icon {
  font-size: 12px;
  color: #ff6b6b;
  margin-left: 4px;
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
