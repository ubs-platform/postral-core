# Kaynak kod ile çalıştırma

Bu depodaki uygulamaları aşağıdaki komutla çalıştırabilirsiniz:

```
npm run start <app-ismi>
```

Postral tarafında aktif uygulamalar:

- **payment**: ödeme yaşam döngüsü, ödeme kanal operasyonları, fatura, raporlama ve webhook akışları
- **testo**: Postral akışlarında kullanılan yardımcı/entegrasyon uygulaması

Örnek:

```
npm run start payment
npm run start testo
```

## UBS Mona platform bağımlılıkları

Postral, kullanıcı ve dosya tarafındaki bazı yetenekler için UBS Mona platform servislerine bağlıdır.

Lokal geliştirme sırasında (genelde `users-mona-mr` deposundan) aşağıdaki servislerin erişilebilir olması gerekir:

- **users servisi**: kimlik doğrulama, JWT doğrulama, roller, sahiplik bağlamı
- **files servisi**: upload ve fatura/dosya akışlarında kullanılan dosya altyapısı
- **notify servisi** (opsiyonel ama önerilir): event/notification senaryoları

Bu servisler olmadan kullanıcı bağlamı, rol kontrolü, sahiplik kontrolü veya dosya/upload ile ilişkili endpointlerde hata alabilirsiniz.