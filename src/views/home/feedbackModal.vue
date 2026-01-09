<template>
  <a-modal
    v-model:visible="visible"
    title="反馈意见"
    :width="500"
    :footer="null"
    @cancel="handleCancel"
  >
    <a-form
      ref="formRef"
      :model="formState"
      :rules="rules"
      layout="vertical"
    >
      <a-form-item label="反馈类型" name="type">
        <a-select v-model:value="formState.type" placeholder="请选择反馈类型">
          <a-select-option value="bug">功能问题</a-select-option>
          <a-select-option value="suggestion">优化建议</a-select-option>
          <a-select-option value="other">其他</a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item label="反馈内容" name="content">
        <a-textarea
          v-model:value="formState.content"
          placeholder="请输入您的反馈内容"
          :rows="4"
          show-count
          :maxlength="500"
        />
      </a-form-item>



      <div style="text-align: right; margin-top: 16px;">
        <a-button style="margin-right: 8px;" @click="handleCancel">
          取消
        </a-button>
        <a-button type="primary" @click="handleSubmit" :loading="loading">
          提交
        </a-button>
      </div>
    </a-form>
  </a-modal>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { message } from 'ant-design-vue'
import { feedbackStore, addFormData } from '@/stores/feedback-store'
import type { FeedbackType } from '@/types/feedback-type'
import { useAuthStore } from '@/stores/auth-store'

interface FormState {
  type: string
  content: string
}

const visible = ref(false)
const loading = ref(false)
const formRef = ref()
const store = feedbackStore
const authStore = useAuthStore()
const formState = reactive<FormState>({
  type: '',
  content: ''
})

// 反馈类型映射 - 参照 FeedbackType 接口的 type 字段
const typeMap = {
  bug: 1,      // 功能问题
  suggestion: 2, // 优化建议
  other: 3     // 其他
}

const rules = {
  type: [
    { required: true, message: '请选择反馈类型', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请输入反馈内容', trigger: 'blur' },
    { min: 5, message: '反馈内容至少5个字符', trigger: 'blur' }
  ]
}

// 打开弹窗
const open = () => {
  visible.value = true
  // 重置表单
  Object.assign(formState, {
    type: '',
    content: '',
    contact: ''
  })
}

// 关闭弹窗
const handleCancel = () => {
  visible.value = false
  loading.value = false
}

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    
    loading.value = true
    
    // 准备提交数据
    const feedbackData: FeedbackType = {
      description: formState.content,
      type: typeMap[formState.type as keyof typeof typeMap],
      author: authStore.user?.username
    }
    
    // 使用store提交数据
    await store.create(feedbackData)
    
    handleCancel()
    
  } catch (error) {
    console.log('表单验证失败:', error)
    loading.value = false
  }
}

// 暴露方法给父组件
defineExpose({
  open
})
</script>

<style scoped>
:deep(.ant-modal-body) {
  padding: 24px;
}
</style>
