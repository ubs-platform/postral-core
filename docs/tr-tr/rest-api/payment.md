# payment REST API

## PaymentController

### `POST` `api/payment`

**Metot adı:** `initialize`

**Request body:**

```
{
  type: "PURCHASE" | "REFUND";
  currency: string;
  saleMode: string;
  items: {
    itemId: string | undefined;
    entityGroup: string | undefined;
    entityName: string | undefined;
    entityId: string | undefined;
    variation: string | undefined;
    quantity: number;
    unit: string | undefined;

  }[];
  customerAccountId: string;
  refundRequestId: undefined | string;

}
```

_Kaynak: `libs/payment-common/src/dto/payment-init.dto.ts`_

**Yanıt tipi:**

```
{
  id: string;
  type: "PURCHASE" | "REFUND";
  totalAmount: number;
  taxAmount: number;
  customerAccountId: string;
  customerAccountName: undefined | string;
  paymentChannelId: string;
  paymentChannelOperationId: undefined | string;
  paymentChannelOperationUrl: undefined | string;
  paymentStatus: "INITIATED" | "WAITING" | "COMPLETED" | "FAILED";
  errorStatus: undefined | null | "" | "FAILED" | "CANCELLED" | "EXPIRED";
  currency: string;
  createdAt: undefined | string | {
    getVarDate: () => VarDate;

  };
  updatedAt: undefined | string | Date;
  includeInReportDigestion: undefined | false | true;
  openPayment: undefined | false | true;

}
```

_Kaynak: `libs/payment-common/src/dto/payment.dto.ts`_

---

### `POST` `api/payment/:id/operation/start`

**Metot adı:** `startOperation`

**Path parametreleri:**

| İsim | Tip |
|------|-----|
| `id` | `string` |

**Request body:**

```
{
  paidAmount: undefined | number;
  paymentChannelId: string;
  currency: string;

}
```

_Kaynak: `libs/payment-common/src/dto/capture-info.dto.ts`_

**Yanıt tipi:**

```
{
  paymentChannelId: string;
  paymentChannelOperationId: string;
  redirectUrl: string;
  paymentStatus: "WAITING" | "COMPLETED" | "FAILED" | "READY";
  paymentErrorStatus: undefined | "EXPIRED" | "INSUFFICIENT_FUNDS" | "CARD_DECLINED" | "NETWORK_ERROR" | "UNKNOWN";
  providerFee: undefined | number;
  feeCutInstantly: undefined | false | true;

}
```

_Kaynak: `libs/payment-common/src/dto/payment-channel-status.ts`_

---

### `POST` `api/payment/:id/operation/check`

**Metot adı:** `checkOperation`

**Path parametreleri:**

| İsim | Tip |
|------|-----|
| `id` | `string` |

**Yanıt tipi:**

```
{
  id: string;
  type: "PURCHASE" | "REFUND";
  totalAmount: number;
  taxAmount: number;
  customerAccountId: string;
  customerAccountName: undefined | string;
  paymentChannelId: string;
  paymentChannelOperationId: undefined | string;
  paymentChannelOperationUrl: undefined | string;
  paymentStatus: "INITIATED" | "WAITING" | "COMPLETED" | "FAILED";
  errorStatus: undefined | null | "" | "FAILED" | "CANCELLED" | "EXPIRED";
  currency: string;
  createdAt: undefined | string | {
    getVarDate: () => VarDate;

  };
  updatedAt: undefined | string | Date;
  includeInReportDigestion: undefined | false | true;
  openPayment: undefined | false | true;

}
```

_Kaynak: `libs/payment-common/src/dto/payment.dto.ts`_

---

### `GET` `api/payment/:id`

**Metot adı:** `fetchPaymentInformation`

**Path parametreleri:**

| İsim | Tip |
|------|-----|
| `id` | `string` |

**Yanıt tipi:**

```
{
  id: string;
  type: "PURCHASE" | "REFUND";
  totalAmount: number;
  taxAmount: number;
  customerAccountId: string;
  customerAccountName: undefined | string;
  paymentChannelId: string;
  paymentChannelOperationId: undefined | string;
  paymentChannelOperationUrl: undefined | string;
  paymentStatus: "INITIATED" | "WAITING" | "COMPLETED" | "FAILED";
  errorStatus: undefined | null | "" | "FAILED" | "CANCELLED" | "EXPIRED";
  currency: string;
  createdAt: undefined | string | {
    getVarDate: () => VarDate;

  };
  updatedAt: undefined | string | Date;
  includeInReportDigestion: undefined | false | true;
  openPayment: undefined | false | true;

}
```

_Kaynak: `libs/payment-common/src/dto/payment.dto.ts`_

---

### `GET` `api/payment/:id/full`

**Metot adı:** `fetchPaymentFull`

**Path parametreleri:**

| İsim | Tip |
|------|-----|
| `id` | `string` |

**Yanıt tipi:**

```
{
  items: import("/home/huseyin/dev/tk-ubs/postralmona/libs/payment-common/src/index").PaymentItemDto[];
  taxes: import("/home/huseyin/dev/tk-ubs/postralmona/libs/payment-common/src/index").TaxDTO[];
  id: string;
  type: "PURCHASE" | "REFUND";
  totalAmount: number;
  taxAmount: number;
  customerAccountId: string;
  customerAccountName: undefined | string;
  paymentChannelId: string;
  paymentChannelOperationId: undefined | string;
  paymentChannelOperationUrl: undefined | string;
  paymentStatus: "INITIATED" | "WAITING" | "COMPLETED" | "FAILED";
  errorStatus: undefined | null | "" | "FAILED" | "CANCELLED" | "EXPIRED";
  currency: string;
  createdAt: undefined | string | {
    getVarDate: () => VarDate;

  };
  updatedAt: undefined | string | Date;
  includeInReportDigestion: undefined | false | true;
  openPayment: undefined | false | true;

}
```

_Kaynak: `libs/payment-common/src/dto/payment.dto.ts`_

---

### `GET` `api/payment/:id/item`

**Metot adı:** `fetchItems`

**Path parametreleri:**

| İsim | Tip |
|------|-----|
| `id` | `string` |

**Yanıt tipi:**

```
{
  id: string;
  itemId: string;
  name: string;
  quantity: number;
  totalAmount: number;
  taxPercent: number;
  taxAmount: number;
  variation: string;
  sellerAccountId: string | undefined;
  sellerAccountName: string | undefined;
  entityGroup: string | undefined;
  entityId: string | undefined;
  entityName: string | undefined;
  unTaxAmount: number;
  originalUnitAmount: number;
  unitAmount: number;
  unit: string;
  refundCount: number | undefined;
  itemClass: string | undefined;
  appComissionPercent: number;
  appComissionAmount: number;

}[]
```

_Kaynak: `libs/payment-common/src/dto/payment-item.dto.ts`_

---

### `GET` `api/payment/:id/tax`

**Metot adı:** `fetchTaxes`

**Path parametreleri:**

| İsim | Tip |
|------|-----|
| `id` | `string` |

**Yanıt tipi:**

```
{
  taxName: string;
  fullAmount: number;
  percent: number;
  taxAmount: number;
  untaxAmount: number;

}[]
```

_Kaynak: `libs/payment-common/src/dto/tax.dto.ts`_

---

### `DELETE` `api/payment/:id`

**Metot adı:** `cancelPayment`

**Path parametreleri:**

| İsim | Tip |
|------|-----|
| `id` | `string` |

**Yanıt tipi:**

```
{
  id: string;
  type: "PURCHASE" | "REFUND";
  totalAmount: number;
  taxAmount: number;
  customerAccountId: string;
  customerAccountName: undefined | string;
  paymentChannelId: string;
  paymentChannelOperationId: undefined | string;
  paymentChannelOperationUrl: undefined | string;
  paymentStatus: "INITIATED" | "WAITING" | "COMPLETED" | "FAILED";
  errorStatus: undefined | null | "" | "FAILED" | "CANCELLED" | "EXPIRED";
  currency: string;
  createdAt: undefined | string | {
    getVarDate: () => VarDate;

  };
  updatedAt: undefined | string | Date;
  includeInReportDigestion: undefined | false | true;
  openPayment: undefined | false | true;

}
```

_Kaynak: `libs/payment-common/src/dto/payment.dto.ts`_

---

### `POST` `api/payment/:id/confirm`

**Metot adı:** `confirmOpenPayment`

**Path parametreleri:**

| İsim | Tip |
|------|-----|
| `id` | `string` |

**Request body:**

```
{
  sellerAccountId: string;

}
```

_Kaynak: `apps/payment/src/controller/payment.controller.ts`_

**Yanıt tipi:**

```
{
  id: string;
  type: "PURCHASE" | "REFUND";
  totalAmount: number;
  taxAmount: number;
  customerAccountId: string;
  customerAccountName: undefined | string;
  paymentChannelId: string;
  paymentChannelOperationId: undefined | string;
  paymentChannelOperationUrl: undefined | string;
  paymentStatus: "INITIATED" | "WAITING" | "COMPLETED" | "FAILED";
  errorStatus: undefined | null | "" | "FAILED" | "CANCELLED" | "EXPIRED";
  currency: string;
  createdAt: undefined | string | {
    getVarDate: () => VarDate;

  };
  updatedAt: undefined | string | Date;
  includeInReportDigestion: undefined | false | true;
  openPayment: undefined | false | true;

}
```

_Kaynak: `libs/payment-common/src/dto/payment.dto.ts`_

---

## PaymentSearchController

### `GET` `api/payment`

**Metot adı:** `fetchAll`

**Query parametreleri:**

| İsim | Tip |
|------|-----|
| `id` | `string \| undefined` |
| `type` | `"PURCHASE" \| "REFUND" \| undefined` |
| `customerAccountId` | `string \| undefined` |
| `sellerAccountIds` | `string \| undefined` |
| `paymentChannelIds` | `string \| undefined` |
| `paymentStatus` | `string \| undefined` |
| `currency` | `string \| undefined` |
| `dateFrom` | `string \| undefined` |
| `dateTo` | `string \| undefined` |
| `searchSide` | `"USER" \| "ADMIN" \| undefined` |
| `page` | `number` |
| `size` | `number` |
| `sortBy` | `string \| undefined` |
| `sortRotation` | `"desc" \| "asc" \| undefined` |

**Yanıt tipi:**

```
{
  id: string;
  type: "PURCHASE" | "REFUND";
  totalAmount: number;
  taxAmount: number;
  customerAccountId: string;
  customerAccountName: string | undefined;
  paymentChannelId: string;
  paymentChannelOperationId: string | undefined;
  paymentChannelOperationUrl: string | undefined;
  paymentStatus: import("/home/huseyin/dev/tk-ubs/postralmona/libs/payment-common/src/index").PaymentStatus;
  errorStatus: import("/home/huseyin/dev/tk-ubs/postralmona/libs/payment-common/src/index").PaymentErrorStatus;
  currency: string;
  createdAt: string | Date | undefined;
  updatedAt: string | Date | undefined;
  includeInReportDigestion: boolean | undefined;
  openPayment: boolean | undefined;

}[]
```

