<template>
  <div class="mobile-page">
    <!-- 移动端头部 -->
    <div class="mobile-header">
      <h3>赛尔集团员工自助信息录入系统</h3>

    </div>

    <!-- 移动端表单 -->
    <div class="mobile-form-container">
      <div class="mobile-form-card">
        <div class="form-group">
          <label>姓名</label>
          <input v-model="form.name" placeholder="请输入姓名" class="form-input" />
        </div>
        
        <div class="form-group">
          <label>身份证号</label>
          <input v-model="form.paperNumber" placeholder="请输入身份证号码" class="form-input" />
        </div>

        <div class="form-group">
          <label>电话号</label>
          <input v-model="form.phone" placeholder="请输入电话号" class="form-input" />
        </div>



        <!-- 上传图片 -->
        <div class="form-group file-upload">
          <label>人脸照片</label>
          <input type="file" id="fileInput" @change="handleFileChange" accept="image/*" />
          <label for="fileInput" class="file-upload-label">
             点击选择图片文件
          </label>
          <div v-if="imagePreview">
            <img :src="imagePreview" class="preview" />
            <div class="file-info">
              已选择: {{ file?.name || '' }}
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button class="submit-btn" @click="addPerson" :disabled="loading">
            {{ loading ? '提交中...' : '提交信息' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 成功提示弹窗 -->
    <transition name="fade-slide">
      <div v-if="showSuccess" class="success-modal">
        <div class="success-modal-content">
          <div class="success-icon-wrapper">
            <div class="success-icon">✓</div>
          </div>
          <h3 class="success-title">提交成功！</h3>
          <p class="success-message">人员信息已成功添加</p>
          <button class="success-close-btn" @click="showSuccess = false">确定</button>
        </div>
      </div>
    </transition>

  <!-- 图片裁剪模态框 -->
  <transition name="fade-slide">
    <div v-if="showCropper" class="cropper-modal">
      <div class="cropper-container">
        <div class="cropper-header">
          <h3>裁剪人脸照片</h3>
          <p>请调整裁剪框，确保人脸清晰可见</p>
        </div>
        <div class="cropper-content">
          <VueCropper
            ref="cropperRef"
            :img="cropperImg"
            :autoCrop="true"
            :fixed="true"
            :fixedNumber="[1, 1]"
            :centerBox="true"
            :high="true"
            mode="contain"
            :maxImgSize="2000"
            :limitMinSize="[200, 200]"
          />
        </div>
        <div class="cropper-actions">
          <button class="cropper-btn cropper-cancel" @click="cancelCrop">取消</button>
          <button class="cropper-btn cropper-confirm" @click="confirmCrop">确认裁剪</button>
        </div>
      </div>
    </div>
  </transition>
</div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'
import { VueCropper } from 'vue-cropper'
import 'vue-cropper/dist/index.css'

// 表单数据
const form = ref({
  name: '', // 人员姓名
  paperNumber: '', // 证件号码
  phone: '', // 电话号

})

// 图片上传相关
const file = ref<File | null>(null)
const imagePreview = ref('')
const showCropper = ref(false)
const cropperImg = ref('')
const cropperRef = ref<any>(null)

// 状态管理
const loading = ref(false) // 加载状态
const showSuccess = ref(false) // 成功提示状态







// 压缩图片
const compressImage = (file: File): Promise<File> => {
  return new Promise((resolve) => {
    if (file.size <= 1 * 1024 * 1024) {
      // 小于1MB不压缩
      resolve(file)
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')!

        // 计算压缩后的尺寸（最大宽度1920px）
        let width = img.width
        let height = img.height
        const maxWidth = 1920
        
        if (width > maxWidth) {
          height = (maxWidth / width) * height
          width = maxWidth
        }

        canvas.width = width
        canvas.height = height

        // 绘制压缩图片
        ctx.drawImage(img, 0, 0, width, height)

        // 转换为blob，quality 0.8
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file)
              return
            }
            
            // 创建新的File对象
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            })
            
            console.log(`图片已压缩: ${(file.size / 1024 / 1024).toFixed(2)}MB -> ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`)
            resolve(compressedFile)
          },
          file.type,
          0.8
        )
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  })
}

