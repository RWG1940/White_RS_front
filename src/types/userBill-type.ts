export interface UserBillType {
    id?: number
    uId?: number // 用户id
    userName?: string // 用户名
    type?: number // 账单类型
    date?: string // 账单时间
    orderNum?: string // 订单号
    result?: string // 账单结果
    status?: number // 账单状态
    paid?: number // 付款金额
}