_Kaynak: `libs/payment-common/src/dto/payment.dto.ts`_

---

### `GET` `api/payment/_search`

**Metot adı:** `searchAll`

**Query parametreleri:**

| İsim | Tip |
|------|-----|
| `id` | `string \| undefined` |
| `type` | `"PURCHASE" \| "REFUND" \| undefined` |
| `customerAccountId` | `string \| undefined` |
| `sellerAccountIds` | `string \| undefined` |
| `paymentChannelIds` | `string \| undefined` |
| `paymentStatus` | `string \| undefined` |
| `currency` | `string \| undefined` |
| `dateFrom` | `string \| undefined` |
| `dateTo` | `string \| undefined` |
| `searchSide` | `"USER" \| "ADMIN" \| undefined` |
| `page` | `number` |
| `size` | `number` |
| `sortBy` | `string \| undefined` |
| `sortRotation` | `"desc" \| "asc" \| undefined` |

**Yanıt tipi:**

```
{
  content: import("/home/huseyin/dev/tk-ubs/postralmona/libs/payment-common/src/index").PaymentDTO[];
  page: number;
  size: number;
  maxItemLength: number;
  maxPagesIndex: number;
  lastPage: boolean;
  firstPage: boolean;

}
```

_Kaynak: `search-result`_

---

### `GET` `api/payment/related-accounts`

**Metot adı:** `fetchRelatedAccounts`

**Query parametreleri:**

| İsim | Tip |
|------|-----|
| `relatedAccountIds` | `string[] \| undefined` |
| `selectFrom` | `"SOURCE" \| "TARGET" \| "BOTH"` |
| `filterRelatedAccountIdsIn` | `"SOURCE" \| "TARGET" \| "BOTH"` |

**Yanıt tipi:**

```
{
  id: string;
  name: string;
  legalIdentity: string;
  type: "INDIVIDUAL" | "COMMERCIAL";
  defaultAddressId: string | undefined;
  ownerUserId: string | undefined;
  entityOwnershipGroupId: string | undefined;
  deactivated: boolean | undefined;
  taxOffice: string | undefined;
  bankName: string | undefined;
  bankIban: string | undefined;
  bankBic: string | undefined;
  bankSwift: string | undefined;

}[]
```

_Kaynak: `libs/payment-common/src/dto/account.dto.ts`_

---

## AddressController

### `GET` `api/address`

**Metot adı:** `fetchAll`

**Query parametreleri:**

| İsim | Tip |
|------|-----|
| `id` | `string \| undefined` |
| `name` | `string \| undefined` |
| `admin` | `"true" \| "false" \| undefined` |
| `ownerUserId` | `string \| undefined` |
| `entityOwnershipGroupId` | `string \| undefined` |

**Yanıt tipi:**

```
{
  id: undefined | string;
  name: string;
  entityOwnershipGroupId: undefined | string;
  buildingNumber: undefined | string;
  buildingName: undefined | string;
  room: undefined | string;
  floor: undefined | string;
  blockName: undefined | string;
  streetName: string;
  additionalStreetName: undefined | string;
  district: undefined | string;
  citySubdivisionName: string;
  cityName: string;
  postalZone: string;
  region: undefined | string;
  postbox: undefined | string;
  country: string;
  countrySubentity: undefined | string;
  countrySubentityCode: undefined | string;
  addressFormatCode: undefined | string;
  addressTypeCode: undefined | string;
  department: undefined | string;
  markAttention: undefined | string;
  markCare: undefined | string;
  plotIdentification: undefined | string;
  cityCode: undefined | string;
  inhaleName: undefined | string;
  timezone: undefined | string;

}[]
```

_Kaynak: `libs/payment-common/src/dto/address.dto.ts`_

---

### `GET` `api/address/_search`

**Metot adı:** `search`

**Query parametreleri:**

| İsim | Tip |
|------|-----|
| `id` | `string \| undefined` |
| `name` | `string \| undefined` |
| `admin` | `"true" \| "false" \| undefined` |
| `ownerUserId` | `string \| undefined` |
| `entityOwnershipGroupId` | `string \| undefined` |

**Yanıt tipi:**

```
{
  id: undefined | string;
  name: string;
  entityOwnershipGroupId: undefined | string;
  buildingNumber: undefined | string;
  buildingName: undefined | string;
  room: undefined | string;
  floor: undefined | string;
  blockName: undefined | string;
  streetName: string;
  additionalStreetName: undefined | string;
  district: undefined | string;
  citySubdivisionName: string;
  cityName: string;
  postalZone: string;
  region: undefined | string;
  postbox: undefined | string;
  country: string;
  countrySubentity: undefined | string;
  countrySubentityCode: undefined | string;
  addressFormatCode: undefined | string;
  addressTypeCode: undefined | string;
  department: undefined | string;
  markAttention: undefined | string;
  markCare: undefined | string;
  plotIdentification: undefined | string;
  cityCode: undefined | string;
  inhaleName: undefined | string;
  timezone: undefined | string;

}
```

_Kaynak: `libs/payment-common/src/dto/address.dto.ts`_

---

### `GET` `api/address/:id`

**Metot adı:** `fetchOne`

**Path parametreleri:**

| İsim | Tip |
|------|-----|
| `id` | `string` |

**Yanıt tipi:**

```
{
  id: undefined | string;
  name: string;
  entityOwnershipGroupId: undefined | string;
  buildingNumber: undefined | string;
  buildingName: undefined | string;
  room: undefined | string;
  floor: undefined | string;
  blockName: undefined | string;
  streetName: string;
  additionalStreetName: undefined | string;
  district: undefined | string;
  citySubdivisionName: string;
  cityName: string;
  postalZone: string;
  region: undefined | string;
  postbox: undefined | string;
  country: string;
  countrySubentity: undefined | string;
  countrySubentityCode: undefined | string;
  addressFormatCode: undefined | string;
  addressTypeCode: undefined | string;
  department: undefined | string;
  markAttention: undefined | string;
  markCare: undefined | string;
  plotIdentification: undefined | string;
  cityCode: undefined | string;
  inhaleName: undefined | string;
  timezone: undefined | string;

}
```

_Kaynak: `libs/payment-common/src/dto/address.dto.ts`_

---

### `POST` `api/address`

**Metot adı:** `add`

**Request body:**

```
{
  id: undefined | string;
  name: string;
  entityOwnershipGroupId: undefined | string;
  buildingNumber: undefined | string;
  buildingName: undefined | string;
  room: undefined | string;
  floor: undefined | string;
  blockName: undefined | string;
  streetName: string;
  additionalStreetName: undefined | string;
  district: undefined | string;
  citySubdivisionName: string;
  cityName: string;
  postalZone: string;
  region: undefined | string;
  postbox: undefined | string;
  country: string;
  countrySubentity: undefined | string;
  countrySubentityCode: undefined | string;
  addressFormatCode: undefined | string;
  addressTypeCode: undefined | string;
  department: undefined | string;
  markAttention: undefined | string;
  markCare: undefined | string;
  plotIdentification: undefined | string;
  cityCode: undefined | string;
  inhaleName: undefined | string;
  timezone: undefined | string;

}
```

_Kaynak: `libs/payment-common/src/dto/address.dto.ts`_

**Yanıt tipi:**

```
{
  id: undefined | string;
  name: string;
  entityOwnershipGroupId: undefined | string;
  buildingNumber: undefined | string;
  buildingName: undefined | string;
  room: undefined | string;
  floor: undefined | string;
  blockName: undefined | string;
  streetName: string;
  additionalStreetName: undefined | string;
  district: undefined | string;
  citySubdivisionName: string;
  cityName: string;
  postalZone: string;
  region: undefined | string;
  postbox: undefined | string;
  country: string;
  countrySubentity: undefined | string;
  countrySubentityCode: undefined | string;
  addressFormatCode: undefined | string;
  addressTypeCode: undefined | string;
  department: undefined | string;
  markAttention: undefined | string;
  markCare: undefined | string;
  plotIdentification: undefined | string;
  cityCode: undefined | string;
  inhaleName: undefined | string;
  timezone: undefined | string;

}
```

_Kaynak: `libs/payment-common/src/dto/address.dto.ts`_

---

### `PUT` `api/address`

**Metot adı:** `edit`

**Request body:**

```
{
  id: undefined | string;
  name: string;
  entityOwnershipGroupId: undefined | string;
  buildingNumber: undefined | string;
  buildingName: undefined | string;
  room: undefined | string;
  floor: undefined | string;
  blockName: undefined | string;
  streetName: string;
  additionalStreetName: undefined | string;
  district: undefined | string;
  citySubdivisionName: string;
  cityName: string;
  postalZone: string;
  region: undefined | string;
  postbox: undefined | string;
  country: string;
  countrySubentity: undefined | string;
  countrySubentityCode: undefined | string;
  addressFormatCode: undefined | string;
  addressTypeCode: undefined | string;
  department: undefined | string;
  markAttention: undefined | string;
  markCare: undefined | string;
  plotIdentification: undefined | string;
  cityCode: undefined | string;
  inhaleName: undefined | string;
  timezone: undefined | string;

}
```

_Kaynak: `libs/payment-common/src/dto/address.dto.ts`_

**Yanıt tipi:**

```
{
  id: undefined | string;
  name: string;
  entityOwnershipGroupId: undefined | string;
  buildingNumber: undefined | string;
  buildingName: undefined | string;
  room: undefined | string;
  floor: undefined | string;
  blockName: undefined | string;
  streetName: string;
  additionalStreetName: undefined | string;
  district: undefined | string;
  citySubdivisionName: string;
  cityName: string;
  postalZone: string;
  region: undefined | string;
  postbox: undefined | string;
  country: string;
  countrySubentity: undefined | string;
  countrySubentityCode: undefined | string;
  addressFormatCode: undefined | string;
  addressTypeCode: undefined | string;
  department: undefined | string;
  markAttention: undefined | string;
  markCare: undefined | string;
  plotIdentification: undefined | string;
  cityCode: undefined | string;
  inhaleName: undefined | string;
  timezone: undefined | string;

}
```

_Kaynak: `libs/payment-common/src/dto/address.dto.ts`_

---

### `DELETE` `api/address/:id`

**Metot adı:** `remove`

**Path parametreleri:**

| İsim | Tip |
|------|-----|
| `id` | `string` |

**Yanıt tipi:**

```
void
```

---

## AppComissionController

### `GET` `api/app-comission/_search`

**Metot adı:** `findAllSearch`

**Query parametreleri:**

| İsim | Tip |
|------|-----|
| `page` | `number` |
| `size` | `number` |
| `sortBy` | `string \| undefined` |
| `sortRotation` | `"desc" \| "asc" \| undefined` |

**Yanıt tipi:**

```
{
  content: AppComissionDTO[];
  page: number;
  size: number;
  maxItemLength: number;
  maxPagesIndex: number;
  lastPage: boolean;
  firstPage: boolean;

}
```

