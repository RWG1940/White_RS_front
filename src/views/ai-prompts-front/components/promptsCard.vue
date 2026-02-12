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
            :ref="(el) => setPromptButtonRef(prompt.id!, el as HTMLElement)"
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
      <div class="selected-count">已选择: {{ localSelectedCount }} 个提示词</div>
      <div class="action-buttons">
        <button class="clear-btn" @click="clearSelection">清空</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
import type { AiPromptsType } from '@/types/aiPrompts-type'
import { aiPromptsSelectedStore } from '@/stores/aiPromptsSelected-store'
import LeaderLineLib from 'leader-line-vue'

const LeaderLine = LeaderLineLib.obj

interface Subcategory {
  id: number
  name: string
  prompts: AiPromptsType[]
}

interface Props {
  title?: string
  subcategories?: Subcategory[]
}

const props = withDefaults(defineProps<Props>(), {
  title: '提示词库',
  subcategories: () => [],
})

const emit = defineEmits<{
  apply: [selectedPrompts: number[]]
  clear: []
}>()

/* ================= 状态 ================= */

const promptsStore = aiPromptsSelectedStore()
const selectedPrompts = ref<number[]>([])
const previousSelection = ref<number[]>([])

/* ================= 本组件 prompt 范围（关键） ================= */

const localPromptIds = computed<number[]>(() =>
  props.subcategories.flatMap((sc) => sc.prompts.map((p) => p.id!)),
)

// 当前卡片内选中的提示词数量
const localSelectedCount = computed(() => {
  return promptsStore.selectedPromptIds.filter(id => 
    localPromptIds.value.includes(id)
  ).length
})

/* ================= DOM & Line 管理 ================= */

const promptButtonRefs = ref<Map<number, HTMLElement>>(new Map())
const leaderLines = ref<Map<number, any>>(new Map())
const virtualPoints = ref<Map<number, HTMLElement>>(new Map())
let controlCenterElement: HTMLElement | null = null

/* ================= 虚拟点管理 ================= */

const createVirtualPoint = (promptId: number): HTMLElement => {
  const point = document.createElement('div')
  point.className = 'virtual-connection-point'
  point.style.position = 'fixed'
  point.style.width = '1px'
  point.style.height = '1px'
  point.style.pointerEvents = 'none'
  point.style.opacity = '0'
  point.dataset.promptId = promptId.toString()
  document.body.appendChild(point)
  return point
}

const updateVirtualPointPosition = (buttonEl: HTMLElement, virtualPoint: HTMLElement) => {
  const buttonRect = buttonEl.getBoundingClientRect()
  const viewportHeight = window.innerHeight
  const viewportWidth = window.innerWidth

  // 如果按钮在视口内，直接使用按钮右侧中间位置
  if (buttonRect.top >= 0 && buttonRect.bottom <= viewportHeight) {
    virtualPoint.style.left = buttonRect.right + 'px'
    virtualPoint.style.top = buttonRect.top + buttonRect.height / 2 + 'px'
    return
  }

  // 按钮在视口外，连接到屏幕边缘
  const edgeMargin = 3 // 距离边缘的间距

  // 水平位置（按钮右侧）
  const buttonRightX = buttonRect.right
  const edgeX = Math.max(edgeMargin, Math.min(viewportWidth - edgeMargin, buttonRightX))

  // 垂直位置（按钮垂直居中）
  const buttonCenterY = buttonRect.top + buttonRect.height / 2
  const edgeY = Math.max(edgeMargin, Math.min(viewportHeight - edgeMargin, buttonCenterY))

  virtualPoint.style.left = edgeX + 'px'
  virtualPoint.style.top = edgeY + 'px'
}

/* ================= ref 绑定（核心修复点） ================= */

const setPromptButtonRef = (promptId: number, el: HTMLElement | null) => {
  if (el) {
    promptButtonRefs.value.set(promptId, el)
  } else {
    // ⭐ DOM 被卸载 / 复用
    promptButtonRefs.value.delete(promptId)

    const line = leaderLines.value.get(promptId)
    if (line) {
      try {
        line.remove()
      } catch {}
      leaderLines.value.delete(promptId)
    }
  }
}

/* ================= store 同步 ================= */

watch(
  () => promptsStore.selectedPromptIds,
  (ids) => {
    selectedPrompts.value = [...ids]
    previousSelection.value = [...ids]
    updateLeaderLines()
  },
  { deep: true },
)

