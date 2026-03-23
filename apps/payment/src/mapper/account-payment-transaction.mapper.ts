import { Injectable } from "@nestjs/common";
import { AccountPaymentTransaction } from "../entity/account-payment-transaction.entity";
import { AccountPaymentTransactionDTO } from "@tk-postral/payment-common";
@Injectable()
export class AccountPaymentTransactionMapper {
    
  toDto(entity: AccountPaymentTransaction): AccountPaymentTransactionDTO {
    const dto = new AccountPaymentTransactionDTO();
    dto.id = entity.id;
    dto.corelationId = entity.corelationId;
    dto.accountId = entity.accountId;
    dto.accountName = entity.accountName;
    dto.paymentId = entity.paymentId;
    dto.paymentSellerOrderId = entity.paymentSellerOrderId;
    dto.type = entity.type;
    dto.status = entity.status;
    dto.amount = entity.amount;
    dto.taxAmount = entity.taxAmount;
    dto.creationDate = entity.creationDate;
    dto.updateDate = entity.updateDate;
    return dto;
  }

  toEntity(dto: AccountPaymentTransactionDTO): AccountPaymentTransaction {
    const entity = new AccountPaymentTransaction();
    return this.updateEntityFromDto(entity, dto);
  }

  updateEntityFromDto(entity: AccountPaymentTransaction, dto: AccountPaymentTransactionDTO): AccountPaymentTransaction {
    entity.corelationId = dto.corelationId;
    entity.accountId = dto.accountId;
    entity.accountName = dto.accountName;
    entity.paymentId = dto.paymentId;
    entity.paymentSellerOrderId = dto.paymentSellerOrderId;
    entity.type = dto.type;
    entity.status = dto.status;
    entity.amount = dto.amount;
    entity.taxAmount = dto.taxAmount;
    entity.operationNote = dto.operationNote;
    entity.description = dto.description;
    return entity;
  }
}