_Kaynak: `search-result`_

---

### `PUT` `api/app-comission`

**Metot adı:** `update`

**Request body:**

```
{
  id: string;
  sellerAccountId: undefined | string;
  sellerAccountName: undefined | string;
  itemClass: undefined | string;
  percent: number;
  bias: number;
  createdAt: undefined | {
    getVarDate: () => VarDate;

  };
  updatedAt: undefined | Date;
  _warning: undefined | string;

}
```

_Kaynak: `libs/payment-common/src/dto/app-comission.dto.ts`_

**Yanıt tipi:**

```
{
  id: string;
  sellerAccountId: undefined | string;
  sellerAccountName: undefined | string;
  itemClass: undefined | string;
  percent: number;
  bias: number;
  createdAt: undefined | {
    getVarDate: () => VarDate;

  };
  updatedAt: undefined | Date;
  _warning: undefined | string;

}
```

_Kaynak: `libs/payment-common/src/dto/app-comission.dto.ts`_

---

### `DELETE` `api/app-comission/:id`

**Metot adı:** `delete`

**Path parametreleri:**

| İsim | Tip |
|------|-----|
| `id` | `string` |

**Yanıt tipi:**

```
void
```

---

## MicroserviceController

_Metot bulunamadı._

## ReportController

### `POST` `api/report/reconstruct`

**Metot adı:** `reconstructReport`

**Request body:**

```
{
  reportId: string;
  findNotExistingPaymentsForAccountId: boolean;

}
```

_Kaynak: `libs/payment-common/src/dto/report-reconstruction.dto.ts`_

**Yanıt tipi:**

```
void
```

---

### `POST` `api/report/fetch-in-progress`

**Metot adı:** `fetchInProgress`

**Request body:**

```
{
  reportIds: string[];

}
```

_Kaynak: `apps/payment/src/controller/report.controller.ts`_

**Yanıt tipi:**

```
any
```

---

### `GET` `api/report/:id`

**Metot adı:** `getReportById`

**Path parametreleri:**

| İsim | Tip |
|------|-----|
| `id` | `string` |

**Yanıt tipi:**

```
{
  taxGroups: import("/home/huseyin/dev/tk-ubs/postralmona/libs/payment-common/src/index").ReportTaxGroupDTO[];
  expenses: import("/home/huseyin/dev/tk-ubs/postralmona/libs/payment-common/src/index").ReportExpenseDTO[];
  id: string;
  queryId: string;
  periodLabel: string;
  currency: string;
  paymentCount: number;
  lastDigestedAt: undefined | string | {
    getVarDate: () => VarDate;

  };
  createdAt: undefined | string | Date;
  totalSaleAmount: number;
  totalRefundAmount: number;
  totalSaleTaxAmount: number;
  totalRefundTaxAmount: number;
  netTaxAmount: number;
  netSaleAmount: number;
  netRevenue: number;
  archived: undefined | false | true;
  totalExpenseAmount: number;
  totalSaleAmountWithoutExpense: number;
  reportType: "SELLER" | "PLATFORM_FLOW" | "PLATFORM_SELLER" | "PLATFORM";
  totalExpense: number;
  netRevenueWithoutExpense: number;
  netRevenueWithoutExpenseTaxed: number;

}
```

_Kaynak: `libs/payment-common/src/dto/report-full.dto.ts`_

---

### `GET` `api/report/_search`

**Metot adı:** `searchReports`

**Query parametreleri:**

| İsim | Tip |
|------|-----|
| `page` | `number` |
| `size` | `number` |
| `sortBy` | `string \| undefined` |
| `sortRotation` | `"desc" \| "asc" \| undefined` |
| `queryId` | `string \| undefined` |
| `ownerAccountIds` | `string \| string[] \| undefined` |
| `includeArchived` | `boolean \| "true" \| "false" \| undefined` |
| `periodLabel` | `string \| undefined` |
| `admin` | `"true" \| "false" \| undefined` |

**Yanıt tipi:**

```
{
  content: import("/home/huseyin/dev/tk-ubs/postralmona/libs/payment-common/src/index").ReportDTO[];
  page: number;
  size: number;
  maxItemLength: number;
  maxPagesIndex: number;
  lastPage: boolean;
  firstPage: boolean;

}
```

_Kaynak: `search-result`_

---

## ItemController

### `DELETE` `api/item/:id/prices/:priceId`

**Metot adı:** `deletePrice`

**Path parametreleri:**

| İsim | Tip |
|------|-----|
| `itemId` | `string` |
| `priceId` | `string` |

**Yanıt tipi:**

```
void
```

---

### `GET` `api/item/:id/prices/default`

**Metot adı:** `getDefaultPrices`

**Path parametreleri:**

| İsim | Tip |
|------|-----|
| `id` | `string` |

**Yanıt tipi:**

```
{
  id: string;
  itemId: string;
  variation: string;
  itemPrice: number;
  currency: string;
  region: string;
  activityOrder: number;
  activeStartAt: Date | undefined;
  activeExpireAt: Date | undefined;
  automaticExchangeFromCurrency: string | undefined;

}[]
```

_Kaynak: `libs/payment-common/src/dto/item-price.dto.ts`_

---

### `GET` `api/item/:id/prices/latest`

**Metot adı:** `getLatestPrices`

**Path parametreleri:**

| İsim | Tip |
|------|-----|
| `id` | `string` |

**Yanıt tipi:**

```
{
  id: string;
  itemId: string;
  variation: string;
  itemPrice: number;
  currency: string;
  region: string;
  activityOrder: number;
  activeStartAt: Date | undefined;
  activeExpireAt: Date | undefined;
  automaticExchangeFromCurrency: string | undefined;

}[]
```

_Kaynak: `libs/payment-common/src/dto/item-price.dto.ts`_

---

### `POST` `api/item/:id/prices/default`

**Metot adı:** `addDefaultPrice`

**Path parametreleri:**

| İsim | Tip |
|------|-----|
| `id` | `string` |

**Request body:**

```
{
  id: string;
  itemId: string;
  variation: string;
  itemPrice: number;
  currency: string;
  region: string;
  activityOrder: number;
  activeStartAt: undefined | {
    getVarDate: () => VarDate;

  };
  activeExpireAt: undefined | Date;
  automaticExchangeFromCurrency: undefined | string;

}
```

_Kaynak: `libs/payment-common/src/dto/item-price.dto.ts`_

**Yanıt tipi:**

```
{
  id: string;
  itemId: string;
  variation: string;
  itemPrice: number;
  currency: string;
  region: string;
  activityOrder: number;
  activeStartAt: undefined | {
    getVarDate: () => VarDate;

  };
  activeExpireAt: undefined | Date;
  automaticExchangeFromCurrency: undefined | string;

}
```

_Kaynak: `libs/payment-common/src/dto/item-price.dto.ts`_

---

### `POST` `api/item`

**Metot adı:** `add`

**Request body:**

```
{
  id: string;
  name: string;
  entityGroup: string;
  entityName: string;
  entityId: string;
  unit: string;
  itemTaxId: string;
  sellerAccountId: string;
  baseCurrency: string;
  entityOwnershipGroupId: undefined | string;
  itemClass: undefined | string;

}
```

_Kaynak: `libs/payment-common/src/dto/item.dto.ts`_

**Yanıt tipi:**

```
{
  id: string;
  name: string;
  entityGroup: string;
  entityName: string;
  entityId: string;
  unit: string;
  itemTaxId: string;
  sellerAccountId: string;
  baseCurrency: string;
  itemClass: undefined | string;

}
```

_Kaynak: `libs/payment-common/src/dto/item.dto.ts`_

---

### `GET` `api/item`

**Metot adı:** `fetchAll`

**Query parametreleri:**

| İsim | Tip |
|------|-----|
| `id` | `string \| undefined` |
| `entityGroup` | `string \| undefined` |
| `entityName` | `string \| undefined` |
| `name` | `string \| undefined` |
| `showOnlyUserOwned` | `"true" \| "false" \| undefined` |
| `entityId` | `string \| undefined` |
| `entityOwnershipGroupId` | `string \| undefined` |
| `itemClass` | `string \| undefined` |

**Yanıt tipi:**

```
{
  id: string;
  name: string;
  entityGroup: string;
  entityName: string;
  entityId: string;
  unit: string;
  itemTaxId: string;
  sellerAccountId: string;
  baseCurrency: string;
  itemClass: undefined | string;

}[]
```

_Kaynak: `libs/payment-common/src/dto/item.dto.ts`_

---

### `GET` `api/item/_search`

**Metot adı:** `search`

**Query parametreleri:**

| İsim | Tip |
|------|-----|
| `id` | `string \| undefined` |
| `entityGroup` | `string \| undefined` |
| `entityName` | `string \| undefined` |
| `name` | `string \| undefined` |
| `showOnlyUserOwned` | `"true" \| "false" \| undefined` |
| `entityId` | `string \| undefined` |
| `entityOwnershipGroupId` | `string \| undefined` |
| `itemClass` | `string \| undefined` |

**Yanıt tipi:**

```
{
  id: string;
  name: string;
  entityGroup: string;
  entityName: string;
  entityId: string;
  unit: string;
  itemTaxId: string;
  sellerAccountId: string;
  baseCurrency: string;
  itemClass: undefined | string;

}
```

_Kaynak: `libs/payment-common/src/dto/item.dto.ts`_

---

### `GET` `api/item/:id`

**Metot adı:** `fetchOne`

**Path parametreleri:**

| İsim | Tip |
|------|-----|
| `id` | `String` |

**Yanıt tipi:**

```
{
  id: string;
  name: string;
  entityGroup: string;
  entityName: string;
  entityId: string;
  unit: string;
  itemTaxId: string;
  sellerAccountId: string;
  baseCurrency: string;
  itemClass: undefined | string;

}
```

_Kaynak: `libs/payment-common/src/dto/item.dto.ts`_

---

### `POST` `api/item`

**Metot adı:** `add`

**Request body:**

```
{
  id: string;
  name: string;
  entityGroup: string;
  entityName: string;
  entityId: string;
  unit: string;
  itemTaxId: string;
  sellerAccountId: string;
  baseCurrency: string;
  entityOwnershipGroupId: undefined | string;
  itemClass: undefined | string;

}
```

_Kaynak: `libs/payment-common/src/dto/item.dto.ts`_

**Yanıt tipi:**

```
{
  id: string;
  name: string;
  entityGroup: string;
  entityName: string;
  entityId: string;
  unit: string;
  itemTaxId: string;
  sellerAccountId: string;
  baseCurrency: string;
  itemClass: undefined | string;

}
```

_Kaynak: `libs/payment-common/src/dto/item.dto.ts`_

---

### `PUT` `api/item`

**Metot adı:** `edit`

**Request body:**

```
{
  id: string;
  name: string;
  entityGroup: string;
  entityName: string;
  entityId: string;
  unit: string;
  itemTaxId: string;
  sellerAccountId: string;
  baseCurrency: string;
  entityOwnershipGroupId: undefined | string;
  itemClass: undefined | string;

}
```

