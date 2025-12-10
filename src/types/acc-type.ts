// 辅料购货合同数据结构
export interface AccPurchaseContractType {
  id?: number

  hangtagShipTime?: string        // 吊牌出货时间 
  washlabelShipTime?: string      // 洗标出货时间 

  style?: string                  // 款式
  color?: string                  // 颜色
  productName?: string            // 产品名

  actualMaterial?: string         // 实际材质
  liningMaterial?: string         // 内衬材质
  washlabelType?: string          // 洗标种类

  quantity?: number               // 数量
  actualShipQuantity?: number     // 实际出货数量

  address?: string                // 地址
  follower?: string               // 跟单

  unitPrice?: number              // 单价
  totalPrice?: number             // 总价

  hangtagFileConfirmTime?: string // 配套吊牌文件确认时间

  createdAt?: string              // 创建时间 扩展字段
  updatedAt?: string              // 修改时间 扩展字段

  remark?: string                 // 备注 扩展字段
  status?: number                 // 状态（1正常 0停用）

  priority?: number               // 优先级
  extraJson?: string             // 额外信息
}
