import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SnapshotAddress } from "libs/postral-entities/src/entity/snapshot-address.entity";
import { SnapshotAccount } from "libs/postral-entities/src/entity/snapshot-account.entity";
import { InvoiceAccountLegacy } from "@tk-postral/postral-entities";
import { Invoice, InvoiceAccount, InvoiceAddressLegacy } from "@tk-postral/postral-entities";
import { IsNull, Not, Repository } from "typeorm";

@Injectable()
export class V2MigrationUtil {
    // Add your utility methods here

    constructor(

        @InjectRepository(SnapshotAddress)
        private readonly snapshotAddressRepository: Repository<SnapshotAddress>,
        @InjectRepository(SnapshotAccount)
        private readonly snapshotAccountRepository: Repository<SnapshotAccount>,

        @InjectRepository(InvoiceAddressLegacy)
        private readonly invoiceAddressLegacyRepository: Repository<InvoiceAddressLegacy>,

        @InjectRepository(InvoiceAccountLegacy)
        private readonly invoiceAccountLegacyRepository: Repository<InvoiceAccountLegacy>,

        @InjectRepository(Invoice)
        private readonly invoiceRepository: Repository<Invoice>,
    ) {

        console.log("V2MigrationUtil başlatıldı. Migration işlemleri başlatılıyor...");
        Promise.all([
            this.migrateSnapshotAddresses(),
            this.migrateSnapshotAccounts(),
        ]).then(() =>
            this.migrateInvoices()
        ).then(() =>
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
            const snapshotAddress = new SnapshotAddress();
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
            const snapshotAccount = new SnapshotAccount();
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
        await this.invoiceAddressLegacyRepository.delete({});
        await this.invoiceAccountLegacyRepository.delete({});
    }
}