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
        ).then(() => {
            console.log("Migration işlemleri tamamlandı.");
        }).catch((error) => {
            console.error("Migration işlemleri sırasında bir hata oluştu:", error);
        });
    }


    async migrateSnapshotAddresses() {
        const legacyInvoiceAddresses = await this.invoiceAddressLegacyRepository.find();
        const deletebatch: string[] = [];
        await this.snapshotAddressRepository.save(legacyInvoiceAddresses.map(oldSnapshotAddress => {
            const snapshotAddress = new SnapshotAddress();
            snapshotAddress.id = oldSnapshotAddress.id;
            snapshotAddress.name = oldSnapshotAddress.name;
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
            deletebatch.push(oldSnapshotAddress.id);
            return snapshotAddress;
        }));
        if (deletebatch.length === 0) {
            return;
        }
        await this.invoiceAddressLegacyRepository.delete(deletebatch);

    }

    async migrateSnapshotAccounts() {
        const snapshotAccounts = await this.invoiceAccountLegacyRepository.find();
        const deletebatch: string[] = [];
        await this.snapshotAccountRepository.save(snapshotAccounts.map(oldSnapshotAccount => {
            const snapshotAccount = new SnapshotAccount();
            snapshotAccount.id = oldSnapshotAccount.id;
            snapshotAccount.realAccountId = oldSnapshotAccount.realAccountId;
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
            deletebatch.push(oldSnapshotAccount.id);
            return snapshotAccount;
        }));
        if (deletebatch.length === 0) {
            return;
        }
        await this.invoiceAccountLegacyRepository.delete(deletebatch);
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
            invoice.sellerSnapshotAccount = { id: invoice.sellerInvoiceAccountId } as SnapshotAccount;
            invoice.sellerSnapshotAddress = { id: invoice.sellerInvoiceAddressId } as SnapshotAddress;
            invoice.customerSnapshotAccount = { id: invoice.customerAccountId } as SnapshotAccount;
            invoice.customerSnapshotAddress = { id: invoice.customerInvoiceAddressId } as SnapshotAddress;
            invoice.sellerInvoiceAccountId = undefined;
            invoice.sellerInvoiceAddressId = undefined;
            invoice.customerAccountId = undefined;
            invoice.customerInvoiceAddressId = undefined;
            return invoice;
        }));
    }
}