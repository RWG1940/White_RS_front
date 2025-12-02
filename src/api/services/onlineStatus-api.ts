import apiClient from '../index';

// 检查用户是否在线
export const checkUserOnlineStatus = async (userId: string) => {
  return apiClient.get(`/api/online/check/${userId}`);
}

// 获取所有在线用户id
export const getAllOnlineUserIds = async () => {
  return apiClient.get('/api/online/users');
}

// 获取在线用户数量
export const getOnlineUserCount = async () => {
  return apiClient.get('/api/online/count');
}

// 批量检查用户在线状态
export const batchCheckUserOnlineStatus = async (userIds: string[]) => {
  return apiClient.post('/api/online/batch-check', userIds);
}