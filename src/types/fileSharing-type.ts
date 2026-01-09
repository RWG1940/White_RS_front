export interface FileSharingType {
  sharedId?: number;                // 分享记录的ID
  ownerId?: number;                 // 分享者的ID
  sharedWithUserId?: number;        // 被分享者的ID
  shareLink?: string;               // 分享链接
  sharePassword?: string;           // 分享密码
  shareType?: 'private' | 'public' | 'temporary';  // 分享类型（私密分享、公开分享、临时分享）
  shareTime?: string;               // 分享时间
  expirationTime?: string;          // 过期时间
  fileIds?: number[];               // 文件ID列表
}
