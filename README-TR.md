# Postral Mona

> Proje aktif geliştirme aşamasındadır. Bir sorunla karşılaşırsanız lütfen bildirin.

## Özet

Postral Mona, başlangıçta UBS Mona kod tabanından türetilmiş olup zamanla ödeme odaklı bir backend projesine dönüşmüştür.

Mevcut depo şunları içerir:

- `payment` uygulaması: ödeme yaşam döngüsü, kanal işlemleri, raporlama, fatura akışları, webhook gönderimi.
- `testo` uygulaması: Postral için akış test uygulaması. Hâlâ aktif geliştirme aşamasındadır ve tam olarak hazır değildir.
- Paylaşılan kütüphaneler: `payment-common`, `postral-entities`, `common-utils`.

## Platform bağımlılığı (UBS Mona)

Postral, kesişen işlevler için UBS Mona platform servislerine bağımlılığını sürdürmektedir:

- Kullanıcı kimliği ve yetkilendirme (JWT, roller, sahiplik)
- Hesap ve sahiplik bağlamı
- Fatura/dosya senaryolarında kullanılan dosya ve yükleme akışları

Kısacası: Postral ödeme alan mantığını sağlarken, UBS Mona platform servisleri temel kullanıcı/dosya altyapısını sunmaya devam etmektedir.

## Hızlı Kurulum

### Linux / macOS / WSL (bash)

```bash
curl -fsSL https://raw.githubusercontent.com/ubs-platform/postral-core/master/install.sh | bash
```

Bu komut `docker-compose.yml`, nginx yapılandırması ve başlangıç SQL dosyasını `~/.bin/tetakent/postral` dizinine indirir. Ardından stack'i başlatabilirsiniz:

```bash
cd ~/.bin/tetakent/postral
docker compose up -d
```

### Windows (PowerShell)

```powershell
irm https://raw.githubusercontent.com/ubs-platform/postral-core/master/install.ps1 | iex
```

> Execution policy uzak scriptleri engelliyorsa şunu çalıştırın:
> ```powershell
> powershell -ExecutionPolicy Bypass -Command "irm https://raw.githubusercontent.com/ubs-platform/postral-core/master/install.ps1 | iex"
> ```

Dosyalar `%USERPROFILE%\.bin\tetakent\postral` dizinine kurulur. Stack'i başlatmak için:

```powershell
cd "$env:USERPROFILE\.bin\tetakent\postral"
docker compose up -d
```

## Detaylı Dokümantasyon

- [İngilizce 🇺🇸](./docs/en-us/README.md)
- [Türkçe 🇹🇷](./docs/tr-tr/README.md)

## İlgili UBS Mona Dokümantasyonu

- Depo: https://github.com/ubs-platform/ubs-mona-mr
- İngilizce dok. girişi: https://github.com/ubs-platform/ubs-mona-mr/blob/master/docs/en-us/README.md
- Türkçe dok. girişi: https://github.com/ubs-platform/ubs-mona-mr/blob/master/docs/tr-tr/README.md
- Türkçe REST API indeksi: https://github.com/ubs-platform/ubs-mona-mr/blob/master/docs/tr-tr/rest-api/index.md