_Kaynak: `libs/payment-common/src/dto/item.dto.ts`_

**Yanıt tipi:**

```
{
  id: string;
  name: string;
  entityGroup: string;
  entityName: string;
  entityId: string;
  unit: string;
  itemTaxId: string;
  sellerAccountId: string;
  baseCurrency: string;
  itemClass: undefined | string;

}
```

_Kaynak: `libs/payment-common/src/dto/item.dto.ts`_

---

### `DELETE` `api/item/:id`

**Metot adı:** `remove`

**Path parametreleri:**

| İsim | Tip |
|------|-----|
| `id` | `String` |

**Yanıt tipi:**

```
void
```

---

## AccountNewController

### `GET` `api/account`

**Metot adı:** `fetchAll`

**Query parametreleri:**

| İsim | Tip |
|------|-----|
| `name` | `string \| undefined` |
| `legalIdentity` | `string \| undefined` |
| `type` | `"INDIVIDUAL" \| "COMMERCIAL" \| undefined` |
| `deactivated` | `"NOT_DEACTIVATED" \| "ONLY_DEACTIVATED" \| "ALL" \| undefined` |
| `taxOffice` | `string \| undefined` |
| `ownerUserId` | `string \| undefined` |
| `entityOwnershipGroupId` | `string \| undefined` |
| `entityIds` | `string[] \| undefined` |
| `admin` | `"true" \| "false" \| undefined` |

**Yanıt tipi:**

```
{
  id: string;
  name: string;
  legalIdentity: string;
  type: "INDIVIDUAL" | "COMMERCIAL";
  defaultAddressId: undefined | string;
  ownerUserId: undefined | string;
  entityOwnershipGroupId: undefined | string;
  deactivated: undefined | false | true;
  taxOffice: undefined | string;
  bankName: undefined | string;
  bankIban: undefined | string;
  bankBic: undefined | string;
  bankSwift: undefined | string;

}[]
```

_Kaynak: `libs/payment-common/src/dto/account.dto.ts`_

---

### `GET` `api/account/_search`

**Metot adı:** `search`

**Query parametreleri:**

| İsim | Tip |
|------|-----|
| `name` | `string \| undefined` |
| `legalIdentity` | `string \| undefined` |
| `type` | `"INDIVIDUAL" \| "COMMERCIAL" \| undefined` |
| `deactivated` | `"NOT_DEACTIVATED" \| "ONLY_DEACTIVATED" \| "ALL" \| undefined` |
| `taxOffice` | `string \| undefined` |
| `ownerUserId` | `string \| undefined` |
| `entityOwnershipGroupId` | `string \| undefined` |
| `entityIds` | `string[] \| undefined` |
| `admin` | `"true" \| "false" \| undefined` |

**Yanıt tipi:**

```
{
  id: string;
  name: string;
  legalIdentity: string;
  type: "INDIVIDUAL" | "COMMERCIAL";
  defaultAddressId: undefined | string;
  ownerUserId: undefined | string;
  entityOwnershipGroupId: undefined | string;
  deactivated: undefined | false | true;
  taxOffice: undefined | string;
  bankName: undefined | string;
  bankIban: undefined | string;
  bankBic: undefined | string;
  bankSwift: undefined | string;

}
```

_Kaynak: `libs/payment-common/src/dto/account.dto.ts`_

---

### `GET` `api/account/:id`

**Metot adı:** `fetchOne`

**Path parametreleri:**

| İsim | Tip |
|------|-----|
| `id` | `String` |

**Yanıt tipi:**

```
{
  id: string;
  name: string;
  legalIdentity: string;
  type: "INDIVIDUAL" | "COMMERCIAL";
  defaultAddressId: undefined | string;
  ownerUserId: undefined | string;
  entityOwnershipGroupId: undefined | string;
  deactivated: undefined | false | true;
  taxOffice: undefined | string;
  bankName: undefined | string;
  bankIban: undefined | string;
  bankBic: undefined | string;
  bankSwift: undefined | string;

}
```

_Kaynak: `libs/payment-common/src/dto/account.dto.ts`_

---

### `POST` `api/account`

**Metot adı:** `add`

**Request body:**

```
{
  id: string;
  name: string;
  legalIdentity: string;
  type: "INDIVIDUAL" | "COMMERCIAL";
  defaultAddressId: undefined | string;
  ownerUserId: undefined | string;
  entityOwnershipGroupId: undefined | string;
  deactivated: undefined | false | true;
  taxOffice: undefined | string;
  bankName: undefined | string;
  bankIban: undefined | string;
  bankBic: undefined | string;
  bankSwift: undefined | string;

}
```

_Kaynak: `libs/payment-common/src/dto/account.dto.ts`_

**Yanıt tipi:**

```
{
  id: string;
  name: string;
  legalIdentity: string;
  type: "INDIVIDUAL" | "COMMERCIAL";
  defaultAddressId: undefined | string;
  ownerUserId: undefined | string;
  entityOwnershipGroupId: undefined | string;
  deactivated: undefined | false | true;
  taxOffice: undefined | string;
  bankName: undefined | string;
  bankIban: undefined | string;
  bankBic: undefined | string;
  bankSwift: undefined | string;

}
```

_Kaynak: `libs/payment-common/src/dto/account.dto.ts`_

---

### `PUT` `api/account`

**Metot adı:** `edit`

**Request body:**

```
{
  id: string;
  name: string;
  legalIdentity: string;
  type: "INDIVIDUAL" | "COMMERCIAL";
  defaultAddressId: undefined | string;
  ownerUserId: undefined | string;
  entityOwnershipGroupId: undefined | string;
  deactivated: undefined | false | true;
  taxOffice: undefined | string;
  bankName: undefined | string;
  bankIban: undefined | string;
  bankBic: undefined | string;
  bankSwift: undefined | string;

}
```

_Kaynak: `libs/payment-common/src/dto/account.dto.ts`_

**Yanıt tipi:**

```
{
  id: string;
  name: string;
  legalIdentity: string;
  type: "INDIVIDUAL" | "COMMERCIAL";
  defaultAddressId: undefined | string;
  ownerUserId: undefined | string;
  entityOwnershipGroupId: undefined | string;
  deactivated: undefined | false | true;
  taxOffice: undefined | string;
  bankName: undefined | string;
  bankIban: undefined | string;
  bankBic: undefined | string;
  bankSwift: undefined | string;

}
```

_Kaynak: `libs/payment-common/src/dto/account.dto.ts`_

---

### `DELETE` `api/account/:id`

**Metot adı:** `remove`

**Path parametreleri:**

| İsim | Tip |
|------|-----|
| `id` | `String` |

**Yanıt tipi:**

```
void
```

---

## DummyEcommercePaymentChannelController

### `POST` `api/dummy-ecommerce-payment-channel/operation`

**Metot adı:** `startPaymentOperation`

**Yanıt tipi:**

```
{
  paymentChannelId: string;
  paymentChannelOperationId: string;
  redirectUrl: string;
  paymentStatus: "WAITING" | "COMPLETED" | "FAILED" | "READY";
  paymentErrorStatus: undefined | "EXPIRED" | "INSUFFICIENT_FUNDS" | "CARD_DECLINED" | "NETWORK_ERROR" | "UNKNOWN";
  providerFee: undefined | number;
  feeCutInstantly: undefined | false | true;

}
```

_Kaynak: `libs/payment-common/src/dto/payment-channel-status.ts`_

---

### `GET` `api/dummy-ecommerce-payment-channel/operation/:operationId`

**Metot adı:** `getPaymentOperationDummyPage`

**Path parametreleri:**

| İsim | Tip |
|------|-----|
| `operationId` | `string` |

**Query parametreleri:**

| İsim | Tip |
|------|-----|
| `redirectUrlBackToApp` | `string` |

**Yanıt tipi:**

```
void
```

---

### `GET` `api/dummy-ecommerce-payment-channel/operation/:operationId/status/:set`

**Metot adı:** `setPaymentStatusAndRedirect`

**Path parametreleri:**

| İsim | Tip |
|------|-----|
| `operationId` | `string` |
| `set` | `"COMPLETED" \| "FAILED"` |

**Query parametreleri:**

| İsim | Tip |
|------|-----|
| `redirectUrlBackToApp` | `string` |

**Yanıt tipi:**

```
any
```

---

### `GET` `api/dummy-ecommerce-payment-channel/operation/:operationId/status`

**Metot adı:** `checkPaymentStatusAndRedirect`

**Path parametreleri:**

| İsim | Tip |
|------|-----|
| `operationId` | `string` |

**Query parametreleri:**

| İsim | Tip |
|------|-----|
| `redirectUrlBackToApp` | `string` |

**Yanıt tipi:**

```
any
```

---

### `PUT` `api/dummy-ecommerce-payment-channel/kdialog`

**Metot adı:** `kDialogTestPut`

**Request body:**

```
any
```

**Yanıt tipi:**

```
{
  message: string;
  receivedBody: any;

}
```

_Kaynak: `apps/payment/src/controller/dummy-ecommerce-payment-channel.controller.ts`_

---

### `POST` `api/dummy-ecommerce-payment-channel/kdialog`

**Metot adı:** `kDialogTestPost`

**Request body:**

```
any
```

**Yanıt tipi:**

```
{
  message: string;
  receivedBody: any;

}
```

_Kaynak: `apps/payment/src/controller/dummy-ecommerce-payment-channel.controller.ts`_

---

### `GET` `api/dummy-ecommerce-payment-channel/kdialog`

**Metot adı:** `kDialogTestGet`

**Query parametreleri:**

| İsim | Tip |
|------|-----|
| `query` | `any` |

**Request body:**

```
any
```

**Yanıt tipi:**

```
{
  message: string;
  receivedBody: any;

}
```

_Kaynak: `apps/payment/src/controller/dummy-ecommerce-payment-channel.controller.ts`_

---

## ItemTaxController

### `GET` `api/item-tax`

**Metot adı:** `fetchAll`

**Query parametreleri:**

| İsim | Tip |
|------|-----|
| `entityOwnershipGroupId` | `string \| undefined` |
| `entityIds` | `string[] \| undefined` |
| `admin` | `"true" \| "false" \| undefined` |
| `taxName` | `string` |
| `ownerUserId` | `string \| undefined` |
| `visibility` | `"PUBLIC" \| "PRIVATE" \| "NONE" \| undefined` |

**Yanıt tipi:**

```
{
  id: string;
  taxName: string;
  variations: ItemTaxVariationDTO[];
  entityOwnershipGroupId: undefined | string;
  isPublic: boolean;

}[]
```

_Kaynak: `libs/payment-common/src/dto/item-tax.dto.ts`_

---

### `GET` `api/item-tax/_search`

**Metot adı:** `search`

**Query parametreleri:**

| İsim | Tip |
|------|-----|
| `entityOwnershipGroupId` | `string \| undefined` |
| `entityIds` | `string[] \| undefined` |
| `admin` | `"true" \| "false" \| undefined` |
| `taxName` | `string` |
| `ownerUserId` | `string \| undefined` |
| `visibility` | `"PUBLIC" \| "PRIVATE" \| "NONE" \| undefined` |

