export interface FeedbackType {
    id?: number;
    // 反馈内容
    description?: string;
    status?: number;
    createAt?: string;
    updateAt?: string;
    author?: string;
    // 反馈类型
    type?: number;
}
