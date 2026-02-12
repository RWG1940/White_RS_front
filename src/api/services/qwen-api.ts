import apiClient from '@/api/index'

interface GenerateImageParams {
  prompt: string
  n?: number
  size?: string
}

export const generateImgByText = (params: GenerateImageParams) => {
  return apiClient.post('/qwen/image/generate', null, {
    params: params
  })
}
  