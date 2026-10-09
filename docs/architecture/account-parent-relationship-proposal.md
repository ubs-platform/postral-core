# Account Parent İlişkisi Taslağı

Durum: Ertelendi; mevcut account modelinde parent account ilişkisi yoktur.

External platform hesapları için ilk taslakta `parentAccountId` kullanılarak
hesap sahipliğinin parent hesaptan devralınması düşünülmüştü. External platform
kullanımı için `isExternal` alanı yeterli olduğundan, bu ilişki mevcut kapsamdan
çıkarıldı. Kodda yalnızca `isExternal` davranışı bulunur.

## Mevcut Davranış

- `isExternal=true` hesaplar oluşturulurken entity ownership kaydı oluşturulmaz.
- External hesapları Postral içinde yalnızca admin oluşturabilir ve yönetebilir.
- `isExternal` değeri hesap oluşturulduktan sonra değiştirilemez.
- Normal hesaplarda mevcut ownership davranışı sürer.
- Harici platform ödeme akışı yeni bir müşteri hesabı oluşturursa hesabı
  `isExternal=true` olarak işaretler.

## İleride Yeniden Değerlendirme

Parent ilişkisi external platform ihtiyacından bağımsız, başka bir ürün ihtiyacı
olarak ortaya çıkarsa yeniden tasarlanabilir. Uygulamadan önce en az şu noktalar
kararlaştırılmalıdır:

- Parent seçiminin ve parent ownership kontrolünün kimlerce yapılabileceği.
- Parent'a bağlı hesaplarda listeleme, tekil okuma, düzenleme ve silme yetkilerinin
  nasıl devralınacağı.
- Parent veya ownership değişikliklerinin engellenmesi ve alt hesap varken
  parent'ın deaktive edilmesi davranışı.
- Parent zincirlerinin döngü oluşturmasının önlenmesi ve ilişkinin derinlik sınırı.
- Veri tabanı migration'ı ve mevcut account verilerinin geriye dönük uyumu.

Bu doküman gelecekteki bir tasarım notudur; parent alanı veya parent ownership
davranışı mevcut API'nin parçası değildir.
