import apiClient from '../index';

// 登录
export const userLogin = async (user: any) => {
  return apiClient.post('/api/auth/login', user)

};
// 注册
export const userRegister = async (user: any) => {
  return apiClient.post('/api/auth/register', user)
};

// 获取用户当前信息
export const userCurrent = async () => {
  return apiClient.get('/api/auth/current')
};
// 根据id获取用户名
export const getUserNameById = async (id: number) => {
  return apiClient.get(`/api/auth/get-username-by-id/${id}`)
};
// 退出登录
export const userLogout = async () => {
  return apiClient.post('/api/auth/logout')
};


// 修改密码
export const changePassword = async (data: {id:number; oldPassword: string; newPassword: string; confirmPassword: string }) => {
  return apiClient.post('/api/auth/change-password', data)
};
