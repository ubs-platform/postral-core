import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
    Account,
    Address,
    Invoice,
    InvoiceAccount,
    InvoiceAccountLegacy,
    InvoiceAddress,
    InvoiceAddressLegacy,
    Payment,
    SellerPaymentOrder,
} from "@tk-postral/postral-entities";
import { In, IsNull, Not, Repository } from "typeorm";

@Injectable()
export class V2MigrationUtil {
    // Add your utility methods here
    // TODO: Paymentlar hala gerçek Account ve Address ile ilişkili. Bu yüzden Paymentları da migrate etmemiz gerekiyor. 
    constructor(

        @InjectRepository(InvoiceAddress)
        private readonly snapshotAddressRepository: Repository<InvoiceAddress>,
        @InjectRepository(InvoiceAccount)
        private readonly snapshotAccountRepository: Repository<InvoiceAccount>,

        @InjectRepository(InvoiceAddressLegacy)
        private readonly invoiceAddressLegacyRepository: Repository<InvoiceAddressLegacy>,

        @InjectRepository(InvoiceAccountLegacy)
        private readonly invoiceAccountLegacyRepository: Repository<InvoiceAccountLegacy>,

        @InjectRepository(Invoice)
        private readonly invoiceRepository: Repository<Invoice>,

        @InjectRepository(Payment)
        private readonly paymentRepository: Repository<Payment>,

        @InjectRepository(SellerPaymentOrder)
        private readonly sellerPaymentOrderRepository: Repository<SellerPaymentOrder>,

        @InjectRepository(Account)
        private readonly accountRepository: Repository<Account>,

        @InjectRepository(Address)
        private readonly addressRepository: Repository<Address>,
    ) {
        console.warn("DİKKAT: V2 Geçişleri başlatılacak. Ancak bir sonraki Minör sürümde bu geçiş işlemleri kaldırılacaktır.")
        console.log("V2MigrationUtil başlatıldı. Migration işlemleri başlatılıyor...");
        Promise.all([
            this.migrateSnapshotAddresses(),
            this.migrateSnapshotAccounts(),
        ]).then(() =>
            this.migrateInvoices()
        ).then(() => this.migratePayments()).then(() =>
            // Legacy tabloları ancak invoice FK'ları taşındıktan sonra temizliyoruz;
            // OneToOne cascade nedeniyle önce silinirse invoice id'leri de siliniyordu.
            this.cleanupLegacyTables()
        ).then(() => {
            console.log("Migration işlemleri tamamlandı.");
        }).catch((error) => {
            console.error("Migration işlemleri sırasında bir hata oluştu:", error);
        });
    }


    async migrateSnapshotAddresses() {
        const legacyInvoiceAddresses = await this.invoiceAddressLegacyRepository.find();
        await this.snapshotAddressRepository.save(legacyInvoiceAddresses.map(oldSnapshotAddress => {
            const snapshotAddress = new InvoiceAddress();
            snapshotAddress.id = oldSnapshotAddress.id;
            snapshotAddress.name = oldSnapshotAddress.name;
            snapshotAddress.country = oldSnapshotAddress.country;
            snapshotAddress.countrySubentity = oldSnapshotAddress.countrySubentity;
            snapshotAddress.countrySubentityCode = oldSnapshotAddress.countrySubentityCode;
            snapshotAddress.addressFormatCode = oldSnapshotAddress.addressFormatCode;
            snapshotAddress.addressTypeCode = oldSnapshotAddress.addressTypeCode;
            snapshotAddress.department = oldSnapshotAddress.department;
            snapshotAddress.markAttention = oldSnapshotAddress.markAttention;
            snapshotAddress.markCare = oldSnapshotAddress.markCare;
            snapshotAddress.plotIdentification = oldSnapshotAddress.plotIdentification;
            snapshotAddress.cityCode = oldSnapshotAddress.cityCode;
            snapshotAddress.inhaleName = oldSnapshotAddress.inhaleName;
            snapshotAddress.timezone = oldSnapshotAddress.timezone;
            snapshotAddress.buildingNumber = oldSnapshotAddress.buildingNumber;
            snapshotAddress.buildingName = oldSnapshotAddress.buildingName;
            snapshotAddress.room = oldSnapshotAddress.room;
            snapshotAddress.floor = oldSnapshotAddress.floor;
            snapshotAddress.blockName = oldSnapshotAddress.blockName;
            snapshotAddress.streetName = oldSnapshotAddress.streetName;
            snapshotAddress.additionalStreetName = oldSnapshotAddress.additionalStreetName;
            snapshotAddress.district = oldSnapshotAddress.district;
            snapshotAddress.citySubdivisionName = oldSnapshotAddress.citySubdivisionName;
            snapshotAddress.cityName = oldSnapshotAddress.cityName;
            snapshotAddress.postalZone = oldSnapshotAddress.postalZone;
            snapshotAddress.region = oldSnapshotAddress.region;
            snapshotAddress.postbox = oldSnapshotAddress.postbox;
            return snapshotAddress;
        }));
    }