// 选择文件
const handleFileChange = async (e: any) => {
  const f = e.target.files[0]
  if (!f) return

  // 验证文件类型
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  if (!allowedTypes.includes(f.type)) {
    alert('请选择图片文件 (JPEG, PNG, GIF, WebP)')
    e.target.value = '' // 清空文件输入
    return
  }

  // 清理之前的图片预览URL，防止内存泄漏
  if (imagePreview.value) {
    URL.revokeObjectURL(imagePreview.value)
  }

  // 显示裁剪框
  cropperImg.value = URL.createObjectURL(f)
  showCropper.value = true
  
  // 存储原始文件，裁剪后再压缩
  file.value = f
}

// 确认裁剪
const confirmCrop = async () => {
  if (!cropperRef.value) return
  
  cropperRef.value.getCropData(async (cropData: string) => {
    // 将base64转换为File
    const response = await fetch(cropData)
    const blob = await response.blob()
    const croppedFile = new File([blob], file.value?.name || 'cropped.jpg', { 
      type: file.value?.type || 'image/jpeg' 
    })
    
    // 压缩图片（如果大于1MB）
    const processedFile = await compressImage(croppedFile)
    
    // 检查压缩后的大小
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (processedFile.size > maxSize) {
      alert(`图片压缩后仍超过5MB限制，请手动调整图片大小后重试`)
      return
    }

    file.value = processedFile
    imagePreview.value = URL.createObjectURL(processedFile)
    console.log('文件已选择:', processedFile.name, '大小:', (processedFile.size / 1024).toFixed(2) + 'KB', '类型:', processedFile.type)
    
    // 关闭裁剪框
    showCropper.value = false
    
    // 清理裁剪预览
    if (cropperImg.value) {
      URL.revokeObjectURL(cropperImg.value)
    }
  })
}

// 取消裁剪
const cancelCrop = () => {
  showCropper.value = false
  
  // 清理资源
  if (cropperImg.value) {
    URL.revokeObjectURL(cropperImg.value)
  }
  
  // 清空文件输入
  const fileInput = document.getElementById('fileInput') as HTMLInputElement
  if (fileInput) {
    fileInput.value = ''
  }
  
  file.value = null
  imagePreview.value = ''
}

// 上传图片
const uploadImage = async () => {
  if (!file.value) {
    console.log('没有选择文件')
    return ''
  }

  console.log('开始上传文件:', file.value.name, file.value.size, file.value.type)

  const formData = new FormData()
  formData.append('file', file.value)

  try {
    const res = await axios.post(
      'http://192.168.24.77:19517/brm/person/upload/img/file',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000, // 30秒超时
      },
    )

    console.log('上传响应:', res.data)

    // 尝试不同的响应格式（根据你提供的响应，服务器返回 data.fileUrl）
    const path =
      res.data?.data?.fileUrl ||
      res.data?.data?.path ||
      res.data?.path ||
      res.data?.url ||
      res.data?.filePath ||
      res.data?.fileUrl ||
      ''

    console.log('提取的路径:', path)

    if (!path) {
      console.warn('上传成功但未获取到文件路径，响应格式:', res.data)
      // 打印完整的响应结构以便调试
      console.warn('完整响应结构:', JSON.stringify(res.data, null, 2))
    } else {
      console.log('✅ 成功获取文件路径:', path)
    }

    return path
  } catch (err: any) {
    console.error('图片上传失败:', err)
    console.error('错误详情:', err.response?.data || err.message)
    return ''
  }
}

