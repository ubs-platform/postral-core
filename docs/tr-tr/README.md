# Postral Mona Dokümantasyonu (TR)

> Bu projeyi geliştirmeye devam ediyoruz. Bir hata ile karşılaşırsanız lütfen bildiriniz.

## Sinopsis

Postral Mona, başlangıçta UBS Mona kod tabanından türetilmiş olsa da zamanla ödeme odaklı ayrı bir backend projesine dönüşmüştür.

Bu depodaki ana uygulamalar:

- `payment`: ödeme başlatma, ödeme kanal operasyonları, fatura yönetimi, raporlama, webhook entegrasyonları.
- `testo`: Postral içindeki akışları test eden uygulamadır. Hala üzerinde çalışıyoruz ve henüz tamamen hazır değildir.

## Platform bağımlılığı (UBS Mona)

Postral aşağıdaki yatay yeteneklerde UBS Mona platformuna bağlı çalışır:

- kimlik doğrulama ve yetkilendirme (JWT + roller)
- kullanıcı/hesap sahiplik bağlamı
- dosya ve upload ile ilgili akışlar

Özetle Postral ödeme domainini yönetirken, kullanıcı ve dosya altyapısının önemli kısmı UBS Mona servislerinden gelir.

## İçerikler

### Başlangıç

- [Temel gereksinimler](./getting-started/base-requirements.md)
- [Kaynak kod ile çalıştırma](./getting-started/running-on-source-code.md)
- [Docker compose ile çalıştırma](./getting-started/running-via-docker-compose.md)

### REST API

- [REST API indeks](./rest-api/index.md)

### Messaging (MQ / Engine5)

- [Engine5 event ve request dokumani](./messaging/engine5-event-ve-requestler.md)

### UBS Mona Dokümanları (İlişkili)

- Repository: https://github.com/ubs-platform/ubs-mona-mr
- İngilizce doküman girişi: https://github.com/ubs-platform/ubs-mona-mr/blob/master/docs/en-us/README.md
- Türkçe doküman girişi: https://github.com/ubs-platform/ubs-mona-mr/blob/master/docs/tr-tr/README.md
- Türkçe REST API index: https://github.com/ubs-platform/ubs-mona-mr/blob/master/docs/tr-tr/rest-api/index.md

### Bakım

- [Uygulama oluşturma](./maintaining/1%20-%20creating%20app.md)
- [Uygulamayı çalıştırma](./maintaining/2%20-%20run%20app.md)
- [Kütüphane oluşturma](./maintaining/3%20-%20creating%20library.md)
- [Kütüphaneyi build alıp NPM registry'ye gönderme](./maintaining/4%20-%20build%20library.md)
