export class AppComissionDTO {

    id: string = "";

    /*
    Satıcı için ayrı bir tanımlama... boş ise defaulttur.
     Satıcıya özel tanımlama yapılırsa, o satıcı için geçerli olur. Satıcıya özel tanımlama yoksa, default tanımlama geçerli olur.
    */
  
    sellerAccountId?: string;

    sellerAccountName?: string; // Ekstra bilgi olarak satıcı hesabının adını da dönebiliriz, böylece admin panelinde daha kolay yönetilebilir olur.

    /* Ürün sınıfı için farklı komisyon oranı girilebilir. Null ise default komisyon oranı geçerli olur. */
    itemClass?: string;

    /* Harici platform için farklı komisyon oranı girilebilir. Null ise platformdan bağımsız (Postral) tanımdır. */
    externalPlatformId?: string;

    externalPlatformName?: string; // Ekstra bilgi olarak harici platform adını da dönebiliriz.

    percent: number = 0;

    bias: number = 0; // Sıralamada en spesifik tanımın öne gelmesi için bitmask: externalPlatformId(4) + sellerAccountId(2) + itemClass(1), +1 ile 1..8.

    createdAt?: Date;

    updatedAt?: Date;

    _warning?: string; // Eğer komisyon tanımı bulunamazsa, default 0 dönerken bir uyarı mesajı da ekleyebiliriz.
}