**Yanıt tipi:**

```
{
  id: string;
  taxName: string;
  variations: ItemTaxVariationDTO[];
  entityOwnershipGroupId: undefined | string;
  isPublic: boolean;

}
```

_Kaynak: `libs/payment-common/src/dto/item-tax.dto.ts`_

---

### `GET` `api/item-tax/:id`

**Metot adı:** `fetchOne`

**Path parametreleri:**

| İsim | Tip |
|------|-----|
| `id` | `String` |

**Yanıt tipi:**

```
{
  id: string;
  taxName: string;
  variations: ItemTaxVariationDTO[];
  entityOwnershipGroupId: undefined | string;
  isPublic: boolean;

}
```

_Kaynak: `libs/payment-common/src/dto/item-tax.dto.ts`_

---

### `POST` `api/item-tax`

**Metot adı:** `add`

**Request body:**

```
{
  id: string;
  taxName: string;
  variations: ItemTaxVariationDTO[];
  entityOwnershipGroupId: undefined | string;
  isPublic: boolean;

}
```

_Kaynak: `libs/payment-common/src/dto/item-tax.dto.ts`_

**Yanıt tipi:**

```
{
  id: string;
  taxName: string;
  variations: ItemTaxVariationDTO[];
  entityOwnershipGroupId: undefined | string;
  isPublic: boolean;

}
```

_Kaynak: `libs/payment-common/src/dto/item-tax.dto.ts`_

---

### `PUT` `api/item-tax`

**Metot adı:** `edit`

**Request body:**

```
{
  id: string;
  taxName: string;
  variations: ItemTaxVariationDTO[];
  entityOwnershipGroupId: undefined | string;
  isPublic: boolean;

}
```

_Kaynak: `libs/payment-common/src/dto/item-tax.dto.ts`_

**Yanıt tipi:**

```
{
  id: string;
  taxName: string;
  variations: ItemTaxVariationDTO[];
  entityOwnershipGroupId: undefined | string;
  isPublic: boolean;

}
```

_Kaynak: `libs/payment-common/src/dto/item-tax.dto.ts`_

---

### `DELETE` `api/item-tax/:id`

**Metot adı:** `remove`

**Path parametreleri:**

| İsim | Tip |
|------|-----|
| `id` | `String` |

**Yanıt tipi:**

```
void
```

---

## CalculationController

### `POST` `api/calculation/total-amount`

**Metot adı:** `calculateTotalAmount`

**Request body:**

```
{
  items: {
    itemId: string | undefined;
    entityGroup: string | undefined;
    entityName: string | undefined;
    entityId: string | undefined;
    variation: string | undefined;
    quantity: number;
    unit: string | undefined;

  }[];
  saleMode: string;
  currency: string;

}
```

_Kaynak: `libs/payment-common/src/dto/calculation.dto.ts`_

**Yanıt tipi:**

```
{
  items: import("/home/huseyin/dev/tk-ubs/postralmona/libs/payment-common/src/index").PaymentItemDto[];
  totalAmount: number;
  totalTaxAmount: number;
  taxes: import("/home/huseyin/dev/tk-ubs/postralmona/libs/payment-common/src/index").TaxDTO[];

}
```

_Kaynak: `libs/payment-common/src/dto/calculation.dto.ts`_

---

## TransactionSearchController

### `GET` `api/seller-payment-order`

**Metot adı:** `fetchAll`

**Query parametreleri:**

| İsim | Tip |
|------|-----|
| `page` | `number` |
| `size` | `number` |
| `sortBy` | `string` |
| `sortRotation` | `"desc" \| "asc"` |
| `id` | `string \| undefined` |
| `paymentId` | `string \| undefined` |
| `targetAccountIds` | `string \| undefined` |
| `sourceAccountIds` | `string \| undefined` |
| `paymentStatus` | `import("/home/huseyin/dev/tk-ubs/postralmona/libs/payment-common/src/type/status").PaymentStatus \| undefined` |
| `currency` | `string \| undefined` |
| `dateFrom` | `string \| undefined` |
| `dateTo` | `string \| undefined` |
| `admin` | `"true" \| "false"` |

**Yanıt tipi:**

```
{
  id: string | undefined;
  amount: number;
  taxAmount: number;
  untaxedAmount: number;
  currency: string;
  paymentId: string;
  targetAccountId: string;
  targetAccountName: string | undefined;
  sourceAccountId: string;
  sourceAccountName: string | undefined;
  paymentStatus: import("/home/huseyin/dev/tk-ubs/postralmona/libs/payment-common/src/index").PaymentStatus;
  errorStatus: import("/home/huseyin/dev/tk-ubs/postralmona/libs/payment-common/src/index").PaymentErrorStatus;
  operationNote: string;
  transactionType: import("/home/huseyin/dev/tk-ubs/postralmona/libs/payment-common/src/index").SellerPaymentOrderType;
  createdAt: string | Date;
  updatedAt: string | Date;
  lastOperationDate: string | Date;
  description: string | undefined;
  invoiceCount: number | undefined;
  hasFinalizedInvoice: boolean | undefined;
  openPayment: boolean | undefined;

}[]
```

_Kaynak: `libs/payment-common/src/dto/payment-transaction.dto.ts`_

---

### `GET` `api/seller-payment-order/_search`

**Metot adı:** `searchAll`

**Query parametreleri:**

| İsim | Tip |
|------|-----|
| `page` | `number` |
| `size` | `number` |
| `sortBy` | `string` |
| `sortRotation` | `"desc" \| "asc"` |
| `id` | `string \| undefined` |
| `paymentId` | `string \| undefined` |
| `targetAccountIds` | `string \| undefined` |
| `sourceAccountIds` | `string \| undefined` |
| `paymentStatus` | `import("/home/huseyin/dev/tk-ubs/postralmona/libs/payment-common/src/type/status").PaymentStatus \| undefined` |
| `currency` | `string \| undefined` |
| `dateFrom` | `string \| undefined` |
| `dateTo` | `string \| undefined` |
| `admin` | `"true" \| "false"` |

**Yanıt tipi:**

```
{
  content: import("/home/huseyin/dev/tk-ubs/postralmona/libs/payment-common/src/index").PaymentTransactionDTO[];
  page: number;
  size: number;
  maxItemLength: number;
  maxPagesIndex: number;
  lastPage: boolean;
  firstPage: boolean;

}
```

_Kaynak: `search-result`_

---

### `GET` `api/seller-payment-order/:id`

**Metot adı:** `fetchById`

**Path parametreleri:**

| İsim | Tip |
|------|-----|
| `id` | `string` |

**Yanıt tipi:**

```
{
  id: undefined | string;
  amount: number;
  taxAmount: number;
  untaxedAmount: number;
  currency: string;
  paymentId: string;
  targetAccountId: string;
  targetAccountName: undefined | string;
  sourceAccountId: string;
  sourceAccountName: undefined | string;
  paymentStatus: "INITIATED" | "WAITING" | "COMPLETED" | "FAILED";
  errorStatus: undefined | null | "" | "FAILED" | "CANCELLED" | "EXPIRED";
  operationNote: string;
  transactionType: "CREDIT_TO_SELLER" | "DEBIT_FROM_SELLER";
  createdAt: string | {
    getVarDate: () => VarDate;

  };
  updatedAt: string | Date;
  lastOperationDate: string | Date;
  description: undefined | string;
  invoiceCount: undefined | number;
  hasFinalizedInvoice: undefined | false | true;
  openPayment: undefined | false | true;

}
```

_Kaynak: `libs/payment-common/src/dto/payment-transaction.dto.ts`_

---

## PaymentItemSearchController

### `GET` `api/payment-items`

**Metot adı:** `searchItems`

**Query parametreleri:**

| İsim | Tip |
|------|-----|
| `id` | `string \| undefined` |
| `itemId` | `string \| undefined` |
| `name` | `string \| undefined` |
| `variation` | `string \| undefined` |
| `sellerAccountId` | `string \| undefined` |
| `entityGroup` | `string \| undefined` |
| `entityId` | `string \| undefined` |
| `entityName` | `string \| undefined` |
| `entityOwnerAccountId` | `string \| undefined` |
| `paymentId` | `string \| undefined` |

**Yanıt tipi:**

```
{
  id: string;
  itemId: string;
  name: string;
  quantity: number;
  totalAmount: number;
  taxPercent: number;
  taxAmount: number;
  variation: string;
  sellerAccountId: string | undefined;
  sellerAccountName: string | undefined;
  entityGroup: string | undefined;
  entityId: string | undefined;
  entityName: string | undefined;
  unTaxAmount: number;
  originalUnitAmount: number;
  unitAmount: number;
  unit: string;
  refundCount: number | undefined;
  itemClass: string | undefined;
  appComissionPercent: number;
  appComissionAmount: number;

}[]
```

_Kaynak: `libs/payment-common/src/dto/payment-item.dto.ts`_

---

## InvoiceController

### `POST` `api/invoice`

**Metot adı:** `create`

**Request body:**

```
{
  paymentId: string;
  sellerPaymentOrderId: string;
  filePath: string;
  originalFileName: string;
  fileSize: number;
  mimeType: string;
  invoiceNumber: undefined | string;
  invoiceDate: undefined | {
    getVarDate: () => VarDate;

  };
  uploadedByUserId: undefined | string;
  notes: undefined | string;
  sellerInvoiceAddress: undefined | {
    id: undefined | string;
    name: string;
    entityOwnershipGroupId: undefined | string;
    buildingNumber: undefined | string;
    buildingName: undefined | string;
    room: undefined | string;
    floor: undefined | string;
    blockName: undefined | string;
    streetName: string;
    additionalStreetName: undefined | string;
    district: undefined | string;
    citySubdivisionName: string;
    cityName: string;
    postalZone: string;
    region: undefined | string;
    postbox: undefined | string;
    country: string;
    countrySubentity: undefined | string;
    countrySubentityCode: undefined | string;
    addressFormatCode: undefined | string;
    addressTypeCode: undefined | string;
    department: undefined | string;
    markAttention: undefined | string;
    markCare: undefined | string;
    plotIdentification: undefined | string;
    cityCode: undefined | string;
    inhaleName: undefined | string;
    timezone: undefined | string;

  };
  sellerInvoiceAccount: undefined | {
    id: string;
    name: string;
    legalIdentity: string;
    type: "INDIVIDUAL" | "COMMERCIAL";
    realAccountId: undefined | string;
    bankName: undefined | string;
    bankIban: undefined | string;
    bankBic: undefined | string;
    bankSwift: undefined | string;
    taxOffice: undefined | string;

  };
  customerInvoiceAddress: undefined | import("/home/huseyin/dev/tk-ubs/postralmona/libs/payment-common/src/index").InvoiceAddressDto;
  customerAccount: undefined | import("/home/huseyin/dev/tk-ubs/postralmona/libs/payment-common/src/index").InvoiceAccountDTO;

}
```

