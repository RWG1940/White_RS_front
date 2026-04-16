Modal 组件使用文档

概述

- Modal 基于 Teleport 实现的自定义模态框，展示内容灵活，支持自定义标题、按钮文本、加载状态、点击遮罩关闭等行为。支持通过插槽自定义内容和页脚，以适应不同场景的对话框需求。

核心特性

- 通过 Teleport 将模态框渲染到 body，确保层级和样式不会被父容器影响。
- 支持自定义标题、内容、底部按钮文本及加载状态。
- 点击遮罩可关闭（closeOnClickOverlay）并发出 update:visible 事件更新可见性。
- 提供 confirm、cancel、close 等事件钩子，便于在父组件中处理业务逻辑。
- 提供 slot: footer，自定义页脚内容。

API 概览

- Props:
  - visible: boolean，模态框显隐
  - title: string，模态框标题
  - closeOnClickOverlay: boolean，点击遮罩是否关闭
  - confirmText: string，确认按钮文本，默认 "确认"
  - cancelText: string，取消按钮文本，默认 "取消"
  - loading: boolean，加载状态，显示在确认按钮旁的旋转图标
  - showFooter: boolean，是否显示底部按钮区域
- Emits:
  - update:visible：用于 v-model:visible 双向绑定（显隐控制）
  - close：关闭模态框时触发
  - confirm：点击确认按钮时触发
  - cancel：点击取消按钮或关闭时触发

插槽用法

- 默认插槽：模态框内容区域
- footer 插槽：自定义页脚内容（若提供 footer 插槽，将覆盖内部默认页脚）

示例：最小化用法

```vue
<template>
  <Modal
    v-model:visible="modalVisible"
    title="提示"
    @confirm="handleConfirm"
    @cancel="handleCancel"
  >
    <p>请确认是否执行该操作？</p>
  </Modal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Modal from '@/components/Modal.vue'

const modalVisible = ref(false)

function handleConfirm() {
  // 处理确认逻辑
  modalVisible.value = false
}

function handleCancel() {
  // 处理取消逻辑
  modalVisible.value = false
}
</script>
```

自定义页脚示例

```vue
<Modal v-model:visible="modalVisible" title="确认删除" :loading="loading">
  <template #default>
    <p>确定要删除该记录吗？此操作不可撤销。</p>
  </template>
  <template #footer>
    <button @click="modalVisible = false">取消</button>
    <button @click="handleDelete">确认</button>
  </template>
</Modal>
```

注意事项

- 模态框通过 Teleport 渲染在 body 下，确保遮罩和模态框不受父级 CSS 影响。
- 使用 v-model:visible 进行显隐控制，组件内部会在关闭时自动触发关闭事件。
- 通过 onConfirm、onCancel 处理业务逻辑，或监听 confirm/cancel 事件进行自定义处理。
