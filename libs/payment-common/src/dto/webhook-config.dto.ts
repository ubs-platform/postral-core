export type WebhookMethod = 'POST' | 'PUT';

export class WebhookConfigDTO {
    id!: string;
    accountId!: string;
    url!: string;
    method!: WebhookMethod;
    /** Yalnızca kayıt oluşturulurken döner; diğer sorgularda '***' olarak maskeli gelir */
    eventKey!: string;
    isEnabled!: boolean;
    createdAt!: Date;
    updatedAt!: Date;
}

export class WebhookConfigCreateDTO {
    accountId!: string;
    url!: string;
    method?: WebhookMethod;
    /** Boş bırakılırsa sistem rastgele bir key üretir */
    eventKey?: string;
}

export class WebhookConfigUpdateDTO {
    url?: string;
    method?: WebhookMethod;
    /** Yeni bir event key tanımlamak için gönderilir */
    eventKey?: string;
    isEnabled?: boolean;
}
