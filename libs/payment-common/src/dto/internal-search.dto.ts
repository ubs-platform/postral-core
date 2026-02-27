export interface InternalSearchDTO {

    showOnlyUserOwned?: "true" | "false";
    /**
 * Eğer kullanıcı admin değilse, bu alanı kullanarak sadece 
 * kendi hesaplarını görmesi sağlanır. Admin kullanıcılar için herhangi bir 
 * kısıtlama olmaz. Eğer kullanıcı admin değilse ve entityOwnershipGroupId verilmemişse, 
 * kendi userId'sini ekleyerek sadece kendi hesaplarını görmesi sağlanır.
 * Eğer kullanıcı admin ise, bu alanı kullanarak belirli bir 
 * entityOwnershipGroupId'ye sahip hesapları görmesi sağlanır.
 * Bu alanın kullanımı opsiyoneldir ve sadece belirli durumlarda gereklidir. 
 * Genellikle, kullanıcıların sadece kendi hesaplarını görmesi isteniyorsa 
 * veya admin kullanıcıların belirli bir grup içindeki hesapları görmesi isteniyorsa 
 * kullanılır.
 */
    ownerUserId?: string;

    /**
     * Bu alan, kullanıcıların belirli bir entityOwnershipGroupId'ye sahip hesapları görmesini sağlar.
     * Eğer kullanıcı admin değilse ve entityOwnershipGroupId verilmemişse, 
     * kendi userId'sini ekleyerek sadece kendi hesaplarını görmesi sağlanır.
     * Eğer kullanıcı admin ise, bu alanı kullanarak belirli bir 
     * entityOwnershipGroupId'ye sahip hesapları görmesi sağlanır.
     * Bu alanın kullanımı opsiyoneldir ve sadece belirli durumlarda gereklidir. 
     * Genellikle, kullanıcıların sadece kendi hesaplarını görmesi isteniyorsa 
     * veya admin kullanıcıların belirli bir grup içindeki hesapları görmesi isteniyorsa 
     * kullanılır.
     */
    entityOwnershipGroupId?: string;

    // iç kullanım için
    entityIds?: string[];
}