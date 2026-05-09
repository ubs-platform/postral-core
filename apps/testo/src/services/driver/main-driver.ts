import { Inject, Injectable } from "@nestjs/common";
import { LoginOperator } from "./login-operator";

@Injectable()
export class MainDriverService {
    constructor(
        private readonly loginOperator: LoginOperator
    ) {
        console.info("MainDriverService initialized");
    }


    async performOperations() {
        // UBS Platformda default username ve password "kyle"dır. Neden "kyle" olduğunu lütfen sormayın :d
        await this.loginOperator.login("kyle", "kyle");
        // Platform için komisyonlar eklenecek.
        // default: 10%
        // reduced: 5%
        
        // TODO: Adres ekleme
        // TODO: Accountlar eklenecek.
        //          - Bireysel : "Hüseyin"
        //          - Bireysel : "Cansu"
        //          - Bireysel : "Efe"
        //          - Kurumsal : "Kantçı Hüso" (Satıcı)
        //          - Kurumsal : "Doofenshmirtz Evil Inc." (Satıcı)
        //          - Kurumsal : "Tetakent Ltd. Şti." (Platform)

        // TODO: Kurumsal hesap ("Tetakent Ltd. Şti") için 2 public vergi ekleme (Biri %10 biri %20)
        //          Public: Bütün satıcılar bu vergiyi ürünlerine setleyebilirler. Örn. Devlet bu vergileri değiştirdiğinde o ürünler de güncellenecek. Snapshotlar değil tabi ki...
        // TODO: Kurumsal satıcı hesabı ("Kantçı Hüso") için 5 farklı ürün ekleme. 3'ü %10 vergi, 2'si %20 vergi.
        // TODO: Kurumsal satıcı hesabı ("Kantçı Hüso") için 2 farklı fiyat varyasyonu ekleme. Biri (default) 199₺, diğeri 299₺.
        // TODO: Kurumsal satıcı hesabı ("Doofenshmirtz Evil Inc.") için 5 farklı ürün ekleme. 3'ü %10 vergi, 2'si %20 vergi.
        // TODO: Kurumsal satıcı hesabı ("Doofenshmirtz Evil Inc.") için 2 farklı fiyat varyasyonu ekleme. Biri (default) 99₺, diğeri 199₺.
        // TODO: Kurumsal hesaplar için farklı rapor queryleri ekleme. 
        //      ("Kantçı Hüso") SELLER - DAILY
        //      ("Kantçı Hüso") SELLER - ALL
        //      ("Doofenshmirtz Evil Inc.") SELLER - DAILY
        //      ("Doofenshmirtz Evil Inc.") SELLER - ALL
        //      ("Tetakent Ltd. Şti.") PLATFORM - DAILY  
        //      ("Tetakent Ltd. Şti.") PLATFORM-FLOW - DAILY
        //      ("Tetakent Ltd. Şti.") PLATFORM-FLOW - ALL
        // 

    }
}