// 提交表单
const addPerson = async () => {
  // 防止重复提交
  if (loading.value) return

  // 表单验证
  if (!form.value.name.trim()) {
    alert('请输入姓名')
    return
  }
  if (!form.value.paperNumber.trim()) {
    alert('请输入身份证号')
    return
  }
  if (!form.value.phone.trim()) {
    alert('请输入电话号')
    return
  }


  loading.value = true

  try {
    // 验证是否选择了文件
    if (!file.value) {
      alert('请先选择要上传的图片文件')
      loading.value = false
      return
    }

    console.log('开始上传图片，文件名:', file.value.name)
    const path = await uploadImage()

    if (!path) {
      alert('图片上传失败，请检查控制台查看详细错误信息或联系管理员')
      loading.value = false
      return
    }

    console.log('✅ 图片上传成功，路径:', path)

    const payload = {
      // id字段已移除，由后端生成
      name: form.value.name,
      // code字段已移除，由后端生成
      phone: form.value.phone, // 电话号

      paperType: 111, // 证件类型默认111
      paperNumber: form.value.paperNumber, // 证件号码
      departmentId:1,
      departmentType:1,
      personBiosignatures: [
        {
          type: 3,
          index: 1,
          path: path,
        },
      ],
    }

    console.log('✅ 准备发送的payload:', JSON.stringify(payload, null, 2))

    await axios.post('http://192.168.24.77:19517/brm/person/add', payload, {
      headers: { 'Content-Type': 'application/json' },
    })

    // 显示成功提示
    showSuccess.value = true
    
    // 重置表单
    form.value = {
      name: '',
      paperNumber: '',
      phone: ''
    }
    
    // 清理图片
    if (imagePreview.value) {
      URL.revokeObjectURL(imagePreview.value)
    }
    imagePreview.value = ''
    file.value = null
    
    // 3秒后自动隐藏成功提示
    setTimeout(() => {
      showSuccess.value = false
    }, 3000)
    
  } catch (err: any) {
    console.error('提交失败:', err)
    alert(`提交失败: ${err?.response?.data?.message || err.message || '未知错误'}`)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* 移动端页面容器 */
.mobile-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #66a6ea 0%, #ffffff 100%);
  padding: 16px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  position: relative;
}

/* 头部区域 */
.mobile-header {
  text-align: center;
  padding-bottom: 10px;
}

.mobile-header h3 {
  font-size: 20px;
  font-weight: 800;
  color: white;
  margin: 0 0 12px 0;
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
  letter-spacing: -0.5px;
}

.header-subtitle {
  font-size: 17px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 400;
  line-height: 1.5;
}

/* 表单容器 */
.mobile-form-container {
  max-width: 100%;
  margin: 0 auto;
  animation: slideIn 0.6s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.mobile-form-card {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(30px);
  border-radius: 28px;
  padding: 28px 24px;
  box-shadow: 
    0 25px 70px rgba(0, 0, 0, 0.2),
    0 0 0 1px rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.4);
  position: relative;
  overflow: hidden;
}

.mobile-form-card::before,
.mobile-form-card::after {
  display: none;
}


/* 表单组 */
.form-group {
  margin-bottom: 28px;
  position: relative;
}

.form-group label {
  display: block;
  margin-bottom: 12px;
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
  letter-spacing: 0.2px;
}

.form-group label::after {
  content: ' *';
  color: #f56565;
  font-weight: 700;
}

/* 输入框样式 */
.form-input {
  width: 100%;
  padding: 18px 20px;
  border: 2px solid #e2e8f0;
  border-radius: 18px;
  font-size: 17px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: #f8fafc;
  box-sizing: border-box;
  -webkit-appearance: none;
  appearance: none;
  color: #2d3748;
  font-weight: 500;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 
    0 0 0 5px rgba(102, 126, 234, 0.12),
    0 10px 20px rgba(102, 126, 234, 0.1);
  transform: translateY(-2px);
}

.form-input::placeholder {
  color: #a0aec0;
  font-weight: 400;
  opacity: 0.8;
}

/* 文件上传区域 */
.file-upload {
  margin: 32px 0;
  background: #f8fafc;
  border-radius: 18px;
  padding: 24px;
  border: 2px dashed #e2e8f0;
  transition: all 0.3s ease;
}

.file-upload:hover {
  border-color: #667eea;
  background: white;
  transform: translateY(-2px);
  box-shadow: 0 15px 35px rgba(102, 126, 234, 0.1);
}

.file-upload input[type="file"] {
  display: none;
}

.file-upload-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  cursor: pointer;
  text-align: center;
  transition: all 0.3s ease;
  color: #4a5568;
}

