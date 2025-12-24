export interface WebhookType {
    id?: number;
    name?: string;
    url?: string;
    status?: number;
    type?: number;
    remark?: string;
    createdAt?: string;
    updatedAt?: string;
    sendCount?: number;
    lastSendTime?: string;
}