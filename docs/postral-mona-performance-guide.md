# 🚀 Postral-Mona: Performans & RAM Optimizasyon Rehberi

> **Proje:** `apps/payment` — NestJS + Fastify + TypeORM (MariaDB) + Kafka
>
> Geliştirme ortamında **~1 GB RAM** tüketimi tespit edildi.
> Bu rehber, her geliştirme sırasında göz önünde bulundurulması gereken kuralları ve kod örneklerini içerir.

---

## 1. TypeORM Konfigürasyonu

### ❌ Şu an:`payment.module.ts`

```ts
TypeOrmModule.forRoot({
  synchronize: true,                 // ⚠️ Her başlangıçta tüm schema okunur
  logging: ['query', 'error'],       // ⚠️ Her SQL sorgusu loglanıyor = RAM + CPU
  metadataTableName: '',             // ⚠️ Boş string → varsayılan kullanılır, anlamsız
})
```

### ✅ Yapılması Gerekenler

```ts
TypeOrmModule.forRoot({
  synchronize: process.env.NODE_ENV !== 'production', // Prod'da kapalı
  logging: process.env.NODE_ENV === 'development'
    ? ['error', 'warn']   // Sadece hatalar — 'query' kaldırılmalı
    : false,
  extra: {
    connectionLimit: 5,   // Default pool çok büyük olabilir, 5-10 yeterli
  },
})
```

> [!IMPORTANT]
> `logging: ['query', 'error']` geliştirmede bile çok fazla string objesi oluşturur. RAM'i doğrudan etkiler. En azından `['error']`'a düşür.

---

## 2. Cron Job Aralıkları

### ❌ Şu an

| Dosya | Cron | Aralık |
|---|---|---|
| `report-digestion.service.ts` | `*/10 * * * * *` | Her **10 saniye** |
| `payment.service.ts` | `0 * * * * *` | Her **1 dakika** |

### ✅ Yapılması Gerekenler

```ts
// report-digestion.service.ts
@Cron('0 */1 * * * *') // Her 1 dakika — geliştirmede bile yeterli

// Prod için:
@Cron('0 */5 * * * *') // Her 5 dakika
```

```ts
// payment.service.ts — WAITING payment kontrolü
@Cron('0 */2 * * * *') // Her 2 dakika yeterli
```

> [!TIP]
> Cron jobları her tetiklendiğinde TypeORM sorgusu gider + Entity objesi oluşturulur. 10 saniyede bir çalışan job, RAM'de birikim yaratır.

---

## 3. N+1 Sorgu Sorunları

Bu proje en fazla RAM'i bu kalıpta kaybediyor. `report-digestion.service.ts` içinde `for` döngüsü içinde her item için ayrı DB `save()` çağrısı yapılıyor.

### ❌ Şu an: `updateExpensesForReport()`

```ts
for (const item of payment.items) {
  const expense = await this.fetchOrCreateReportExpense(...); // SELECT
  expense.expenseAmount += item.appComissionAmount;
  await this.reportExpenseRepo.save(expense);                 // INSERT/UPDATE
}
// Her item için 2 DB roundtrip → N*2 sorgu
```

### ✅ Yapılması Gereken: Toplu yükleme + tek save

```ts
// Tüm expense'leri önce yükle
const allExpenses = await this.reportExpenseRepo.find({
  where: { reportId, accountId },
});
const expenseMap = new Map(allExpenses.map(e => [e.expenseKey, e]));

// In-memory hesapla
for (const item of payment.items) {
  // map üzerinden güncelle...
}

// Tek seferde kaydet
await this.reportExpenseRepo.save([...expenseMap.values()]);
```

> [!WARNING]
> `for` döngüsü içinde `await repo.save()` veya `await repo.findOne()` görürsen, bu bir N+1 sorunudur ve mutlaka toplu hale getirilmelidir.

---

## 4. İlişki Yüklemesi (Eager vs Lazy vs Explicit)

### Kural

- `@OneToMany`, `@ManyToOne` ilişkilere **asla** `{ eager: true }` ekleme
- İhtiyaç duyulduğunda `relations: ['items']` ile sadece o endpoint için yükle
- `loadEagerRelations: true` kullandığın yerlerde dikkat et

