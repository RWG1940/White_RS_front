<template>
  <div class="example-container">
    <h1>iOS 18风格 Modal 组件示例</h1>
    <div class="button-group">
      <button @click="showModal1 = true" class="demo-button">
        显示基础弹窗
      </button>
      <button @click="showModal2 = true" class="demo-button">
        显示自定义文字弹窗
      </button>
      <button @click="showModal3 = true" class="demo-button">
        显示加载状态弹窗
      </button>
    </div>

    <!-- 基础弹窗 -->
    <Modal
      v-model:visible="showModal1"
      title="确认操作"
      @confirm="handleConfirm"
      @cancel="handleCancel"
    >
      <p>您确定要执行此操作吗？</p>
      <p>此操作可能会影响系统数据，请谨慎操作。</p>
    </Modal>

    <!-- 自定义文字弹窗 -->
    <Modal
      v-model:visible="showModal2"
      title="删除确认"
      confirm-text="删除"
      cancel-text="保留"
      @confirm="handleDelete"
      @cancel="handleKeep"
    >
      <p>您确定要删除这个项目吗？</p>
      <p style="color: #ff3b30;">删除后无法恢复！</p>
    </Modal>

    <!-- 加载状态弹窗 -->
    <Modal
      v-model:visible="showModal3"
      title="处理中"
      :loading="isLoading"
      @confirm="handleSubmit"
      @cancel="showModal3 = false"
    >
      <p>正在处理您的请求，请稍候...</p>
    </Modal>

    <!-- 自定义 footer 的弹窗 -->
    <Modal
      v-model:visible="showModal4"
      title="自定义底部"
    >
      <p>这个弹窗使用了自定义的底部按钮布局</p>
      <template #footer>
        <div style="display: flex; gap: 12px; padding: 16px;">
          <button @click="showModal4 = false" style="flex: 1; padding: 12px; background: #e8e8ed; border: none; border-radius: 12px; font-weight: 500;">
            暂不操作
          </button>
          <button @click="handleAction" style="flex: 1; padding: 12px; background: #007AFF; color: white; border: none; border-radius: 12px; font-weight: 500;">
            立即执行
          </button>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Modal from '@/components/Modal.vue'

const showModal1 = ref(false)
const showModal2 = ref(false)
const showModal3 = ref(false)
const showModal4 = ref(false)
const isLoading = ref(false)

const handleConfirm = () => {
  console.log('确认按钮被点击')
  showModal1.value = false
}

const handleCancel = () => {
  console.log('取消按钮被点击')
  showModal1.value = false
}

const handleDelete = () => {
  console.log('删除按钮被点击')
  showModal2.value = false
}

const handleKeep = () => {
  console.log('保留按钮被点击')
  showModal2.value = false
}

const handleSubmit = () => {
  isLoading.value = true
  setTimeout(() => {
    isLoading.value = false
    showModal3.value = false
    console.log('提交完成')
  }, 2000)
}

const handleAction = () => {
  console.log('自定义底部按钮被点击')
  showModal4.value = false
}
</script>

<style scoped>
.example-container {
  padding: 40px;
  max-width: 800px;
  margin: 0 auto;
}

h1 {
  margin-bottom: 40px;
  color: #1d1d1f;
  font-size: 36px;
  font-weight: 700;
}

.button-group {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  margin-bottom: 40px;
}

.demo-button {
  padding: 16px 32px;
  background: #007AFF;
  color: white;
  border: none;
  border-radius: 14px;
  font-size: 17px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.demo-button:hover {
  background: #0056CC;
  transform: translateY(-2px);
}

.demo-button:active {
  transform: translateY(0);
}
</style>