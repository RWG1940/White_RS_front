import { message } from 'ant-design-vue'
import { appConfig } from '@/config/index'

// 响应拦截器
export const responseInterceptor = async (response: any) => {
  // 获取请求信息
  const requestUrl = response.config?.url || 'unknown'
  const requestMethod = response.config?.method || 'unknown'
  const responseStatus = response.status
  const responseData = response.data
  
  // 计算响应时间（需要请求拦截器设置metadata）
  let responseTime = 'unknown'
  if (response.config?.metadata?.startTime) {
    const startTime = response.config.metadata.startTime
    if (typeof startTime === 'number') {
      responseTime = `${Date.now() - startTime}ms`
    }
  }

  // 判断是否是文件下载类型（Blob）
  const isFileDownload = response.data instanceof Blob

  // 调试输出（根据配置开关控制）
  if (appConfig.enableDebug) {
    if (isFileDownload) {
      console.log(`📥 [${requestMethod.toUpperCase()}] ${requestUrl} - 文件下载响应 (${responseTime})`)
    } else {
      console.log('📊 API响应信息:', {
        url: requestUrl,
        method: requestMethod.toUpperCase(),
        status: responseStatus,
        responseTime: responseTime,
        data: responseData
      })
    }
  }

  // 对于非文件下载的响应，进行状态码检查
  if (!isFileDownload) {
    const code = responseData.code
    const messageText = responseData.message || '后台未知错误'
    // code 为 200 表示成功
    if (code !== 200) {
      message.error(messageText)
      return Promise.reject(messageText)
    }
  }

  

  return response
}

// 响应拦截器-报错
export const responseInterceptorError = async (error: any) => {
  let errMsg = ''
  const ERROR_MESSAGE = error.message
  
  // 获取请求信息
  const requestUrl = error.config?.url || 'unknown'
  const requestMethod = error.config?.method || 'unknown'
  
  if (appConfig.enableDebug) {
    console.log(`❌ API错误信息:`, {
      url: requestUrl,
      method: requestMethod.toUpperCase(),
      error: ERROR_MESSAGE,
      status: error.response?.status,
      data: error.response?.data
    })
  }
  
  if (ERROR_MESSAGE == 'Network Error') {
    errMsg += '网络错误，请检查网络连接'
  } else if (ERROR_MESSAGE.includes('timeout')) {
    errMsg += '请求超时，请重试'
  } else if (ERROR_MESSAGE.includes('500')) {
    errMsg += '出了点小意外，请联系管理员'
  } else if (ERROR_MESSAGE.includes('401')) {
    errMsg += '登录状态失效，请重新登录'
    localStorage.removeItem('token')
  } else if (ERROR_MESSAGE.includes('403')) {
    errMsg += 'sorry，你貌似没登陆，或者没有权限'
  } else {
    errMsg += ERROR_MESSAGE
  }
  message.error(errMsg)
  return Promise.reject(error)
}
