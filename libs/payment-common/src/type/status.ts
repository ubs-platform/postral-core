// * INITIATED: Payment oluşturuldu, ancak henüz ödeme kanalı ile işlem başlatılmadı.
// * WAITING: Ödeme kanalı ile işlem başlatıldı, ancak ödeme henüz tamamlanmadı.
// * COMPLETED: Ödeme başarıyla tamamlandı.
// * EXPIRED: Ödeme işlemi süresi doldu veya iptal edildi.
export type PaymentStatus = 'INITIATED' | 'WAITING' | 'COMPLETED' | 'FAILED';

/**
 * * FAILED: Ödeme işlemi başarısız oldu.
 * * CANCELLED: Ödeme işlemi kullanıcı veya sistem tarafından iptal edildi.
 * * EXPIRED: Ödeme işlemi süresi doldu.
 * * '', null ve undefined: Herhangi bir hata durumu yok.
 */
export type PaymentErrorStatus =
    | 'FAILED'
    | 'CANCELLED'
    | 'EXPIRED'
    | ''
    | undefined
    | null;
