# Hassas Alan Şifreleme Önerileri

> Tarih: 18 Nisan 2026  
> Kapsam: `apps/payment/src/entity/`

---

## Mevcut Durum

`Account.legalIdentity` (TCKN / Vergi No) alanı DB saldırılarına karşı şifreli tutulmakta ve gerektiğinde decrypt edilmektedir.

---

## Şifrelenmesi Önerilen Alanlar

### 1. `Account` ve `InvoiceAccount` — Öncelik: 🔴 Yüksek

| Alan | Gerekçe |
|---|---|
| `bankIban` | Finansal kimlik bilgisi. KVKK ve PCI-DSS kapsamında hassas. DB sızıntısında doğrudan kötüye kullanılabilir. |
| `legalIdentity` (`InvoiceAccount`) | `Account`'ta zaten şifreleniyor; ancak `InvoiceAccount` fatura snapshot'ı olduğundan bu tabloda da şifrelenmeli. |
| `taxOffice` | `legalIdentity` ile birlikte Türk vergi kaydını tam olarak tanımlar. Kombinasyon olarak hassas kabul edilir. |

> `bankBic` / `bankSwift` daha az kritiktir (kamuya açık banka kodları). Şifrelemek zorunlu değil, ancak tutarlılık adına eklenebilir.

---

### 2. `Address` ve `InvoiceAddress` — Öncelik: 🟡 Orta

**Tam adres bir bütün olarak** KVKK kapsamında kişisel veri sayılır ve mevcut uygulamada `AddressMapper` / `InvoiceAddressMapper` adres alt alanlarını encrypt/decrypt etmektedir.

**Mevcut davranışla uyumlu yaklaşım:** Adres bileşenlerini parçalı istisnalar tanımlamadan, mapper katmanında şifrelenen alanlar olarak ele al.

| Şifrelenen alanlar |
|---|
| `buildingNumber` |
| `buildingName` |
| `room` |
| `floor` |
| `blockName` |
| `streetName` |
| `cityName` |
| `citySubdivisionName` |
| `postalZone` |
| `country` |
| `region` |

---

### 3. `AccountPaymentTransaction` — Öncelik: 🟢 Düşük (İçeriğe Göre Değişir)

| Alan | Gerekçe |
|---|---|
| `operationNote` | `mediumtext` tipinde, içeriğine göre hassas ödeme/kişi bilgisi taşıyabilir. |
| `description` | Aynı şekilde serbest metin; içerik denetimi yapılmalı, gerekliyse şifrelenmeli. |

---

## Uygulama Notu

- `InvoiceAccount` ve `InvoiceAddress` tabloları fatura snapshot'ı olarak **uzun süre arşivlenir**. Bu nedenle şifreleme önceliği diğer tablolara göre daha yüksek tutulmalıdır.
- Şifreleme/decrypt mekanizması `Account.legalIdentity` için kullanılan çözümle tutarlı olmalı; ayrı bir transformer veya subscriber tercih edilebilir.
- KVKK gereği kişisel verilerin işlenmesi ve saklanmasına ilişkin kayıt yükümlülüğü de göz önünde bulundurulmalıdır.
