import { BadRequestException } from '@nestjs/common';
import type { PaymentFullWithCaptureInfoDTO } from '@tk-postral/payment-common';
import Big from 'big.js';
import { isIP } from 'node:net';

function required(value: string | undefined, field: string): string {
    if (!value?.trim()) {
        throw new BadRequestException(`iyzico requires ${field}`);
    }
    return value.trim();
}

export function checkoutMoney(value: number | string, field: string): string {
    if (!/^\d+(\.\d+)?$/.test(String(value))) {
        throw new BadRequestException(`Invalid iyzico ${field}`);
    }
    const amount = new Big(value);
    if (amount.lte(0) || !amount.eq(amount.round(2))) {
        throw new BadRequestException(
            `iyzico ${field} must be positive with at most two decimal places`,
        );
    }
    return amount.toFixed(2);
}

export function mapCheckout(
    payment: PaymentFullWithCaptureInfoDTO,
    operationId: string,
    callbackUrl: string,
) {
    console.info("Postral Payment:", payment);
    if (payment.type !== 'PURCHASE') {
        throw new BadRequestException('iyzico refunds are not implemented yet');
    }
    if (
        payment.openPayment ||
        payment.captureInfo?.paymentChannelId !== 'iyzico'
    ) {
        throw new BadRequestException(
            'Expected a closed-payment iyzico purchase',
        );
    }
    const amount = checkoutMoney(payment.totalAmount, 'totalAmount');
    if (
        checkoutMoney(payment.captureInfo.paidAmount ?? '', 'paidAmount') !==
            amount ||
        payment.captureInfo.currency !== payment.currency
    ) {
        throw new BadRequestException(
            'iyzico sandbox currently requires full-amount capture in the payment currency',
        );
    }
    if (
        !['TRY', 'EUR', 'USD', 'GBP', 'NOK', 'CHF'].includes(payment.currency)
    ) {
        throw new BadRequestException('Unsupported iyzico currency');
    }

    const account = payment.customerSnapshotAccount;
    const address = payment.customerSnapshotAddress;
    // TODO: ❗ Postral validation: a commercial account's tax ID is not a buyer's
    // identityNumber. Add a natural-person contact/identity contract before enabling it.
    if (account?.type !== 'INDIVIDUAL') {
        throw new BadRequestException(
            'iyzico sandbox requires an INDIVIDUAL customer snapshot; commercial buyer contact mapping is missing',
        );
    }
    // TODO: ❗ SnapshotAccountDTO has a single name, not separate given/family names.
    // Until explicit fields exist, two trailing uppercase words form a compound surname.
    const names = required(account.name, 'customerSnapshotAccount.name').split(
        /\s+/,
    );
    if (names.length < 2) {
        throw new BadRequestException(
            'iyzico requires a customer name and surname',
        );
    }
    const hasUppercaseCompoundSurname =
        names.length >= 3 &&
        names
            .slice(-2)
            .every(
                (word) =>
                    word === word.toLocaleUpperCase('tr-TR') &&
                    word !== word.toLocaleLowerCase('tr-TR'),
            );
    const surnameWordCount = hasUppercaseCompoundSurname ? 2 : 1;
    if (!isIP(payment.captureInfo.buyerIp ?? '')) {
        throw new BadRequestException(
            'iyzico requires captureInfo.buyerIp from the trusted HTTP request context',
        );
    }
    const street = required(
        address?.streetName,
        'customerSnapshotAddress.streetName',
    );
    const registrationAddress = [
        street,
        address?.buildingNumber,
        address?.room,
        address?.district,
        address?.citySubdivisionName,
    ]
        .filter(Boolean)
        .join(' ');
    const billingAddress = {
        contactName: account.name,
        city: required(address?.cityName, 'customerSnapshotAddress.cityName'),
        country: required(
            address?.countryReadName,
            'customerSnapshotAddress.countryReadName',
        ),
        address: registrationAddress,
        zipCode: address?.postalZone,
    };
    if (!payment.items?.length) {
        throw new BadRequestException(
            'iyzico requires at least one payment item',
        );
    }
    // TODO: ❗ All items are temporarily VIRTUAL. Map Postral's future isPhysical
    // field and shipping snapshot before supporting physical checkout.
    const basketItems = payment.items.map((item) => ({
        id: required(item.id, 'items[].id'),
        name: required(item.name, 'items[].name'),
        category1: 'Digital products',
        itemType: 'VIRTUAL' as const,
        price: checkoutMoney(item.totalAmount, 'items[].totalAmount'),
    }));
    if (
        new Set(basketItems.map((item) => item.id)).size !==
            basketItems.length ||
        !basketItems
            .reduce((sum, item) => sum.plus(item.price), new Big(0))
            .eq(amount)
    ) {
        throw new BadRequestException(
            'iyzico basket IDs must be unique and item totals must equal the capture amount',
        );
    }
    const iyzicoCheckoutRequest = {
        locale: 'tr',
        conversationId: operationId,
        basketId: required(payment.id, 'payment.id'),
        price: amount,
        paidPrice: amount,
        currency: payment.currency,
        paymentGroup: 'PRODUCT',
        callbackUrl,
        enabledInstallments: [1],
        buyer: {
            id: required(payment.customerAccountId, 'customerAccountId'),
            name: names.slice(0, -surnameWordCount).join(' '),
            surname: names.slice(-surnameWordCount).join(' '),
            email: required(
                account.emailAddress,
                'customerSnapshotAccount.emailAddress',
            ),
            gsmNumber: account.phone,
            identityNumber: required(
                account.legalIdentity,
                'customerSnapshotAccount.legalIdentity',
            ),
            registrationAddress,
            ip: payment.captureInfo.buyerIp,
            city: billingAddress.city,
            country: billingAddress.country,
            zipCode: billingAddress.zipCode,
        },
        billingAddress,
        basketItems,
    };
    console.log('iyzicoCheckoutRequest:', iyzicoCheckoutRequest);
    return iyzicoCheckoutRequest;
}
