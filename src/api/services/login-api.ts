import apiClient from '../index';

// 登录
export const userLogin = async (user: any) => {
  return apiClient.post('/api/auth/login', user)

};

// 获取用户当前信息
export const userCurrent = async () => {
  return apiClient.get('/api/auth/current')
};

// 退出登录
export const userLogout = async () => {
  return apiClient.post('/api/auth/logout')
};


// 修改密码
export const changePassword = async (data: {id:number; oldPassword: string; newPassword: string; confirmPassword: string }) => {
  return apiClient.post('/api/auth/change-password', data)
};
