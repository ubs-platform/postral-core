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

    percent: number = 0;

    bias: number = 0; // Sıralamada defaultun son gelmesi için eklenen durumdur. 0: default, 1: sellerAccountId, 2: itemClass, 3: sellerAccountId + itemClass
}
