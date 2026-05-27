# Messaging (Engine5 / MQ) - Event ve Request Dokumani

Bu sayfa, Postral payment controller tarafinda su an kullanilan mesajlasma sozlesmelerini dokumante eder.

## Baglam

- Postral gelistirmesinde su an Engine5 uyumlu MQ akislarina odaklanilmistir.
- Engine5 deposu: https://github.com/engine5mq/engine5
- Kafka ENV ile halen kullanilabilir, ancak aktif gelistirme ve destek onceligi Engine5 odakli akis tasarimindadir.

## Kaynak controller dosyalari

- apps/payment/src/controller/payment-microservice.controller.ts
- apps/payment/src/controller/dummy-ecommerce-payment-channel.controller.ts

## Event abonelikleri

Bunlar EventPattern ile dinlenir.

| Topic | Payload | Handler | Amac |
|------|------|------|------|
| postral/payment-operation-status-updated | string (operationId) | handlePaymentOperationStatusUpdated | Operasyon statusu degistikten sonra payment state esitlemesi yapar. |
| postral/invoice-updated | { sellerPaymentOrderId: string, invoiceCount: number, hasFinalizedInvoice: boolean } | handleInvoiceUpdated | Seller payment order icin invoice sayisi/finalize durumunu gunceller. |
| postral/report-digestion-queue-insertion | { paymentId: string } | handleReportDigestionQueueInsertion | Event yolundan gelen odeme icin report digestion kuyruguna ekleme yapar. |

## Request/response message patternleri

Bunlar MessagePattern ile dinlenir ve RPC benzeri request/response davranisi verir.

| Pattern | Request payload | Response | Not |
|------|------|------|------|
| postral/payment-channel/dummy-ecommerce/init | PaymentFullWithCaptureInfoDTO | PaymentChannelStatusDTO | Dummy operasyonu baslatir, provider fee ile WAITING doner. |
| postral/payment-channel/dummy-ecommerce/fire | string (operationId) | PaymentChannelStatusDTO | Operasyonu COMPLETED yapar, kayit yoksa veya FAILED ise hata verir. |
| postral/payment-channel/dummy-ecommerce/cancel | string (operationId) | PaymentChannelStatusDTO | Operasyonu FAILED yapar. |
| postral/payment-channel/dummy-ecommerce/check | string (paymentOperationId) | PaymentChannelStatusDTO | Mevcut durumu doner, durum yoksa FAILED varsayar. |

## Emit edilen eventler

| Topic | Payload | Nereden emit edilir | Tetikleyici |
|------|------|------|------|
| postral/payment-operation-status-updated | string (operationId) | dummy-ecommerce-payment-channel controller | /operation/:operationId/status/:set endpointinde manuel status guncellenince. |

## Dummy ecommerce channel HTTP requestleri

Bunlar MQ patterni degildir ama ayni entegrasyon akisinda kullanildigi icin test acisindan dokumante edilmelidir.

| Method | Path | Request | Sonuc |
|------|------|------|------|
| POST | /dummy-ecommerce-payment-channel/operation | PaymentFullWithCaptureInfoDTO | Dummy operasyon baslatir ve PaymentChannelStatusDTO doner. |
| GET | /dummy-ecommerce-payment-channel/operation/:operationId | Query: redirectUrl | HTML odeme simulasyon sayfasi doner. |
| GET | /dummy-ecommerce-payment-channel/operation/:operationId/status/:set | Path: set=COMPLETED veya FAILED, Query: redirectUrl | Status gunceller, payment-operation-status-updated emit eder, gerekirse redirect yapar. |
| GET | /dummy-ecommerce-payment-channel/operation/:operationId/status | Query: redirectUrl | Durumu okuyup current status ile geri redirect eder. |
| PUT | /dummy-ecommerce-payment-channel/kdialog | Body: any | Non-production debug endpoint. |
| POST | /dummy-ecommerce-payment-channel/kdialog | Body: any | Non-production debug endpoint. |
| GET | /dummy-ecommerce-payment-channel/kdialog | Query/Body: any | Non-production debug endpoint. |

## Notlar ve kisitlar

- kdialog endpointleri NonProductionGuard ile korunur, production ortamda kullanilmamalidir.
- Bazi endpoint davranislari bilincli olarak dummy/simulasyon mantigidir.
- Dis uygulamalarin uyumu icin topic isimleri stabil tutulmalidir.