_Kaynak: `libs/payment-common/src/dto/invoice.dto.ts`_

**Yanıt tipi:**

```
{
  id: string;
  paymentId: string;
  sellerPaymentOrderId: string;
  invoiceNumber: undefined | string;
  invoiceDate: undefined | {
    getVarDate: () => VarDate;

  };
  status: string;
  uploadedByUserId: undefined | string;
  notes: undefined | string;
  createdAt: Date;
  updatedAt: Date;
  sellerInvoiceAddress: undefined | {
    id: string | undefined;
    name: string;
    entityOwnershipGroupId: string | undefined;
    buildingNumber: string | undefined;
    buildingName: string | undefined;
    room: string | undefined;
    floor: string | undefined;
    blockName: string | undefined;
    streetName: string;
    additionalStreetName: string | undefined;
    district: string | undefined;
    citySubdivisionName: string;
    cityName: string;
    postalZone: string;
    region: string | undefined;
    postbox: string | undefined;
    country: string;
    countrySubentity: string | undefined;
    countrySubentityCode: string | undefined;
    addressFormatCode: string | undefined;
    addressTypeCode: string | undefined;
    department: string | undefined;
    markAttention: string | undefined;
    markCare: string | undefined;
    plotIdentification: string | undefined;
    cityCode: string | undefined;
    inhaleName: string | undefined;
    timezone: string | undefined;

  };
  sellerInvoiceAccount: undefined | {
    id: string;
    name: string;
    legalIdentity: string;
    type: "INDIVIDUAL" | "COMMERCIAL";
    realAccountId: string | undefined;
    bankName: string | undefined;
    bankIban: string | undefined;
    bankBic: string | undefined;
    bankSwift: string | undefined;
    taxOffice: string | undefined;

  };
  customerInvoiceAddress: undefined | import("/home/huseyin/dev/tk-ubs/postralmona/libs/payment-common/src/index").InvoiceAddressDto;
  customerAccount: undefined | import("/home/huseyin/dev/tk-ubs/postralmona/libs/payment-common/src/index").InvoiceAccountDTO;
  finalized: boolean;

}
```

_Kaynak: `libs/payment-common/src/dto/invoice.dto.ts`_

---

### `GET` `api/invoice/:id`

**Metot adı:** `findById`

**Path parametreleri:**

| İsim | Tip |
|------|-----|
| `id` | `string` |

**Yanıt tipi:**

```
{
  id: string;
  paymentId: string;
  sellerPaymentOrderId: string;
  invoiceNumber: undefined | string;
  invoiceDate: undefined | {
    getVarDate: () => VarDate;

  };
  status: string;
  uploadedByUserId: undefined | string;
  notes: undefined | string;
  createdAt: Date;
  updatedAt: Date;
  sellerInvoiceAddress: undefined | {
    id: string | undefined;
    name: string;
    entityOwnershipGroupId: string | undefined;
    buildingNumber: string | undefined;
    buildingName: string | undefined;
    room: string | undefined;
    floor: string | undefined;
    blockName: string | undefined;
    streetName: string;
    additionalStreetName: string | undefined;
    district: string | undefined;
    citySubdivisionName: string;
    cityName: string;
    postalZone: string;
    region: string | undefined;
    postbox: string | undefined;
    country: string;
    countrySubentity: string | undefined;
    countrySubentityCode: string | undefined;
    addressFormatCode: string | undefined;
    addressTypeCode: string | undefined;
    department: string | undefined;
    markAttention: string | undefined;
    markCare: string | undefined;
    plotIdentification: string | undefined;
    cityCode: string | undefined;
    inhaleName: string | undefined;
    timezone: string | undefined;

  };
  sellerInvoiceAccount: undefined | {
    id: string;
    name: string;
    legalIdentity: string;
    type: "INDIVIDUAL" | "COMMERCIAL";
    realAccountId: string | undefined;
    bankName: string | undefined;
    bankIban: string | undefined;
    bankBic: string | undefined;
    bankSwift: string | undefined;
    taxOffice: string | undefined;

  };
  customerInvoiceAddress: undefined | import("/home/huseyin/dev/tk-ubs/postralmona/libs/payment-common/src/index").InvoiceAddressDto;
  customerAccount: undefined | import("/home/huseyin/dev/tk-ubs/postralmona/libs/payment-common/src/index").InvoiceAccountDTO;
  finalized: boolean;

}
```

_Kaynak: `libs/payment-common/src/dto/invoice.dto.ts`_

---

### `PUT` `api/invoice/:id`

**Metot adı:** `update`

**Path parametreleri:**

| İsim | Tip |
|------|-----|
| `id` | `string` |

**Request body:**

```
{
  invoiceNumber: undefined | string;
  invoiceDate: undefined | {
    getVarDate: () => VarDate;

  };
  status: undefined | string;
  notes: undefined | string;

}
```

_Kaynak: `libs/payment-common/src/dto/invoice.dto.ts`_

**Yanıt tipi:**

```
{
  id: string;
  paymentId: string;
  sellerPaymentOrderId: string;
  invoiceNumber: undefined | string;
  invoiceDate: undefined | {
    getVarDate: () => VarDate;

  };
  status: string;
  uploadedByUserId: undefined | string;
  notes: undefined | string;
  createdAt: Date;
  updatedAt: Date;
  sellerInvoiceAddress: undefined | {
    id: string | undefined;
    name: string;
    entityOwnershipGroupId: string | undefined;
    buildingNumber: string | undefined;
    buildingName: string | undefined;
    room: string | undefined;
    floor: string | undefined;
    blockName: string | undefined;
    streetName: string;
    additionalStreetName: string | undefined;
    district: string | undefined;
    citySubdivisionName: string;
    cityName: string;
    postalZone: string;
    region: string | undefined;
    postbox: string | undefined;
    country: string;
    countrySubentity: string | undefined;
    countrySubentityCode: string | undefined;
    addressFormatCode: string | undefined;
    addressTypeCode: string | undefined;
    department: string | undefined;
    markAttention: string | undefined;
    markCare: string | undefined;
    plotIdentification: string | undefined;
    cityCode: string | undefined;
    inhaleName: string | undefined;
    timezone: string | undefined;

  };
  sellerInvoiceAccount: undefined | {
    id: string;
    name: string;
    legalIdentity: string;
    type: "INDIVIDUAL" | "COMMERCIAL";
    realAccountId: string | undefined;
    bankName: string | undefined;
    bankIban: string | undefined;
    bankBic: string | undefined;
    bankSwift: string | undefined;
    taxOffice: string | undefined;

  };
  customerInvoiceAddress: undefined | import("/home/huseyin/dev/tk-ubs/postralmona/libs/payment-common/src/index").InvoiceAddressDto;
  customerAccount: undefined | import("/home/huseyin/dev/tk-ubs/postralmona/libs/payment-common/src/index").InvoiceAccountDTO;
  finalized: boolean;

}
```

_Kaynak: `libs/payment-common/src/dto/invoice.dto.ts`_

---

### `DELETE` `api/invoice/:id`

**Metot adı:** `delete`

**Path parametreleri:**

| İsim | Tip |
|------|-----|
| `id` | `string` |

**Yanıt tipi:**

```
void
```

---

### `GET` `api/invoice`

**Metot adı:** `fetchAll`

**Query parametreleri:**

| İsim | Tip |
|------|-----|
| `page` | `number` |
| `size` | `number` |
| `sortBy` | `string \| undefined` |
| `sortRotation` | `"desc" \| "asc" \| undefined` |
| `paymentId` | `string \| undefined` |
| `sellerPaymentOrderId` | `string \| undefined` |
| `invoiceNumber` | `string \| undefined` |
| `status` | `string \| undefined` |
| `uploadedByUserId` | `string \| undefined` |
| `dateFrom` | `Date \| undefined` |
| `dateTo` | `Date \| undefined` |
| `finalized` | `boolean \| "true" \| "false" \| undefined` |

**Yanıt tipi:**

```
{
  id: string;
  paymentId: string;
  sellerPaymentOrderId: string;
  invoiceNumber: string | undefined;
  invoiceDate: Date | undefined;
  status: string;
  uploadedByUserId: string | undefined;
  notes: string | undefined;
  createdAt: Date;
  updatedAt: Date;
  sellerInvoiceAddress: import("/home/huseyin/dev/tk-ubs/postralmona/libs/payment-common/src/index").InvoiceAddressDto | undefined;
  sellerInvoiceAccount: import("/home/huseyin/dev/tk-ubs/postralmona/libs/payment-common/src/index").InvoiceAccountDTO | undefined;
  customerInvoiceAddress: import("/home/huseyin/dev/tk-ubs/postralmona/libs/payment-common/src/index").InvoiceAddressDto | undefined;
  customerAccount: import("/home/huseyin/dev/tk-ubs/postralmona/libs/payment-common/src/index").InvoiceAccountDTO | undefined;
  finalized: boolean;

}[]
```

_Kaynak: `libs/payment-common/src/dto/invoice.dto.ts`_

---

### `GET` `api/invoice/_search`

**Metot adı:** `search`

**Query parametreleri:**

| İsim | Tip |
|------|-----|
| `page` | `number` |
| `size` | `number` |
| `sortBy` | `string \| undefined` |
| `sortRotation` | `"desc" \| "asc" \| undefined` |
| `paymentId` | `string \| undefined` |
| `sellerPaymentOrderId` | `string \| undefined` |
| `invoiceNumber` | `string \| undefined` |
| `status` | `string \| undefined` |
| `uploadedByUserId` | `string \| undefined` |
| `dateFrom` | `Date \| undefined` |
| `dateTo` | `Date \| undefined` |
| `finalized` | `boolean \| "true" \| "false" \| undefined` |

**Yanıt tipi:**

```
{
  content: InvoiceDTO[];
  page: number;
  size: number;
  maxItemLength: number;
  maxPagesIndex: number;
  lastPage: boolean;
  firstPage: boolean;

}
```

_Kaynak: `search-result`_

---

### `GET` `api/invoice/:id/ubl`

**Metot adı:** `downloadUbl`

**Path parametreleri:**

| İsim | Tip |
|------|-----|
| `id` | `string` |

**Yanıt tipi:**

```
void
```

---

### `PUT` `api/invoice/:id/finalize`

**Metot adı:** `finalize`

**Path parametreleri:**

| İsim | Tip |
|------|-----|
| `id` | `string` |

**Yanıt tipi:**

