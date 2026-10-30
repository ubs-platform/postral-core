import { AccountDTO } from './account.dto';
import { AccountAddressDto } from './address.dto';

/**
 * Ödeme kanallarının (örn. iyzico alt üye işyeri) satıcı kaydı oluşturması için gereken,
 * çözülmüş (şifresiz) güncel hesap verisi. Yalnızca güvenilir mikroservis iletişiminde kullanılır.
 */
export class SubMerchantSourceDTO {
    account!: AccountDTO;
    defaultAddress?: AccountAddressDto;
}