    async migrateSnapshotAccounts() {
        const snapshotAccounts = await this.invoiceAccountLegacyRepository.find();
        await this.snapshotAccountRepository.save(snapshotAccounts.map(oldSnapshotAccount => {
            const snapshotAccount = new InvoiceAccount();
            snapshotAccount.id = oldSnapshotAccount.id;
            snapshotAccount.realAccountId = oldSnapshotAccount.realAccountId;
            snapshotAccount.phone = oldSnapshotAccount.phone;
            snapshotAccount.website = oldSnapshotAccount.website;
            snapshotAccount.emailAddress = oldSnapshotAccount.emailAddress;
            snapshotAccount.name = oldSnapshotAccount.name;
            snapshotAccount.legalIdentity = oldSnapshotAccount.legalIdentity;
            snapshotAccount.phone = oldSnapshotAccount.phone;
            snapshotAccount.website = oldSnapshotAccount.website;
            snapshotAccount.emailAddress = oldSnapshotAccount.emailAddress;
            snapshotAccount.type = oldSnapshotAccount.type;
            snapshotAccount.bankName = oldSnapshotAccount.bankName;
            snapshotAccount.bankIban = oldSnapshotAccount.bankIban;
            snapshotAccount.bankBic = oldSnapshotAccount.bankBic;
            snapshotAccount.bankSwift = oldSnapshotAccount.bankSwift;
            snapshotAccount.taxOffice = oldSnapshotAccount.taxOffice;
            return snapshotAccount;
        }));
    }


    async migrateInvoices() {
        const invoices = await this.invoiceRepository.find({
            where: [
                { sellerInvoiceAccountId: Not(IsNull()) as any },
                { sellerInvoiceAddressId: Not(IsNull()) as any },
                { customerAccountId: Not(IsNull()) as any },
                { customerInvoiceAddressId: Not(IsNull()) as any }
            ]
        });
        await this.invoiceRepository.save(invoices.map(invoice => {
            // FK kolonlarını doğrudan set ediyoruz; ilişki nesnesi + eager @Column
            // birlikte tanımlı olduğundan sadece ilişkiyi set etmek FK'yı null bırakıyordu.
            invoice.sellerSnapshotAccountId = invoice.sellerInvoiceAccountId;
            invoice.sellerSnapshotAddressId = invoice.sellerInvoiceAddressId;
            invoice.customerSnapshotAccountId = invoice.customerAccountId;
            invoice.customerSnapshotAddressId = invoice.customerInvoiceAddressId;

            invoice.sellerInvoiceAccountId = undefined;
            invoice.sellerInvoiceAddressId = undefined;
            invoice.customerAccountId = undefined;
            invoice.customerInvoiceAddressId = undefined;
            return invoice;
        }));
    }

    async cleanupLegacyTables() {
        console.warn(
            "Legacy veriler silinmedi. Eski kayıtları 'invoice_address_legacy' ve " +
            "'invoice_account_legacy' tablolarından inceleyebilirsiniz."
        );
    }