.file-upload-label::before {
  content: '📷';
  font-size: 40px;
  margin-bottom: 16px;
  display: block;
  transition: transform 0.3s ease;
}

.file-upload-label:hover::before {
  transform: scale(1.1);
}

.file-upload-label span {
  font-size: 17px;
  font-weight: 600;
  color: #667eea;
  margin-top: 8px;
}

/* 图片预览 */
.preview {
  width: 150px;
  height: 150px;
  border-radius: 22px;
  margin: 24px auto;
  object-fit: cover;
  display: block;
  border: 5px solid white;
  box-shadow: 
    0 15px 40px rgba(0, 0, 0, 0.2),
    0 0 0 1px rgba(255, 255, 255, 0.3);
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.file-info {
  text-align: center;
  margin-top: 16px;
  font-size: 15px;
  color: #718096;
  font-weight: 500;
  background: #edf2f7;
  padding: 10px 16px;
  border-radius: 12px;
  display: inline-block;
  margin-left: auto;
  margin-right: auto;
}

/* 提交按钮 */
.form-actions {
  margin-top: 40px;
  padding-top: 28px;
  border-top: 1px solid #e2e8f0;
}

.submit-btn {
  width: 100%;
  padding: 22px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 19px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    0 12px 30px rgba(102, 126, 234, 0.35),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  letter-spacing: 0.5px;
  position: relative;
  overflow: hidden;
}

.submit-btn::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.7s ease;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-4px);
  box-shadow: 
    0 20px 45px rgba(102, 126, 234, 0.45),
    0 0 0 1px rgba(255, 255, 255, 0.2);
}

.submit-btn:hover:not(:disabled)::after {
  left: 100%;
}

.submit-btn:active:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 
    0 8px 25px rgba(102, 126, 234, 0.35),
    0 0 0 1px rgba(255, 255, 255, 0.1);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: 
    0 8px 20px rgba(102, 126, 234, 0.2),
    0 0 0 1px rgba(255, 255, 255, 0.1);
}

