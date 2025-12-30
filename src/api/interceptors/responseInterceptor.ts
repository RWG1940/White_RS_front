import { message } from 'ant-design-vue';
import { useRouter } from "vue-router";
import { appConfig } from '@/config';

// 响应拦截器
export const responseInterceptor = async (response: any) => {
  // 判断响应头的 Content-Type 是否为文件类型
  const contentType = response.headers['content-type'];
  if (contentType && contentType.startsWith('application/')) {
    // 如果是文件类型响应（如Excel），则直接处理文件下载
    if (response.data instanceof Blob) {
      // 处理文件下载，生成下载链接
      // const downloadUrl = URL.createObjectURL(response.data);
      // const a = document.createElement('a');
      // a.href = downloadUrl;
      // a.download = response.headers['content-disposition']?.split('filename=')[1] || 'file';
      // a.click();
      // // 销毁链接对象
      // URL.revokeObjectURL(downloadUrl);
      return Promise.resolve(response); // 不需要进一步处理
    }
  } else {
    // 获取响应数据
    const data = response.data;
    // 调试输出（根据配置开关控制）
    if (appConfig.enableDebug) {
      console.log('响应数据:', data);
    }
    // 获取响应状态码
    const code = data.code;
    const messageText = data.message || '后台未知错误';
    // code 为 200 表示成功
    if (code !== 200) {
      message.error(messageText);
      return Promise.reject(messageText);
    }
  }

  return response;
}

// 响应拦截器-报错
export const responseInterceptorError = async (error: any) => {
  let errMsg = "";
  const ERROR_MESSAGE = error.message;
  if (ERROR_MESSAGE == "Network Error") {
    errMsg += "网络错误，请检查网络连接";
  } else if (ERROR_MESSAGE.includes("timeout")) {
    errMsg += "请求超时，请重试";
  } else if (ERROR_MESSAGE.includes("500")) {
    errMsg += "服务器错误，请联系管理员";
  } else if (ERROR_MESSAGE.includes("401")) {
    errMsg += "登录状态失效，请重新登录";
    localStorage.removeItem('token');
  } else {
    errMsg += ERROR_MESSAGE;
  }
  message.error(errMsg);
  return Promise.reject(error);
}
