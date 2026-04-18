import { Inject, Injectable } from "@nestjs/common";
import { AccountPaymentTransactionDTO, PaymentFullDTO, PaymentItemDto, PaymentTransactionDTO, SellerPaymentOrderDTO } from "@tk-postral/payment-common";
import { Account, AccountPaymentTransaction } from "../entity";
import { AccountPaymentTransactionMapper } from "../mapper/account-payment-transaction.mapper";
import { Repository } from "typeorm/repository/Repository";
import { InjectRepository } from "@nestjs/typeorm";
import { UUID } from "typeorm/driver/mongodb/bson.typings";
import { randomUUID } from "crypto";
import { AmountCalculationUtil } from "../util/calcs/amount-calculations";
import { TypeAssertionUtil } from "../util/type-assertion";
import { Or } from "typeorm";

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

    async createNew(...dtos: AccountPaymentTransactionDTO[]): Promise<AccountPaymentTransactionDTO[]> {
        await this.deleteOldTransactions(dtos);
        const entities = dtos.map(dto => this.accountMapper.toEntity(dto));
        const savedEntities = await this.repo.save(entities);
        return savedEntities.map(entity => this.accountMapper.toDto(entity));
    }

    /**
     * Eski transactionları siler. Eski transactionlar, aynı accountId, paymentId, type ve WAITING statusüne sahip olanlardır. 
     * Bu methodun amacı, aynı ödeme için yeni transactionlar oluşturulmadan önce, eski transactionların silinmesini sağlamaktır. 
     * Böylece, aynı ödeme için birden fazla transaction oluşmasının önüne geçilir.
     * @param dtos 
     */
    async deleteOldTransactions(dtos: AccountPaymentTransactionDTO[]) {
        const oldTransactions = await this.repo.find(
            {
                where: dtos.map(entity => {
                    return {
                        accountId: entity.accountId,
                        paymentId: entity.paymentId,
                        type: entity.type,
                        // TODO: Önceden failed olanlar da dahil olmasını istiyorum. Completed olanlar genelde değişmez, tabi kontrol etmekten de zarar gelmez. SOnradan eklenecek
                        // status: "WAITING"
                    };
                }),
            }
        )

        await this.repo.remove(oldTransactions);
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

        const transactions: AccountPaymentTransactionDTO[] = [];
        // Müşteri
        const korelasyon = randomUUID();


        // Customer için debit oluşturulacak.
        const transactionSellerNames = new Set();
        const transactionPerSellerAccountMap: Map<string, AccountPaymentTransactionDTO> = new Map();
        for (let index = 0; index < paymentReal.items.length; index++) {
            const paymentItem = paymentReal.items[index];
            let sellerTransaction = new AccountPaymentTransactionDTO();
            sellerTransaction.corelationId = korelasyon;
            if (transactionPerSellerAccountMap.has(paymentItem.sellerAccountId)) {
                sellerTransaction = transactionPerSellerAccountMap.get(paymentItem.sellerAccountId)!;
                sellerTransaction.amount = AmountCalculationUtil.addNumberValues(sellerTransaction.amount, paymentItem.totalAmount);
                sellerTransaction.taxAmount = AmountCalculationUtil.addNumberValues(sellerTransaction.taxAmount, paymentItem.taxAmount);
            } else {
                TypeAssertionUtil.assertIsNumber(paymentItem.totalAmount, "paymentItem totalAmount must be a number");
                TypeAssertionUtil.assertIsNumber(paymentItem.taxAmount, "paymentItem taxAmount must be a number");
                transactionSellerNames.add(paymentItem.sellerAccountName!);
                sellerTransaction.accountId = paymentItem.sellerAccountId;
                sellerTransaction.accountName = paymentItem.sellerAccountName!;
                sellerTransaction.amount = paymentItem.totalAmount;
                sellerTransaction.taxAmount = paymentItem.taxAmount;
                sellerTransaction.paymentId = paymentReal.id;
                sellerTransaction.type = sellerRotation;
                sellerTransaction.status = paymentReal.paymentStatus;
                sellerTransaction.description = `Payment ${paymentReal.type.toLowerCase()} for payment id ${paymentReal.id}. Customer: ${paymentReal.customerAccountName}`;
            }

            transactionPerSellerAccountMap.set(paymentItem.sellerAccountId, sellerTransaction);
        }
        transactions.push(...transactionPerSellerAccountMap.values());
        const customerTransaction = new AccountPaymentTransactionDTO();
        customerTransaction.corelationId = korelasyon;
        customerTransaction.accountId = paymentReal.customerAccountId;
        customerTransaction.accountName = paymentReal.customerAccountName!;
        customerTransaction.amount = paymentReal.totalAmount;
        customerTransaction.taxAmount = paymentReal.taxAmount;
        customerTransaction.paymentId = paymentReal.id;
        customerTransaction.type = customerRotation;
        customerTransaction.status = paymentReal.paymentStatus;
        customerTransaction.description = `Payment ${paymentReal.type.toLowerCase()} for payment id ${paymentReal.id}. Sellers: ${Array.from(transactionSellerNames).join(", ")}`;
        transactions.push(customerTransaction);

        return await this.createNew(...transactions);
    }
}