export interface FileResourceType {
  id?: number                          // 主键ID
  fileName?: string                    // 原始文件名
  fileKey?: string                     // MinIO 对象存储路径
  fileUrl?: string                     // 文件访问 URL

  bucket?: string                      // 所属 bucket
  fileSize?: number                    // 文件大小（字节）
  fileType?: string                    // MIME 类型
  fileExt?: string                     // 扩展名

  bizType?: string                     // 业务类型
  bizId?: number                       // 业务ID

  isDeleted?: number                   // 是否删除
  creatorId?: number                   // 上传者
  createTime?: string                  // 创建时间
  updateTime?: string                  // 更新时间
}
