import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SubMerchantSourceDTO } from '@tk-postral/payment-common';
import { Account } from '@tk-postral/postral-entities';
import { Repository } from 'typeorm';
import { AccountMapper } from '../mapper/account.mapper';
import { AddressMapper } from '../mapper/address.mapper';

@Injectable()
export class SubMerchantSourceService {
    constructor(
        @InjectRepository(Account)
        private readonly accounts: Repository<Account>,
        private readonly accountMapper: AccountMapper,
        private readonly addressMapper: AddressMapper,
    ) {}

    async findByAccountId(accountId: string): Promise<SubMerchantSourceDTO> {
        const account = await this.accounts.findOne({
            where: { id: accountId },
            relations: { bankAccounts: true, defaultAddress: true },
        });
        if (!account) {
            throw new NotFoundException('Account not found');
        }
        return {
            account: await this.accountMapper.toDto(account),
            defaultAddress: account.defaultAddress
                ? await this.addressMapper.toDto(account.defaultAddress)
                : undefined,
        };
    }
}
