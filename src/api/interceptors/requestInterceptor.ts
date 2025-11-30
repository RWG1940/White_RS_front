import { useAuthStore } from "@/stores/auth-store";

// 请求拦截器
export const requestInterceptor = async (config: any) => {
  // 获取用户信息
  const authStore = useAuthStore();
  const token = authStore.token;
  // 添加请求头
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};