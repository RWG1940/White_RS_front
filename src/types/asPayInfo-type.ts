export interface AsPayInfoType {
    id?: number
    bankNum?: string //银行卡号
    bankName?: string //银行名称
    huName?: string //户名
    wechatQr?: string //微信好友二维码图片地址
    wechatPay?: string //微信收款码图片地址
    aliPay?: string //支付宝收款码图片地址
    status?: number //状态
    remark?: string //备注
    createdAt?: string //创建时间
    updatedAt?: string //更新时间
    asName?: string //辅料工厂名称
}