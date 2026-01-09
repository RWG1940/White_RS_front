import { ref } from 'vue'
import { createCRUDStore } from '@/utils/createStore'
import { feedbackApi } from '@/api/services/feedback-api'
import type { FeedbackType } from '@/types/feedback-type'

// 创建基本CRUD Store
export const feedbackStore = createCRUDStore('feedback-store', feedbackApi)()
// 表单数据
export const addFormData = ref<FeedbackType>({})
export const editFormData = ref<FeedbackType>({})