    async migratePayments() {
        const payments = await this.paymentRepository.find({
            where: [
                { customerSnapshotAccountId: IsNull() as any },
                { customerSnapshotAddressId: IsNull() as any },
                { items: { sellerSnapshotAccountId: IsNull() as any } },
                { items: { sellerSnapshotAddressId: IsNull() as any } }
            ],
            relations: ['items', 'items.sellerAccount'],
        });

        const paymentsWillBeUpdated: Payment[] = [];

        for (const payment of payments) {
            let saveFlag = false;

            if (!payment.customerSnapshotAccountId && payment.customerAccountId) {
                const snapshotAccount = await this.getAccountSnapshot(payment.customerAccountId);
                if (snapshotAccount) {
                    payment.customerSnapshotAccountId = snapshotAccount.id;
                    saveFlag = true;
                }
            }

            if (!payment.customerSnapshotAddressId && payment.billingAddressId) {
                const snapshotAddress = await this.getAddressSnapshot(payment.billingAddressId);
                if (snapshotAddress) {
                    payment.customerSnapshotAddressId = snapshotAddress.id;
                    saveFlag = true;
                }
            }

            for (const item of payment.items ?? []) {
                if (!item.sellerSnapshotAccountId && item.sellerAccountId) {
                    const snapshotAccount = await this.getAccountSnapshot(item.sellerAccountId);
                    if (snapshotAccount) {
                        item.sellerSnapshotAccountId = snapshotAccount.id;
                        saveFlag = true;
                    }
                }

                if (!item.sellerSnapshotAddressId) {
                    const sellerDefaultAddressId = item.sellerAccount?.defaultAddressId ?? item.sellerAccountId
                        ? (await this.accountRepository.findOneBy({ id: item.sellerAccountId! }))?.defaultAddressId
                        : undefined;

                    if (sellerDefaultAddressId) {
                        const snapshotAddress = await this.getAddressSnapshot(sellerDefaultAddressId);
                        if (snapshotAddress) {
                            item.sellerSnapshotAddressId = snapshotAddress.id;
                            saveFlag = true;
                        }
                    }
                }
            }

            if (payment.customerSnapshotAccountId && payment.customerAccountId) {
                payment.customerAccountId = undefined;
                saveFlag = true;
            }

            if (payment.customerSnapshotAddressId && payment.billingAddressId) {
                payment.billingAddressId = undefined;
                saveFlag = true;
            }

            if (saveFlag) {
                console.info(`Payment ${payment.id} güncellenecek. Snapshot Account ve Address bilgileri eklendi.`);
                paymentsWillBeUpdated.push(payment);
            } else {
                console.warn(`Payment ${payment.id} güncellenemedi. customerAccountId=${payment.customerAccountId ?? 'null'}, billingAddressId=${payment.billingAddressId ?? 'null'}, customerSnapshotAccountId=${payment.customerSnapshotAccountId ?? 'null'}, customerSnapshotAddressId=${payment.customerSnapshotAddressId ?? 'null'}, itemCount=${payment.items?.length ?? 0}`);
            }
        }

        const updatedPayments = await this.paymentRepository.save(paymentsWillBeUpdated);
        const updatedPaymentIds = updatedPayments.map((p) => p.id);

        const sellerOrders = await this.sellerPaymentOrderRepository.find({
            where: [
                { customerSnapshotAccountId: IsNull() as any },
                { customerSnapshotAddressId: IsNull() as any },
                { sellerSnapshotAccountId: IsNull() as any },
                { sellerSnapshotAddressId: IsNull() as any }
            ],
            relations: ['sourceAccount', 'targetAccount'],
        });

        const sellerOrdersWillBeUpdated: SellerPaymentOrder[] = [];

        for (const order of sellerOrders) {
            let saveFlag = false;

            if (!order.customerSnapshotAccountId) {
                const customerRealAccountId = order.sourceAccountId ?? order.targetAccountId;
                const snapshotAccount = customerRealAccountId ? await this.getAccountSnapshot(customerRealAccountId) : undefined;
                if (snapshotAccount) {
                    order.customerSnapshotAccountId = snapshotAccount.id;
                    saveFlag = true;
                }
            }

            if (!order.customerSnapshotAddressId) {
                const customerRealAddressId = order.billingAddressId ?? (await this.accountRepository.findOneBy({ id: order.sourceAccountId ?? order.targetAccountId }))?.defaultAddressId;
                const snapshotAddress = customerRealAddressId ? await this.getAddressSnapshot(customerRealAddressId) : undefined;
                if (snapshotAddress) {
                    order.customerSnapshotAddressId = snapshotAddress.id;
                    saveFlag = true;
                }
            }

            if (!order.sellerSnapshotAccountId) {
                const sellerRealAccountId = order.targetAccountId ?? order.sourceAccountId;
                const snapshotAccount = sellerRealAccountId ? await this.getAccountSnapshot(sellerRealAccountId) : undefined;
                if (snapshotAccount) {
                    order.sellerSnapshotAccountId = snapshotAccount.id;
                    saveFlag = true;
                }
            }

            if (!order.sellerSnapshotAddressId) {
                const sellerAccount = await this.accountRepository.findOneBy({ id: order.targetAccountId ?? order.sourceAccountId });
                const sellerDefaultAddressId = sellerAccount?.defaultAddressId ?? order.billingAddressId;
                const snapshotAddress = sellerDefaultAddressId ? await this.getAddressSnapshot(sellerDefaultAddressId) : undefined;
                if (snapshotAddress) {
                    order.sellerSnapshotAddressId = snapshotAddress.id;
                    saveFlag = true;
                }
            }

            if (saveFlag) {
                sellerOrdersWillBeUpdated.push(order);
                console.info(`SellerPaymentOrder ${order.id} güncellenecek. Snapshot Account ve Address bilgileri eklendi.`);
            } else {
                console.warn(`SellerPaymentOrder ${order.id} güncellenemedi. paymentId=${order.paymentId}, sourceAccountId=${order.sourceAccountId ?? 'null'}, targetAccountId=${order.targetAccountId ?? 'null'}, sellerSnapshotAccountId=${order.sellerSnapshotAccountId ?? 'null'}, sellerSnapshotAddressId=${order.sellerSnapshotAddressId ?? 'null'}, customerSnapshotAccountId=${order.customerSnapshotAccountId ?? 'null'}, customerSnapshotAddressId=${order.customerSnapshotAddressId ?? 'null'}`);
            }
        }

        await this.sellerPaymentOrderRepository.save(sellerOrdersWillBeUpdated);
    }

