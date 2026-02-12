import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { aiPromptsStore } from './aiPrompts-store'

// 权重级别定义
export type WeightLevel = 'core' | 'important' | 'auxiliary'

interface PromptWeightItem {
  id: number
  weight: WeightLevel
}

export const aiPromptsSelectedStore = defineStore('aiPromptsSelected', () => {
  // 存储选中的提示词 ID 列表（实时更新）
  const selectedPromptIds = ref<number[]>([])
  
  // 存储每个提示词的权重信息
  const promptWeights = ref<Map<number, WeightLevel>>(new Map())
  
  // 存储 textarea 输入的文字（实时更新）
  const textareaValue = ref<string>('')
  
  // 是否显示预览
  const showPreview = ref(false)
  
  // 是否显示加载状态
  const isLoading = ref(false)

  // 是否显示提示词连线
  const showConnectionLines = ref(true)

  // 是否启用自动配置提示词
  const autoConfigPrompts = ref(false)

  // 存储选中的输出配置（图片尺寸）
  const selectedOutputConfig = ref<string>('1024*1024')

  // 存储预览时的快照（只在点击生成时更新）
  const previewPromptIds = ref<number[]>([])
  const previewPromptWeights = ref<Map<number, WeightLevel>>(new Map())
  const previewTextareaValue = ref<string>('')

  // 获取选中提示词的完整信息列表
  const selectedPrompts = computed(() => {
    return selectedPromptIds.value
      .map(id => aiPromptsStore.list.find((item: any) => item.id === id))
      .filter(item => item !== undefined)
  })

  // 预览的提示词信息列表
  const previewPrompts = computed(() => {
    return previewPromptIds.value
      .map(id => aiPromptsStore.list.find((item: any) => item.id === id))
      .filter(item => item !== undefined)
  })

  // 获取权重标签：核心=[core]，重要=[important]，辅助=[auxiliary]
  const getWeightLabel = (weight: WeightLevel): string => {
    const labels: Record<WeightLevel, string> = {
      'core': '[core]',
      'important': '[important]',
      'auxiliary': '[auxiliary]'
    }
    return labels[weight]
  }

  // 获取选中提示词的 value 值，用逗号分开，并添加权重标签
  const selectedPromptsValue = computed(() => {
    return selectedPromptIds.value
      .map(id => {
        const prompt = aiPromptsStore.list.find((item: any) => item.id === id) as any
        if (!prompt) return ''
        const weight = promptWeights.value.get(id) || 'important'
        const weightLabel = getWeightLabel(weight)
        return `${weightLabel}${prompt.value || ''}`
      })
      .filter(v => v)
      .join(', ')
  })

  // 预览时显示的 value 值（包含 textarea）
  const previewPromptsValue = computed(() => {
    const prompts = previewPromptIds.value
      .map(id => {
        const prompt = aiPromptsStore.list.find((item: any) => item.id === id) as any
        if (!prompt) return ''
        const weight = previewPromptWeights.value.get(id) || 'important'
        const weightLabel = getWeightLabel(weight)
        return `${weightLabel}${prompt.value || ''}`
      })
      .filter(v => v)
      .join(', ')
    
    const textarea = previewTextareaValue.value.trim()
    
    if (prompts && textarea) {
      return `${textarea}, ${prompts}`
    } else if (textarea) {
      return textarea
    } else {
      return prompts
    }
  })

  // 添加选中的提示词 ID
  const addSelectedPrompt = (id: number) => {
    if (!selectedPromptIds.value.includes(id)) {
      selectedPromptIds.value.push(id)
      // 默认权重为"重要"
      promptWeights.value.set(id, 'important')
    }
  }

  // 移除选中的提示词 ID
  const removeSelectedPrompt = (id: number) => {
    const index = selectedPromptIds.value.indexOf(id)
    if (index > -1) {
      selectedPromptIds.value.splice(index, 1)
      promptWeights.value.delete(id)
    }
  }

  // 批量设置选中的提示词 ID
  const setSelectedPrompts = (ids: number[]) => {
    selectedPromptIds.value = [...ids]
    // 初始化权重
    const newWeights = new Map<number, WeightLevel>()
    ids.forEach(id => {
      newWeights.set(id, promptWeights.value.get(id) || 'important')
    })
    promptWeights.value = newWeights
  }

  // 设置提示词权重
  const setPromptWeight = (id: number, weight: WeightLevel) => {
    promptWeights.value.set(id, weight)
  }

  // 获取提示词权重
  const getPromptWeight = (id: number): WeightLevel => {
    return promptWeights.value.get(id) || 'important'
  }

  // 设置 textarea 值
  const setTextareaValue = (value: string) => {
    textareaValue.value = `Generate a high-quality image based on the following requirements: 1. Image content: ${value}, 2. Generation parameters: (Please follow the weight rules: [core] has the highest priority and will be executed first; [important] has secondary priority; [auxiliary] has the lowest priority)`
  }

  // 清空选中的提示词
  const clearSelectedPrompts = () => {
    selectedPromptIds.value = []
  }

  // 生成预览（点击生成按钮时调用）
  const generatePreview = async () => {
    isLoading.value = true
    
    // 等待 2 秒后显示预览
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    previewPromptIds.value = [...selectedPromptIds.value]
    previewPromptWeights.value = new Map(promptWeights.value)
    previewTextareaValue.value = textareaValue.value
    showPreview.value = true
    isLoading.value = false
  }

  // 显示预览
  const displayPreview = () => {
    showPreview.value = true
  }

  // 隐藏预览
  const hidePreview = () => {
    showPreview.value = false
  }

  // 切换预览显示状态
  const togglePreview = () => {
    showPreview.value = !showPreview.value
  }

  // 切换提示词连线显示状态
  const toggleConnectionLines = () => {
    showConnectionLines.value = !showConnectionLines.value
  }

  // 切换自动配置提示词状态
  const toggleAutoConfigPrompts = () => {
    autoConfigPrompts.value = !autoConfigPrompts.value
  }

  // 自动配置提示词：从每个subcategory中随机选择一个
  const autoConfigurePrompts = () => {
    if (!autoConfigPrompts.value) return
    
    // 获取所有提示词数据
    const allPrompts = aiPromptsStore.list
    
    // 检查是否有数据
    if (!allPrompts || allPrompts.length === 0) {
      console.warn('没有可用的提示词数据，无法自动配置')
      return
    }
    
    // 按subcategory分组
    const subcategoryGroups: Record<string, any[]> = {}
    allPrompts.forEach(prompt => {
      if (prompt.subcategory) {
        if (!subcategoryGroups[prompt.subcategory]) {
          subcategoryGroups[prompt.subcategory] = []
        }
        subcategoryGroups[prompt.subcategory].push(prompt)
      }
    })
    
    // 从每个subcategory中随机选择一个提示词
    const selectedIds: number[] = []
    Object.values(subcategoryGroups).forEach(prompts => {
      if (prompts.length > 0) {
        const randomIndex = Math.floor(Math.random() * prompts.length)
        const randomPrompt = prompts[randomIndex]
        if (randomPrompt.id) {
          selectedIds.push(randomPrompt.id)
        }
      }
    })
    
    // 设置选中的提示词
    if (selectedIds.length > 0) {
      setSelectedPrompts(selectedIds)
      console.log('自动配置成功，选择了', selectedIds.length, '个提示词')
    } else {
      console.warn('没有找到可用的提示词进行自动配置')
    }
  }

  // 设置输出配置
  const setOutputConfig = (config: string) => {
    selectedOutputConfig.value = config
  }

  // 清空预览（清空所有选中的提示词和 textarea 值，隐藏预览）
  const clearPreview = () => {
    selectedPromptIds.value = []
    promptWeights.value.clear()
    textareaValue.value = ''
    previewPromptIds.value = []
    previewPromptWeights.value.clear()
    previewTextareaValue.value = ''
    showPreview.value = false
  }

  return {
    selectedPromptIds,
    promptWeights,
    textareaValue,
    showPreview,
    isLoading,
    showConnectionLines,
    autoConfigPrompts,
    selectedOutputConfig,
    previewPromptIds,
    previewPromptWeights,
    previewTextareaValue,
    selectedPrompts,
    previewPrompts,
    selectedPromptsValue,
    previewPromptsValue,
    addSelectedPrompt,
    removeSelectedPrompt,
    setSelectedPrompts,
    setPromptWeight,
    getPromptWeight,
    setTextareaValue,
    setOutputConfig,
    clearSelectedPrompts,
    generatePreview,
    displayPreview,
    hidePreview,
    togglePreview,
    toggleConnectionLines,
    toggleAutoConfigPrompts,
    autoConfigurePrompts,
    clearPreview,
  }
})