/* ================= 连接线核心逻辑 ================= */

const updateLeaderLines = () => {
  // 检查是否显示连接线
  if (!promptsStore.showConnectionLines) {
    // 如果开关关闭，移除所有连接线
    leaderLines.value.forEach((line) => {
      try {
        line.remove()
      } catch {}
    })
    leaderLines.value.clear()
    
    // 清理所有虚拟点
    virtualPoints.value.forEach((point) => {
      if (document.body.contains(point)) {
        document.body.removeChild(point)
      }
    })
    virtualPoints.value.clear()
    return
  }

  controlCenterElement =
    document.getElementById('ai-right-panel-target') || document.querySelector('.ai-right-panel')

  if (!controlCenterElement || !document.body.contains(controlCenterElement)) {
    return
  }

  const activeSet = new Set(selectedPrompts.value)

  /* ---- 1️⃣ 清理失效或不属于本卡片的线 ---- */
  leaderLines.value.forEach((line, promptId) => {
    const btn = promptButtonRefs.value.get(promptId)

    if (
      !activeSet.has(promptId) ||
      !localPromptIds.value.includes(promptId) ||
      !btn ||
      !document.body.contains(btn)
    ) {
      try {
        line.remove()
      } catch {}
      leaderLines.value.delete(promptId)

      // 清理虚拟点
      const virtualPoint = virtualPoints.value.get(promptId)
      if (virtualPoint && document.body.contains(virtualPoint)) {
        document.body.removeChild(virtualPoint)
        virtualPoints.value.delete(promptId)
      }
    }
  })

  /* ---- 2️⃣ 创建 / 更新本卡片的线 ---- */
  selectedPrompts.value.forEach((promptId) => {
    if (!localPromptIds.value.includes(promptId)) return

    const buttonEl = promptButtonRefs.value.get(promptId)

    if (
      !buttonEl ||
      !document.body.contains(buttonEl) ||
      !document.body.contains(controlCenterElement!)
    ) {
      return
    }

    // 获取或创建虚拟点
    let virtualPoint = virtualPoints.value.get(promptId)
    if (!virtualPoint || !document.body.contains(virtualPoint)) {
      virtualPoint = createVirtualPoint(promptId)
      virtualPoints.value.set(promptId, virtualPoint)
    }

    // 更新虚拟点位置
    updateVirtualPointPosition(buttonEl, virtualPoint)

    if (!leaderLines.value.has(promptId)) {
      console.log('创建线:', leaderLines.value)
      try {
        // 使用虚拟点作为起点
        const line = new LeaderLine(virtualPoint, controlCenterElement!, {
          /* ===== 基础样式 ===== */
          color: '#18d5ff',
          strokeWidth: 1.4,
          gradient: true,
          outline: true,
          outlineColor: '#086c88',
          outlineWidth: 0.5,

          /* ===== 路径形态（关键） ===== */
          path: 'fluid',
          curviness: 0.8, // ⭐ 增加弯曲度，创造曲线美

          /* ===== 端点设置 ===== */
          startPlugType: 'disc',
          endPlugType: 'disc',
          size: 0.8,
          startPlugSize: 1.1,
          endPlugSize: 1.1,

          /* ===== 方向控制（核心） ===== */
          startSocket: 'right',
          endSocket: 'left',

          // 起始端水平，中间保持优美曲线
          startSocketGravity: [60, 0],
          endSocketGravity: [-60, 40],

          /* ===== 动态效果 ===== */
          dash: {
            animation: true,
          },
        })

        leaderLines.value.set(promptId, line)
        
        // 立即更新位置，修复第一次选中时的偏移问题
        setTimeout(() => {
          try {
            line.position()
          } catch {}
        }, 0)
      } catch {}
    } else {
      try {
        leaderLines.value.get(promptId)?.position()
      } catch {}
    }
  })
}

/* ================= 业务逻辑 ================= */

const togglePrompt = (promptId: number) => {
  const idx = selectedPrompts.value.indexOf(promptId)
  idx > -1 ? selectedPrompts.value.splice(idx, 1) : selectedPrompts.value.push(promptId)

  const globalIds = [...promptsStore.selectedPromptIds]
  const current = new Set(selectedPrompts.value)
  const prev = new Set(previousSelection.value)

  const added = [...current].filter((id) => !prev.has(id))
  const removed = [...prev].filter((id) => !current.has(id))

  let next = [...globalIds]

  added.forEach((id) => !next.includes(id) && next.push(id))
  removed.forEach((id) => {
    const i = next.indexOf(id)
    i > -1 && next.splice(i, 1)
  })

  promptsStore.setSelectedPrompts(next)
  previousSelection.value = [...selectedPrompts.value]
}