    private async getAccountSnapshot(realAccountId: string | undefined) {
        if (!realAccountId) {
            return undefined;
        }

        try {
            const customerAccount = await this.accountRepository.findOne({
                where: { id: realAccountId },
                loadEagerRelations: true,
            });

            if (!customerAccount) {
                console.warn(`SnapshotAccount oluşturulamadı: account bulunamadı. accountId=${realAccountId}`);
                return undefined;
            }

            const snapshotAccount = new InvoiceAccount();
            snapshotAccount.realAccountId = customerAccount.id;
            snapshotAccount.name = customerAccount.name || "";
            snapshotAccount.legalIdentity = customerAccount.legalIdentity || "";
            snapshotAccount.phone = customerAccount.phone || "";
            snapshotAccount.website = customerAccount.website || "";
            snapshotAccount.emailAddress = customerAccount.emailAddress || "";
            snapshotAccount.type = customerAccount.type || "";
            snapshotAccount.bankName = customerAccount.bankName || "";
            snapshotAccount.bankIban = customerAccount.bankIban || "";
            snapshotAccount.bankBic = customerAccount.bankBic || "";
            snapshotAccount.bankSwift = customerAccount.bankSwift || "";
            snapshotAccount.taxOffice = customerAccount.taxOffice || "";
            return await this.snapshotAccountRepository.save(snapshotAccount);
        } catch (error) {
            console.warn(`SnapshotAccount oluşturulamadı. accountId=${realAccountId}`, error);
            return undefined;
        }
    }

    private async getAddressSnapshot(realAddressId: string | undefined) {
        if (!realAddressId) {
            return undefined;
        }

        try {
            const customerAddress = await this.addressRepository.findOne({
                where: { id: realAddressId }
            });

            if (!customerAddress) {
                console.warn(`SnapshotAddress oluşturulamadı: address bulunamadı. addressId=${realAddressId}`);
                return undefined;
            }

            const snapshotAddress = new InvoiceAddress();
            snapshotAddress.realAddressId = customerAddress.id || "";
            snapshotAddress.name = customerAddress.name || "";
            snapshotAddress.country = customerAddress.country || "";
            snapshotAddress.countrySubentity = customerAddress.countrySubentity || "";
            snapshotAddress.countrySubentityCode = customerAddress.countrySubentityCode || "";
            snapshotAddress.addressFormatCode = customerAddress.addressFormatCode || "";
            snapshotAddress.addressTypeCode = customerAddress.addressTypeCode || "";
            snapshotAddress.department = customerAddress.department || "";
            snapshotAddress.markAttention = customerAddress.markAttention || "";
            snapshotAddress.markCare = customerAddress.markCare || "";
            snapshotAddress.plotIdentification = customerAddress.plotIdentification || "";
            snapshotAddress.cityCode = customerAddress.cityCode || "";
            snapshotAddress.inhaleName = customerAddress.inhaleName || "";
            snapshotAddress.timezone = customerAddress.timezone || "";
            snapshotAddress.buildingNumber = customerAddress.buildingNumber || "";
            snapshotAddress.buildingName = customerAddress.buildingName || "";
            snapshotAddress.room = customerAddress.room || "";
            snapshotAddress.floor = customerAddress.floor || "";
            snapshotAddress.blockName = customerAddress.blockName || "";
            snapshotAddress.streetName = customerAddress.streetName || "";
            snapshotAddress.additionalStreetName = customerAddress.additionalStreetName || "";
            snapshotAddress.district = customerAddress.district || "";
            snapshotAddress.citySubdivisionName = customerAddress.citySubdivisionName || "";
            snapshotAddress.cityName = customerAddress.cityName || "";
            snapshotAddress.postalZone = customerAddress.postalZone || "";
            snapshotAddress.region = customerAddress.region || "";
            snapshotAddress.postbox = customerAddress.postbox || "";
            return await this.snapshotAddressRepository.save(snapshotAddress);
        } catch (error) {
            console.warn(`SnapshotAddress oluşturulamadı. addressId=${realAddressId}`, error);
            return undefined;
        }
    }
}