// 洗标吊牌信息数据结构
export interface AccPurchaseContractType {
  id?: number

  imageUrl?: string              // 图片URL（Minio路径）
  sku?: string                   // 货号
  color?: string                 // 颜色
  brand?: string                 // 品牌
  nameEn?: string                // 英文品名
  materialMain?: string          // 大面材料
  materialLining?: string        // 里衬材质
  washLabelColor?: string        // 洗标颜色
  washLabelType?: string         // 洗标种类
  factory?: string               // 工厂
  address?: string               // 地址
  follower?: string              // 跟单
  quantity?: number              // 数量

  washUnitPrice?: number         // 洗标单价
  washTotalPrice?: number        // 洗标总价

  tagUnitPrice?: number          // 吊牌单价
  tagTotalPrice?: number         // 吊牌总价

  washPriority?: number          // 洗标优先级
  washStatus?: string            // 洗标状态
  washConfirmTime?: string       // 洗标确认时间
  washShipQuantity?: number      // 洗标出货数量
  washShipTime?: string          // 洗标实际出货时间
  washExpressNo?: string         // 洗标快递单号

  tagPriority?: number           // 吊牌优先级
  tagStatus?: string             // 吊牌状态
  tagConfirmTime?: string        // 吊牌确认时间
  tagShipTime?: string           // 吊牌出货时间
  tagShipQuantity?: number       // 吊牌实际出货数量
  tagExpressNo?: string          // 吊牌快递单号

  remark?: string                // 备注
  status?: number                // 状态（1正常 0停用）
  priority?: number              // 整体优先级

  importId?: number              // 导入批次ID
  extraJson?: any                // 额外信息（JSON）

  createdAt?: string             // 创建时间
  updatedAt?: string             // 修改时间
  
  quarter?:string                 // 季度
}
