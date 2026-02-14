export interface AiPlansType {
    id?: number
    name?: string //订阅名
    price?: number //价格
    durationDays?: number //天数
    maxSize?: number //最大图片尺寸
    status?: number //状态
    created_at?: string //创建时间
    description?: string //描述
    dailyLimit?: number //每日调用上限
    cheapLimit?: number //免费次数
}