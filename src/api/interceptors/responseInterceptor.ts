import { message } from 'ant-design-vue';
import { useRouter } from "vue-router";
import { appConfig } from '@/config';

// 响应拦截器
export const responseInterceptor = async (response: any) => {
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
  return response;
}
// 响应拦截器-报错
export const responseInterceptorError = async (error: any) => {
  let errMsg = "";
  const ERROR_MESSAGE = error.message;
  if (ERROR_MESSAGE == "Network Error"){
    errMsg += "网络错误，请检查网络连接";
  } else if (ERROR_MESSAGE.includes("timeout")){
    errMsg += "请求超时，请重试";
  } else if (ERROR_MESSAGE.includes("500")){
    errMsg += "服务器错误，请联系管理员";
  } else if (ERROR_MESSAGE.includes("401")){
    errMsg += "登陆状态失效，请重新登陆";
    localStorage.removeItem('token');
  } else {
    errMsg += ERROR_MESSAGE;
  }
  message.error(errMsg);
  return Promise.reject(error);
}
