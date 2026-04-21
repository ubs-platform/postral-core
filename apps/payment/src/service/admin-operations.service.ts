import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Account, Address, InvoiceAccount, InvoiceAddress } from "../entity";
import { Repository } from "typeorm";
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
            (account as any)[field as string] = this.transform(account[field as string], encrypt);
        } 
        return account;
    }

    private transformAddressFields<T extends Record<string, any>>(address: T, encrypt: boolean): T {
        for (const field of ADDRESS_SENSITIVE_FIELDS) {
            (address as any)[field as string] = this.transform(address[field as string], encrypt);
        }
        return address;
    }

    private async processInBatches<T extends Record<string, any>>(
        repository: Repository<T>,
        transformFields: (entity: T, encrypt: boolean) => T,
        encrypt: boolean,
        batchSize = 500,
    ): Promise<void> {
        let skip = 0;

        while (true) {
            const batch = await repository.find({
                take: batchSize,
                skip,
            });

            if (batch.length === 0) {
                break;
            }

            await repository.save(batch.map(entity => transformFields(entity, encrypt)));
            skip += batch.length;
        }
    }

    async changeAllSensitiveData(to: "ENCRYPTED" | "DECRYPTED") {
        const enabledBoolStr = process.env["POSTRAL_SENSITIVE_DATA_ENCRYPTION_ENABLED"];
        if (to === "ENCRYPTED" && enabledBoolStr !== "true") {
            throw new BadRequestException(`Encryption is not enabled in configuration.`);
        }
        // eğer false-decrypt ise, şifreli verileri çözmeye yönelik çalışma var demektir. o yüzden false-decrypt durumunda da decryption işlemi yapılabilir. ancak encrypt işlemi yapılamaz.
        if (to === "DECRYPTED" && enabledBoolStr !== "true" && enabledBoolStr !== "false-decrypt") {
            throw new BadRequestException(`Data is not encrypted according to configuration.`);
        }

        const continuingOps = await this.reportDigestionService.isBusy();
        if (continuingOps) {
            throw new BadRequestException(`Cannot change sensitive data while report digestion operations are in progress.`);
        }
        const encrypt = to === "ENCRYPTED";

        await this.processInBatches(this.accountRepository, (a, shouldEncrypt) => this.transformAccountFields(a, shouldEncrypt), encrypt);
        await this.processInBatches(this.addressRepository, (a, shouldEncrypt) => this.transformAddressFields(a, shouldEncrypt), encrypt);
        await this.processInBatches(this.invoiceAccountRepository, (a, shouldEncrypt) => this.transformAccountFields(a, shouldEncrypt), encrypt);
        await this.processInBatches(this.invoiceAddressRepository, (a, shouldEncrypt) => this.transformAddressFields(a, shouldEncrypt), encrypt);
    }
}