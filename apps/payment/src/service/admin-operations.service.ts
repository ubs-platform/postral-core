import { Injectable } from "@nestjs/common";
import { AccountService } from "./account.service";
import { AddressService } from "./address.service";
import { AdminSettingsService } from "./admin-settings.service";
import { InjectRepository } from "@nestjs/typeorm";
import { Account, Address, InvoiceAccount, InvoiceAddress } from "../entity";
import { Repository } from "typeorm/repository/Repository.js";
import { CryptionUtil } from "../util/cryption-util";
import { ReportDigestionService } from "./report-digestion.service";

const ACCOUNT_SENSITIVE_FIELDS: (keyof (Account & InvoiceAccount))[] = [
    'legalIdentity', 'bankIban', 'bankBic', 'taxOffice',
];

const ADDRESS_SENSITIVE_FIELDS: (keyof (Address & InvoiceAddress))[] = [
    'streetName', 'buildingNumber', 'cityName', 'postalZone', 'countrySubentity',
    'additionalStreetName', 'district', 'country', 'citySubdivisionName', 'floor',
    'room', 'postbox', 'region', 'blockName', 'buildingName', 'timezone',
    'plotIdentification', 'markCare', 'markAttention', 'inhaleName',
    'addressFormatCode', 'addressTypeCode', 'cityCode', 'countrySubentityCode', 'department',
];

@Injectable()
export class AdminOperationsService {

    constructor(
        @InjectRepository(Account) private accountRepository: Repository<Account>,
        @InjectRepository(Address) private addressRepository: Repository<Address>,
        @InjectRepository(InvoiceAddress) private invoiceAddressRepository: Repository<InvoiceAddress>,
        @InjectRepository(InvoiceAccount) private invoiceAccountRepository: Repository<InvoiceAccount>,
        private cryptUtil: CryptionUtil,
        private reportDigestionService: ReportDigestionService
    ) { }

    private transform(value: string | null | undefined, encrypt: boolean): string | null | undefined {
        if (value == null) return value;
        return encrypt
            ? this.cryptUtil.encryptWithConfig(value, "USE_DEFAULT")
            : this.cryptUtil.decryptWithConfig(value, "USE_DEFAULT");
    }

    private transformAccountFields<T extends Record<string, any>>(account: T, encrypt: boolean): T {
        for (const field of ACCOUNT_SENSITIVE_FIELDS) {
            account[field as string] = this.transform(account[field as string], encrypt);
        }
        return account;
    }

    private transformAddressFields<T extends Record<string, any>>(address: T, encrypt: boolean): T {
        for (const field of ADDRESS_SENSITIVE_FIELDS) {
            address[field as string] = this.transform(address[field as string], encrypt);
        }
        return address;
    }

    async changeAllSensitiveData(to: "ENCRYPTED" | "DECRYPTED") {
        const continuingOps = await this.reportDigestionService.isBusy();
        if (continuingOps) {
            throw new Error(`Cannot change sensitive data while report digestion operations are in progress.`);
        }
        const encrypt = to === "ENCRYPTED";
        const [accounts, addresses, invoiceAccounts, invoiceAddresses] = await Promise.all([
            this.accountRepository.find(),
            this.addressRepository.find(),
            this.invoiceAccountRepository.find(),
            this.invoiceAddressRepository.find(),
        ]);

        await Promise.all([
            this.accountRepository.save(accounts.map(a => this.transformAccountFields(a, encrypt))),
            this.addressRepository.save(addresses.map(a => this.transformAddressFields(a, encrypt))),
            this.invoiceAccountRepository.save(invoiceAccounts.map(a => this.transformAccountFields(a, encrypt))),
            this.invoiceAddressRepository.save(invoiceAddresses.map(a => this.transformAddressFields(a, encrypt))),
        ]);
    }
}