```
{
  id: string;
  paymentId: string;
  sellerPaymentOrderId: string;
  invoiceNumber: undefined | string;
  invoiceDate: undefined | {
    getVarDate: () => VarDate;

  };
  status: string;
  uploadedByUserId: undefined | string;
  notes: undefined | string;
  createdAt: Date;
  updatedAt: Date;
  sellerInvoiceAddress: undefined | {
    id: string | undefined;
    name: string;
    entityOwnershipGroupId: string | undefined;
    buildingNumber: string | undefined;
    buildingName: string | undefined;
    room: string | undefined;
    floor: string | undefined;
    blockName: string | undefined;
    streetName: string;
    additionalStreetName: string | undefined;
    district: string | undefined;
    citySubdivisionName: string;
    cityName: string;
    postalZone: string;
    region: string | undefined;
    postbox: string | undefined;
    country: string;
    countrySubentity: string | undefined;
    countrySubentityCode: string | undefined;
    addressFormatCode: string | undefined;
    addressTypeCode: string | undefined;
    department: string | undefined;
    markAttention: string | undefined;
    markCare: string | undefined;
    plotIdentification: string | undefined;
    cityCode: string | undefined;
    inhaleName: string | undefined;
    timezone: string | undefined;

  };
  sellerInvoiceAccount: undefined | {
    id: string;
    name: string;
    legalIdentity: string;
    type: "INDIVIDUAL" | "COMMERCIAL";
    realAccountId: string | undefined;
    bankName: string | undefined;
    bankIban: string | undefined;
    bankBic: string | undefined;
    bankSwift: string | undefined;
    taxOffice: string | undefined;

  };
  customerInvoiceAddress: undefined | import("/home/huseyin/dev/tk-ubs/postralmona/libs/payment-common/src/index").InvoiceAddressDto;
  customerAccount: undefined | import("/home/huseyin/dev/tk-ubs/postralmona/libs/payment-common/src/index").InvoiceAccountDTO;
  finalized: boolean;

}
```

_Kaynak: `libs/payment-common/src/dto/invoice.dto.ts`_

---

### `POST` `api/invoice/from-transaction/:sellerPaymentOrderId`

**Metot adı:** `createFromTransaction`

**Path parametreleri:**

| İsim | Tip |
|------|-----|
| `sellerPaymentOrderId` | `string` |

**Yanıt tipi:**

```
{
  id: string;
  paymentId: string;
  sellerPaymentOrderId: string;
  invoiceNumber: undefined | string;
  invoiceDate: undefined | {
    getVarDate: () => VarDate;

  };
  status: string;
  uploadedByUserId: undefined | string;
  notes: undefined | string;
  createdAt: Date;
  updatedAt: Date;
  sellerInvoiceAddress: undefined | {
    id: string | undefined;
    name: string;
    entityOwnershipGroupId: string | undefined;
    buildingNumber: string | undefined;
    buildingName: string | undefined;
    room: string | undefined;
    floor: string | undefined;
    blockName: string | undefined;
    streetName: string;
    additionalStreetName: string | undefined;
    district: string | undefined;
    citySubdivisionName: string;
    cityName: string;
    postalZone: string;
    region: string | undefined;
    postbox: string | undefined;
    country: string;
    countrySubentity: string | undefined;
    countrySubentityCode: string | undefined;
    addressFormatCode: string | undefined;
    addressTypeCode: string | undefined;
    department: string | undefined;
    markAttention: string | undefined;
    markCare: string | undefined;
    plotIdentification: string | undefined;
    cityCode: string | undefined;
    inhaleName: string | undefined;
    timezone: string | undefined;

  };
  sellerInvoiceAccount: undefined | {
    id: string;
    name: string;
    legalIdentity: string;
    type: "INDIVIDUAL" | "COMMERCIAL";
    realAccountId: string | undefined;
    bankName: string | undefined;
    bankIban: string | undefined;
    bankBic: string | undefined;
    bankSwift: string | undefined;
    taxOffice: string | undefined;

  };
  customerInvoiceAddress: undefined | import("/home/huseyin/dev/tk-ubs/postralmona/libs/payment-common/src/index").InvoiceAddressDto;
  customerAccount: undefined | import("/home/huseyin/dev/tk-ubs/postralmona/libs/payment-common/src/index").InvoiceAccountDTO;
  finalized: boolean;

}
```

_Kaynak: `libs/payment-common/src/dto/invoice.dto.ts`_

---

## PaymentMicroserviceController

_Metot bulunamadı._

## RefundController

### `POST` `api/refund/request`

**Metot adı:** `createRefundRequest`

**Request body:**

```
{
  paymentId: string;
  items: {
    paymentItemId: string;
    refundCount: number;

  }[];

}
```

_Kaynak: `libs/payment-common/src/dto/refund-request.dto.ts`_

**Yanıt tipi:**

```
{
  id: string;
  paymentId: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  items: {
    id: string;
    realItemId: string;
    paymentItemId: string;
    refundCount: number;
    itemName?: string;
    unitAmount?: number;
    unitAmountWithoutTax?: number;
    refundAmount?: number;
    refundAmountWithoutTax?: number;
    refundTaxAmount?: number;
    variation?: string;

  }[];
  requestedByAccountId: undefined | string;
  resolvedByAccountId: undefined | string;
  createdAt: undefined | {
    getVarDate: () => VarDate;

  };
  updatedAt: undefined | Date;
  requestedByPaymentAccountId: undefined | string;
  requestedToPaymentAccountId: undefined | string;

}
```

_Kaynak: `libs/payment-common/src/dto/refund-request.dto.ts`_

---

### `POST` `api/refund/request/:id/approve`

**Metot adı:** `approveRefundRequest`

**Path parametreleri:**

| İsim | Tip |
|------|-----|
| `id` | `string` |

**Yanıt tipi:**

```
{
  id: string;
  paymentId: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  items: {
    id: string;
    realItemId: string;
    paymentItemId: string;
    refundCount: number;
    itemName?: string;
    unitAmount?: number;
    unitAmountWithoutTax?: number;
    refundAmount?: number;
    refundAmountWithoutTax?: number;
    refundTaxAmount?: number;
    variation?: string;

  }[];
  requestedByAccountId: undefined | string;
  resolvedByAccountId: undefined | string;
  createdAt: undefined | {
    getVarDate: () => VarDate;

  };
  updatedAt: undefined | Date;
  requestedByPaymentAccountId: undefined | string;
  requestedToPaymentAccountId: undefined | string;

}
```

_Kaynak: `libs/payment-common/src/dto/refund-request.dto.ts`_

---

### `POST` `api/refund/request/:id/reject`

**Metot adı:** `rejectRefundRequest`

**Path parametreleri:**

| İsim | Tip |
|------|-----|
| `id` | `string` |

**Yanıt tipi:**

```
{
  id: string;
  paymentId: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  items: {
    id: string;
    realItemId: string;
    paymentItemId: string;
    refundCount: number;
    itemName?: string;
    unitAmount?: number;
    unitAmountWithoutTax?: number;
    refundAmount?: number;
    refundAmountWithoutTax?: number;
    refundTaxAmount?: number;
    variation?: string;

  }[];
  requestedByAccountId: undefined | string;
  resolvedByAccountId: undefined | string;
  createdAt: undefined | {
    getVarDate: () => VarDate;

  };
  updatedAt: undefined | Date;
  requestedByPaymentAccountId: undefined | string;
  requestedToPaymentAccountId: undefined | string;

}
```

_Kaynak: `libs/payment-common/src/dto/refund-request.dto.ts`_

---

### `GET` `api/refund/request/_search`

**Metot adı:** `searchRefundRequests`

**Query parametreleri:**

| İsim | Tip |
|------|-----|
| `page` | `number` |
| `size` | `number` |
| `sortBy` | `string \| undefined` |
| `sortRotation` | `"desc" \| "asc" \| undefined` |
| `status` | `"PENDING" \| "APPROVED" \| "REJECTED" \| undefined` |
| `paymentId` | `string \| undefined` |
| `sellerAccountId` | `string \| undefined` |
| `mode` | `"USER" \| "ADMIN"` |

**Yanıt tipi:**

```
{
  content: RefundRequestDTO[];
  page: number;
  size: number;
  maxItemLength: number;
  maxPagesIndex: number;
  lastPage: boolean;
  firstPage: boolean;

}
```

_Kaynak: `search-result`_

---

### `GET` `api/refund/request/:id`

**Metot adı:** `getRefundRequestById`

**Path parametreleri:**

| İsim | Tip |
|------|-----|
| `id` | `string` |

**Yanıt tipi:**

```
{
  id: string;
  paymentId: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  items: {
    id: string;
    realItemId: string;
    paymentItemId: string;
    refundCount: number;
    itemName?: string;
    unitAmount?: number;
    unitAmountWithoutTax?: number;
    refundAmount?: number;
    refundAmountWithoutTax?: number;
    refundTaxAmount?: number;
    variation?: string;

  }[];
  requestedByAccountId: undefined | string;
  resolvedByAccountId: undefined | string;
  createdAt: undefined | {
    getVarDate: () => VarDate;

  };
  updatedAt: undefined | Date;
  requestedByPaymentAccountId: undefined | string;
  requestedToPaymentAccountId: undefined | string;

}
```

_Kaynak: `libs/payment-common/src/dto/refund-request.dto.ts`_

---

## ReportQueryController

### `GET` `api/report-query/:id/reports`

**Metot adı:** `getReports`

**Path parametreleri:**

| İsim | Tip |
|------|-----|
| `id` | `string` |

**Yanıt tipi:**

```
{
  id: string;
  queryId: string;
  periodLabel: string;
  currency: string;
  paymentCount: number;
  lastDigestedAt: string | Date | undefined;
  createdAt: string | Date | undefined;
  totalSaleAmount: number;
  totalRefundAmount: number;
  totalSaleTaxAmount: number;
  totalRefundTaxAmount: number;
  netTaxAmount: number;
  netSaleAmount: number;
  netRevenue: number;
  archived: boolean | undefined;
  totalExpenseAmount: number;
  totalSaleAmountWithoutExpense: number;
  reportType: import("/home/huseyin/dev/tk-ubs/postralmona/libs/payment-common/src/index").ReportType;
  totalExpense: number;
  netRevenueWithoutExpense: number;
  netRevenueWithoutExpenseTaxed: number;

}[]
```

_Kaynak: `libs/payment-common/src/dto/report.dto.ts`_

---

### `GET` `api/report-query/:id/reports/_search`

**Metot adı:** `searchReports`

**Path parametreleri:**

| İsim | Tip |
|------|-----|
| `id` | `string` |

**Query parametreleri:**

| İsim | Tip |
|------|-----|
| `page` | `number \| undefined` |
| `size` | `number \| undefined` |
| `hideArchived` | `string \| undefined` |

**Yanıt tipi:**

```
{
  content: import("/home/huseyin/dev/tk-ubs/postralmona/libs/payment-common/src/index").ReportDTO[];
  page: number;
  size: number;
  maxItemLength: number;
  maxPagesIndex: number;
  lastPage: boolean;
  firstPage: boolean;

}
```

_Kaynak: `search-result`_

---

### `GET` `api/report-query`

**Metot adı:** `fetchAll`

**Query parametreleri:**

| İsim | Tip |
|------|-----|
| `ownerAccountId` | `string \| undefined` |
| `admin` | `"true" \| "false"` |

**Yanıt tipi:**