### ❌ Dikkat Edilmesi Gereken

```ts
// report-digestion.service.ts - checkRelations()
const relationsWaiting = await this.reportPaymentRelationRepo.find({
  where: { digestionId, digestionStatus: 'DIGESTING' },
  loadEagerRelations: true,  // ⚠️ Tüm eager relations yüklenir
});
```

### ✅ Tercih Edilen

```ts
const relationsWaiting = await this.reportPaymentRelationRepo.find({
  where: { digestionId, digestionStatus: 'DIGESTING' },
  relations: ['report'],  // Sadece gereken ilişkiyi yükle
});
```

---

## 5. Query Builder ile Sayfalama

`findAll()` kullanan servislerde tüm kayıtlar belleğe alınıyor.

### ❌ Şu an: `payment-search.service.ts`

```ts
async findAll(modelSearch, user) {
  return (await this.paymentrepo.find({ where }))  // Tüm kayıtlar RAM'e!
    .map(p => this.paymentMapper.toDto(p));
}
```

### ✅ Yapılması Gereken: Her liste endpoint'ine `take/skip` ekle

```ts
async findAll(modelSearch, user) {
  const [results, total] = await this.paymentrepo.findAndCount({
    where,
    take: modelSearch.size ?? 20,   // Sayfa başı maksimum
    skip: (modelSearch.page ?? 0) * (modelSearch.size ?? 20),
    order: { createdAt: 'DESC' },
  });
  return results.map(p => this.paymentMapper.toDto(p));
}
```

> [!CAUTION]
> Limit/offset olmadan `find()` çağrısı, tabloda binlerce kayıt olduğunda tüm veriyi RAM'e çeker. Bu en kritik RAM sorunlarından biridir.

---

## 6. Node.js Bellek Yönetimi

### Development ortamı için başlangıç sınırı belirle

`package.json` veya `devserve.sh` içine:

```bash
node --max-old-space-size=512 dist/apps/payment/main.js
```

ya da `nest start` için:

```json
"start:dev": "node --max-old-space-size=512 ./node_modules/.bin/nest start --watch"
```

> [!TIP]
> Bu değer RAM'i limitlemiyor, GC'yi daha agresif tetikliyor. 512 MB sınırı koyarsan garbage collector daha sık temizlik yapar → heap daha küçük kalır.

### Büyük obje birikimi tespiti (geliştirme)

```bash
# Heap snapshot almak için
node --inspect dist/apps/payment/main.js
# Chrome DevTools → chrome://inspect → Memory tab
```

---

## 7. Genel Geliştirme Checklist'i

Her yeni servis/endpoint yazarken şunları kontrol et:

```
[ ] for döngüsü içinde await repo.findOne() / repo.save() YOK
[ ] findAll() çağrılarında take/skip (pagination) VAR
[ ] İlişki (relations) sadece gerektiğinde yükleniyor
[ ] Cron job aralığı makul (geliştirme: ≥1dk, prod: ≥5dk)
[ ] Yeni entity'de eager: true KULLANILMADI
[ ] TypeORM logging: ['query'] sadece debug için açık
[ ] Büyük veri döngülerinde Promise.all() toplu işleniyor
```

---

## Özet: Hızlı Kazanımlar (Sıralı)

| Öncelik | Aksiyon | Beklenen Etki |
|:---:|---|---|
| 🔴 1 | `logging: ['query']` → `['error']` | Hemen görünür RAM düşüşü |
| 🔴 2 | Cron `*/10 * * * * *` → `0 */1 * * * *` | CPU + RAM düşüşü |
| 🟠 3 | `findAll()` metodlarına pagination ekle | Yüksek veri anında kritik |
| 🟠 4 | `updateExpensesForReport` döngüsünü toplu hale getir | DB roundtrip azaltımı |
| 🟡 5 | `--max-old-space-size=512` ekle | GC baskısı artışı |
| 🟡 6 | `loadEagerRelations: false` varsayılan yap | Gereksiz join azaltımı |