/* 成功提示 */
.success-toast {
  position: fixed;
  bottom: 28px;
  left: 16px;
  right: 16px;
  z-index: 1000;
  animation: slideUpToast 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideUpToast {
  from {
    transform: translateY(100px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.toast-content {
  background: linear-gradient(135deg, #48bb78, #38a169);
  color: white;
  padding: 20px 24px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 
    0 15px 40px rgba(72, 187, 120, 0.35),
    0 0 0 1px rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.toast-icon {
  font-size: 28px;
  margin-right: 16px;
  animation: bounce 0.5s ease;
}

@keyframes bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

.toast-text {
  flex: 1;
  font-size: 17px;
  font-weight: 600;
  letter-spacing: 0.3px;
}

.toast-close {
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 6px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.toast-close:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: rotate(90deg);
}

/* 响应式设计 */
@media (min-width: 375px) {
  .mobile-page {
    padding: 20px;
  }
  
  .mobile-form-card {
    padding: 32px 28px;
  }
  
  .mobile-header h1 {
    font-size: 34px;
  }
}

@media (min-width: 414px) {
  .mobile-page {
    padding: 24px;
  }
  
  .mobile-form-card {
    padding: 36px 32px;
  }
  
  .mobile-header h1 {
    font-size: 36px;
  }
  
  .header-subtitle {
    font-size: 18px;
  }
}

@media (min-width: 480px) {
  .mobile-form-container {
    max-width: 420px;
  }
  
  .mobile-form-card {
    border-radius: 32px;
  }
}

@media (min-width: 768px) {
  .mobile-page {
    padding: 32px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  
  .mobile-form-container {
    max-width: 450px;
  }
  
  .mobile-form-card {
    padding: 40px 36px;
  }
  
  .mobile-header h1 {
    font-size: 40px;
    margin-bottom: 16px;
  }
  
  .header-subtitle {
    font-size: 19px;
  }
  
  .submit-btn {
    font-size: 20px;
    padding: 24px;
  }
}

/* 加载状态动画 */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.submit-btn:disabled {
  animation: pulse 1.5s ease-in-out infinite;
}

/* 输入验证状态 */
.form-input:invalid:not(:focus):not(:placeholder-shown) {
  border-color: #fc8181;
  background: #fff5f5;
}

.form-input:valid:not(:focus):not(:placeholder-shown) {
  border-color: #68d391;
  background: #f0fff4;
}

/* 成功弹窗 */
.success-modal {
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  padding: 20px;
}

.success-modal-content {
  background: white;
  border-radius: 32px;
  padding: 40px 32px;
  box-shadow: 
    0 30px 80px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.15);
  text-align: center;
  max-width: 320px;
  width: 100%;
  animation: popIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes popIn {
  from {
    opacity: 0;
    transform: scale(0.7) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.success-icon-wrapper {
  margin-bottom: 24px;
  animation: checkmark 0.6s ease-in-out;
}

@keyframes checkmark {
  0% {
    transform: scale(0) rotate(-45deg);
  }
  50% {
    transform: scale(1.2) rotate(-45deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
  }
}

.success-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #48bb78, #38a169);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  color: white;
  font-weight: 700;
  box-shadow: 
    0 15px 40px rgba(72, 187, 120, 0.35),
    0 0 0 1px rgba(255, 255, 255, 0.2);
  margin: 0 auto;
  line-height: 1;
}

.success-title {
  font-size: 28px;
  font-weight: 800;
  color: #1a1a1a;
  margin: 0 0 16px 0;
  letter-spacing: -0.5px;
}

.success-message {
  font-size: 17px;
  color: #718096;
  margin: 0 0 32px 0;
  font-weight: 500;
  line-height: 1.6;
}

.success-close-btn {
  width: 100%;
  padding: 18px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 16px;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.25);
  letter-spacing: 0.5px;
}

.success-close-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 35px rgba(102, 126, 234, 0.35);
}

.success-close-btn:active {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

/* 过渡动画 */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: scale(1.1);
}

/* 图片裁剪模态框 */
.cropper-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 3000;
  padding: 20px;
}

.cropper-container {
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  animation: popIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.cropper-header {
  padding: 24px 24px 0;
  text-align: center;
}

.cropper-header h3 {
  margin: 0 0 8px 0;
  font-size: 22px;
  color: #2d3748;
}

.cropper-header p {
  margin: 0;
  font-size: 15px;
  color: #718096;
}

.cropper-content {
  flex: 1;
  padding: 24px;
  min-height: 400px;
}

.cropper-actions {
  display: flex;
  gap: 16px;
  padding: 20px 24px 24px;
  border-top: 1px solid #e2e8f0;
}

.cropper-btn {
  flex: 1;
  padding: 16px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cropper-cancel {
  background: #f7fafc;
  color: #718096;
  border: 1px solid #e2e8f0;
}

.cropper-cancel:hover {
  background: #edf2f7;
  transform: translateY(-2px);
}

.cropper-confirm {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.cropper-confirm:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.35);
}

/* 响应式弹窗 */
@media (min-width: 480px) {
  .success-modal-content {
    max-width: 380px;
    padding: 48px 40px;
  }
  
  .success-icon {
    width: 90px;
    height: 90px;
    font-size: 52px;
  }
  
  .success-title {
    font-size: 30px;
  }
  
  .success-message {
    font-size: 18px;
  }
}

@media (min-width: 768px) {
  .success-modal-content {
    max-width: 420px;
    padding: 56px 48px;
  }
  
  .success-icon {
    width: 100px;
    height: 100px;
    font-size: 56px;
  }
  
  .success-title {
    font-size: 32px;
  }
  
  .success-message {
    font-size: 19px;
  }
}
</style>