```
{
  id: undefined | string;
  name: string;
  description: undefined | string;
  ownerAccountId: undefined | string;
  currency: undefined | string;
  dateGrouping: "ALL" | "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
  createdAt: undefined | string | {
    getVarDate: () => VarDate;

  };
  updatedAt: undefined | string | Date;
  reportType: "SELLER" | "PLATFORM_FLOW" | "PLATFORM_SELLER" | "PLATFORM";

}[]
```

_Kaynak: `libs/payment-common/src/dto/report-query.dto.ts`_

---

### `GET` `api/report-query/_search`

**Metot adı:** `search`

**Query parametreleri:**

| İsim | Tip |
|------|-----|
| `ownerAccountId` | `string \| undefined` |
| `admin` | `"true" \| "false"` |

**Yanıt tipi:**

```
{
  id: undefined | string;
  name: string;
  description: undefined | string;
  ownerAccountId: undefined | string;
  currency: undefined | string;
  dateGrouping: "ALL" | "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
  createdAt: undefined | string | {
    getVarDate: () => VarDate;

  };
  updatedAt: undefined | string | Date;
  reportType: "SELLER" | "PLATFORM_FLOW" | "PLATFORM_SELLER" | "PLATFORM";

}
```

_Kaynak: `libs/payment-common/src/dto/report-query.dto.ts`_

---

### `GET` `api/report-query/:id`

**Metot adı:** `fetchOne`

**Path parametreleri:**

| İsim | Tip |
|------|-----|
| `id` | `string` |

**Yanıt tipi:**

```
{
  id: undefined | string;
  name: string;
  description: undefined | string;
  ownerAccountId: undefined | string;
  currency: undefined | string;
  dateGrouping: "ALL" | "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
  createdAt: undefined | string | {
    getVarDate: () => VarDate;

  };
  updatedAt: undefined | string | Date;
  reportType: "SELLER" | "PLATFORM_FLOW" | "PLATFORM_SELLER" | "PLATFORM";

}
```

_Kaynak: `libs/payment-common/src/dto/report-query.dto.ts`_

---

### `POST` `api/report-query`

**Metot adı:** `add`

**Request body:**

```
{
  id: undefined | string;
  name: string;
  description: undefined | string;
  ownerAccountId: undefined | string;
  currency: undefined | string;
  dateGrouping: "ALL" | "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
  createdAt: undefined | string | {
    getVarDate: () => VarDate;

  };
  updatedAt: undefined | string | Date;
  reportType: "SELLER" | "PLATFORM_FLOW" | "PLATFORM_SELLER" | "PLATFORM";

}
```

_Kaynak: `libs/payment-common/src/dto/report-query.dto.ts`_

**Yanıt tipi:**

```
{
  id: undefined | string;
  name: string;
  description: undefined | string;
  ownerAccountId: undefined | string;
  currency: undefined | string;
  dateGrouping: "ALL" | "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
  createdAt: undefined | string | {
    getVarDate: () => VarDate;

  };
  updatedAt: undefined | string | Date;
  reportType: "SELLER" | "PLATFORM_FLOW" | "PLATFORM_SELLER" | "PLATFORM";

}
```

_Kaynak: `libs/payment-common/src/dto/report-query.dto.ts`_

---

### `PUT` `api/report-query`

**Metot adı:** `edit`

**Request body:**

```
{
  id: undefined | string;
  name: string;
  description: undefined | string;
  ownerAccountId: undefined | string;
  currency: undefined | string;
  dateGrouping: "ALL" | "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
  createdAt: undefined | string | {
    getVarDate: () => VarDate;

  };
  updatedAt: undefined | string | Date;
  reportType: "SELLER" | "PLATFORM_FLOW" | "PLATFORM_SELLER" | "PLATFORM";

}
```

_Kaynak: `libs/payment-common/src/dto/report-query.dto.ts`_

**Yanıt tipi:**

```
{
  id: undefined | string;
  name: string;
  description: undefined | string;
  ownerAccountId: undefined | string;
  currency: undefined | string;
  dateGrouping: "ALL" | "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
  createdAt: undefined | string | {
    getVarDate: () => VarDate;

  };
  updatedAt: undefined | string | Date;
  reportType: "SELLER" | "PLATFORM_FLOW" | "PLATFORM_SELLER" | "PLATFORM";

}
```

_Kaynak: `libs/payment-common/src/dto/report-query.dto.ts`_

---

### `DELETE` `api/report-query/:id`

**Metot adı:** `remove`

**Path parametreleri:**

| İsim | Tip |
|------|-----|
| `id` | `string` |

**Yanıt tipi:**

```
void
```

---

## AdminSettingsController

### `GET` `api/admin-settings`

**Metot adı:** `getAdminSettings`

**Yanıt tipi:**

```
{
  id: string;
  sellerPaysPaymentServiceFee: boolean;
  comissionsCalculatedFromNet: boolean;
  comissionItemTaxId: undefined | string;
  billingAccountId: undefined | string;
  billingDays: undefined | number[];
  createdAt: {
    getVarDate: () => VarDate;

  };
  updatedAt: Date;
  comissionItemTax: undefined | {
    id: string;
    taxName: string;
    variations: import("/home/huseyin/dev/tk-ubs/postralmona/libs/payment-common/src/index").ItemTaxVariationDTO[];
    entityOwnershipGroupId: string | undefined;
    isPublic: boolean;

  };

}
```

_Kaynak: `libs/payment-common/src/dto/admin-settings.dto.ts`_

---

### `PUT` `api/admin-settings`

**Metot adı:** `updateAdminSettings`

**Request body:**

```
{
  id: undefined | string;
  sellerPaysPaymentServiceFee: undefined | false | true;
  comissionsCalculatedFromNet: undefined | false | true;
  comissionItemTaxId: undefined | string;
  comissionItemTax: undefined | {
    id: string;
    taxName: string;
    isPublic: boolean;
    variations: import("/home/huseyin/dev/tk-ubs/postralmona/libs/postral-entities/src/index").ItemTaxVariation[];

  };
  billingAccountId: undefined | string;
  billingAccount: undefined | {
    id: string;
    name: string;
    legalIdentity: string;
    type: "INDIVIDUAL" | "COMMERCIAL";
    defaultAddressId: undefined | string;
    defaultAddress: undefined | {
      id: string;
      name: string;
      buildingNumber: string | undefined;
      buildingName: string | undefined;
      room: string | undefined;
      floor: string | undefined;
      blockName: string | undefined;
      streetName: string;
      additionalStreetName: string | undefined;
      district: string | undefined;
      citySubdivisionName: string;
      cityName: string;
      postalZone: string;
      region: string | undefined;
      postbox: string | undefined;
      country: string;
      countrySubentity: string | undefined;
      countrySubentityCode: string | undefined;
      addressFormatCode: string | undefined;
      addressTypeCode: string | undefined;
      department: string | undefined;
      markAttention: string | undefined;
      markCare: string | undefined;
      plotIdentification: string | undefined;
      cityCode: string | undefined;
      inhaleName: string | undefined;
      timezone: string | undefined;

    };
    deactivated: boolean;
    bankName: undefined | string;
    bankIban: undefined | string;
    bankBic: undefined | string;
    bankSwift: undefined | string;
    taxOffice: undefined | string;

  };
  billingDays: undefined | number[];
  createdAt: undefined | {
    getVarDate: () => VarDate;

  };
  updatedAt: undefined | Date;

}
```

_Kaynak: `../../../../../node_modules/typescript/lib/lib.es5.d.ts`_

**Yanıt tipi:**

```
{
  id: string;
  sellerPaysPaymentServiceFee: boolean;
  comissionsCalculatedFromNet: boolean;
  comissionItemTaxId: undefined | string;
  billingAccountId: undefined | string;
  billingDays: undefined | number[];
  createdAt: {
    getVarDate: () => VarDate;

  };
  updatedAt: Date;
  comissionItemTax: undefined | {
    id: string;
    taxName: string;
    variations: import("/home/huseyin/dev/tk-ubs/postralmona/libs/payment-common/src/index").ItemTaxVariationDTO[];
    entityOwnershipGroupId: string | undefined;
    isPublic: boolean;

  };

}
```

_Kaynak: `libs/payment-common/src/dto/admin-settings.dto.ts`_

---

## AdminOperationsController

### `POST` `api/admin-operations/encrypt-sensitive-data`

**Metot adı:** `encryptSensitiveData`

**Yanıt tipi:**

```
void
```

---

### `POST` `api/admin-operations/decrypt-sensitive-data`

**Metot adı:** `decryptSensitiveData`

**Yanıt tipi:**

```
void
```

---

### `POST` `api/admin-operations/run-billing`

**Metot adı:** `runBilling`

> Tüm satıcılar için faturalanmamış günlük raporları toplayıp
> komisyon ve hakediş fatura payment'larını oluşturur.
> Admin panelinden manuel tetiklemek için kullanılır.

**Yanıt tipi:**

```
void
```

---

## WebhookConfigController

### `GET` `api/webhook-config`

**Metot adı:** `getByAccountId`

**Query parametreleri:**

| İsim | Tip |
|------|-----|
| `accountId` | `string` |

**Yanıt tipi:**

```
{
  id: string;
  accountId: string;
  url: string;
  method: "POST" | "PUT";
  eventKey: string;
  isEnabled: boolean;
  createdAt: {
    getVarDate: () => VarDate;

  };
  updatedAt: Date;

}
```

_Kaynak: `libs/payment-common/src/dto/webhook-config.dto.ts`_

---

### `POST` `api/webhook-config`

**Metot adı:** `create`

**Request body:**

```
{
  accountId: string;
  url: string;
  method: undefined | "POST" | "PUT";
  eventKey: undefined | string;

}
```

_Kaynak: `libs/payment-common/src/dto/webhook-config.dto.ts`_

**Yanıt tipi:**

```
{
  id: string;
  accountId: string;
  url: string;
  method: "POST" | "PUT";
  eventKey: string;
  isEnabled: boolean;
  createdAt: {
    getVarDate: () => VarDate;

  };
  updatedAt: Date;

}
```

_Kaynak: `libs/payment-common/src/dto/webhook-config.dto.ts`_

---

### `PUT` `api/webhook-config/:id`

**Metot adı:** `update`

**Path parametreleri:**

| İsim | Tip |
|------|-----|
| `id` | `string` |

**Request body:**

```
{
  url: undefined | string;
  method: undefined | "POST" | "PUT";
  eventKey: undefined | string;
  isEnabled: undefined | false | true;

}
```

_Kaynak: `libs/payment-common/src/dto/webhook-config.dto.ts`_

**Yanıt tipi:**

```
{
  id: string;
  accountId: string;
  url: string;
  method: "POST" | "PUT";
  eventKey: string;
  isEnabled: boolean;
  createdAt: {
    getVarDate: () => VarDate;

  };
  updatedAt: Date;

}
```

_Kaynak: `libs/payment-common/src/dto/webhook-config.dto.ts`_

---

### `DELETE` `api/webhook-config/:id`

**Metot adı:** `delete`

**Path parametreleri:**

| İsim | Tip |
|------|-----|
| `id` | `string` |

**Yanıt tipi:**

```
void
```

---
