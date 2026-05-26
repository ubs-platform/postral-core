# Docker compose ile çalıştırma

Bu depoda kullanılabilir compose dosyası:

- [infrastructure/docker-compose.yml](../../../infrastructure/docker-compose.yml)

Çalıştırmak için:

```
cd infrastructure
docker compose up -d
```

## Önemli notlar

- Bu compose dosyası şu anda daha çok altyapı bağımlılıklarını (ör. MariaDB) ayağa kaldırır; tüm UBS Mona platform stack'ini içermez.
- Kullanıcı/dosya/bildirim tarafındaki ihtiyaçlar için Postral, dış servis olarak UBS Mona servislerine bağımlıdır.
- Tam lokal kurulum için Postral servislerini bu depodan, bağımlı UBS Mona servislerini ise `users-mona-mr` deposundan başlatmanız gerekir.