const clearSelection = () => {
  // 只清空当前卡片内的提示词
  const cardsToRemove = [...selectedPrompts.value].filter(id => 
    localPromptIds.value.includes(id)
  )
  
  // 从全局store中移除当前卡片内的提示词
  const updatedGlobalIds = promptsStore.selectedPromptIds.filter(
    id => !cardsToRemove.includes(id)
  )
  
  promptsStore.setSelectedPrompts(updatedGlobalIds)
  
  // 更新本地状态
  selectedPrompts.value = selectedPrompts.value.filter(
    id => !cardsToRemove.includes(id)
  )
  previousSelection.value = [...selectedPrompts.value]
  
  emit('clear')

  // 清理连接线
  leaderLines.value.forEach((line) => {
    try {
      line.remove()
    } catch {}
  })
  leaderLines.value.clear()
}

/* ================= 生命周期 ================= */

onMounted(() => {
  const handler = () => updateLeaderLines()
  window.addEventListener('scroll', handler, true)
  window.addEventListener('resize', handler)
  
  // 监听连线开关状态变化
  window.addEventListener('connectionLinesToggled', () => {
    updateLeaderLines()
  })
  
  ;(window as any)._promptsCardHandler = handler
})

onUnmounted(() => {
  const handler = (window as any)._promptsCardHandler
  window.removeEventListener('scroll', handler, true)
  window.removeEventListener('resize', handler)

  leaderLines.value.forEach((line) => {
    try {
      line.remove()
    } catch {}
  })
  leaderLines.value.clear()

  // 清理所有虚拟点
  virtualPoints.value.forEach((point) => {
    if (document.body.contains(point)) {
      document.body.removeChild(point)
    }
  })
  virtualPoints.value.clear()
})
</script>

<style scoped>
.prompts-card {
  background: #1a1a1a;
  border: 1px solid #464646;
  border-radius: 12px;
  padding: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.card-header {
  background: #242424;
  padding: 12px 20px;
  border-bottom: 1px solid #333;
}

.category-title {
  color: #dcdcdc;
  font-size: 14px;
  font-family: 黑体;
  font-weight: bold;
  margin: 0;
}

.card-content {
  max-height: 400px;
  overflow-y: auto;
  padding: 16px 10px;
}

.subcategory-section {
  margin-bottom: 24px;
  background-color: #000000;
  padding: 10px;
  border-radius: 10px;
}

.subcategory-section:last-child {
  margin-bottom: 0;
}

.subcategory-title {
  color: #b3b3b3;
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 12px 0;
}

.prompts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, max-content));
  gap: 8px;
  justify-content: start;
}

.prompt-btn {
  padding: 6px 10px;
  border: 1px solid #444;
  border-radius: 8px;
  background: #2a2a2a;
  color: #aeaeae;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.prompt-btn:hover {
  border-color: #18d5ff;
  color: #dcdcdc;
  background: #333;
  box-shadow:
    inset 0 0 10px rgba(27, 223, 253, 0.6),
    0 0 9px 3px rgba(27, 185, 253, 0.2);
}

.prompt-btn.active {
  --green: #18d5ff;

  letter-spacing: 0.06em;
  position: relative;
  font-family: inherit;
  border-radius: 0.6em;
  overflow: hidden;
  transition: all 0.3s;
  line-height: 1.4em;
  border: 2px solid var(--green);
  background: linear-gradient(
    to right,
    rgba(27, 238, 253, 0.1) 1%,
    transparent 40%,
    transparent 60%,
    rgba(27, 253, 234, 0.1) 100%
  );
  color: var(--green);
  box-shadow:
    inset 0 0 10px rgba(27, 200, 253, 0.4),
    0 0 9px 3px rgba(27, 215, 253, 0.1);
  text-shadow:
    0 0 4px rgba(24, 213, 255, 0.8),
    0 0 8px rgba(24, 213, 255, 0.6),
    0 0 14px rgba(24, 213, 255, 0.4);
}

.prompt-btn.active:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.4);
}

.card-footer {
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
  background: #ff5151;
  color: #ffffff;
  border-color: #ff4d4f;
  box-shadow: 1px 1px 10px red;
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
