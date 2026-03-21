import { Inject, Injectable } from "@nestjs/common";
import { AccountPaymentTransactionDTO, PaymentFullDTO, PaymentItemDto, PaymentTransactionDTO } from "@tk-postral/payment-common";
import { AccountPaymentTransaction } from "../entity";
import { AccountPaymentTransactionMapper } from "../mapper/account-payment-transaction.mapper";
import { Repository } from "typeorm/repository/Repository";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class AccountPaymentTransactionService {
    // This service will handle the business logic related to account payment transactions.
    // It will interact with the repository to perform CRUD operations and use the mapper to convert between entities and DTOs.

    constructor(
        @InjectRepository(AccountPaymentTransaction)
        public repo: Repository<AccountPaymentTransaction>,
        private readonly accountMapper: AccountPaymentTransactionMapper,
    ) {

    }

    async createNew(dto: AccountPaymentTransactionDTO): Promise<AccountPaymentTransactionDTO> {
        const entity = this.accountMapper.toEntity(dto);
        const savedEntity = await this.repo.save(entity);
        return this.accountMapper.toDto(savedEntity);
    }

    async updateByKeyFields(dto: AccountPaymentTransactionDTO): Promise<AccountPaymentTransactionDTO> {
        // Eğer idsi varsa idsini aratacak, yoksa accountId, paymentId alanlarına göre arama yapacak. Eğer kayıt bulunursa güncelleyecek, bulunmazsa hata verecek.

        let existingEntity;
        if (dto.id) {
            existingEntity = await this.repo.findOne({ where: { id: dto.id } });
        } else if (dto.accountId && dto.paymentId) {
            // TODO: Bu kısmı daha da geliştirilecek. TransactionIdsi alsak daha iyi bir şey olacak da bilemedim...
            existingEntity = await this.repo.findOne({
                where: {
                    accountId: dto.accountId,
                    paymentId: dto.paymentId,
                }
            });
        }

        if (!existingEntity) {
            throw new Error('AccountPaymentTransaction not found');
        }

        const updatedEntity = this.accountMapper.updateEntityFromDto(existingEntity, dto);
        const savedEntity = await this.repo.save(updatedEntity);
        return this.accountMapper.toDto(savedEntity);
    }


    async fromPayment(paymentReal: PaymentFullDTO) {
        const customerRotation = paymentReal.type == "PURCHASE" ? "DEBIT" : "CREDIT", sellerRotation = paymentReal.type == "PURCHASE" ? "CREDIT" : "DEBIT";

        // Müşteri
        const transactions: AccountPaymentTransactionDTO[] = [];
        const customerTransaction = new AccountPaymentTransactionDTO();
        customerTransaction.accountId = paymentReal.customerAccountId;
        customerTransaction.accountName = paymentReal.customerAccountName!;
        customerTransaction.amount = paymentReal.totalAmount;
        customerTransaction.taxAmount = paymentReal.taxAmount;
        customerTransaction.paymentId = paymentReal.id;
        customerTransaction.type = customerRotation;
        customerTransaction.status = paymentReal.paymentStatus;
        transactions.push(customerTransaction);


        // Customer için debit oluşturulacak.
        // const transactions: AccountPaymentTransactionDTO[] = [];
        // for (let index = 0; index < payment.items.length; index++) {
        //     const paymentItem = payment.items[index];
        //     const transaction = new AccountPaymentTransactionDTO();
        //     transaction.accountId = paymentItem.sellerAccountId;
        //     transaction.accountName = paymentItem.sellerAccountName;
        //     transaction.amount = paymentItem.totalAmount;
        //     transaction.taxAmount = paymentItem.taxAmount;
        //     transaction.paymentId = payment.id;
        //     transaction.type = "CREDIT";
        //     transaction.status = payment.paymentStatus;
        //     transactions.push(transaction);
        // }

        // await this.accountPaymentTransactionService.createNew(transactions[0]);
    }
}