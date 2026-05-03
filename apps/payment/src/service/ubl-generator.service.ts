import { Injectable } from '@nestjs/common';
import { create } from 'xmlbuilder2';
import {
    InvoiceDTO,
    InvoiceAddressDto,
    InvoiceAccountDTO,
    PaymentItemDto,
} from '@tk-postral/payment-common';
import { PaymentItemSearchService } from './payment-item-search.service';
import { AmountCalculationUtil } from '../util/calcs/amount-calculations';

@Injectable()
export class UblGeneratorService {
    constructor(
        private readonly paymentItemSearchService: PaymentItemSearchService,
    ) {}

    async generateUblXml(invoice: InvoiceDTO): Promise<string> {
        let items: PaymentItemDto[] = [];
        if (invoice.paymentId && invoice.sellerInvoiceAccount?.realAccountId) {
            items = await this.paymentItemSearchService.findItemsByCriteria({
                paymentId: invoice.paymentId,
                sellerAccountId: invoice.sellerInvoiceAccount.realAccountId,
            });
        }

        const invoiceData = invoice as Record<string, unknown>;
        const paymentData =
            typeof invoiceData.payment === 'object' && invoiceData.payment !== null
                ? (invoiceData.payment as Record<string, unknown>)
                : undefined;
        const currencyCandidate =
            paymentData?.currency ??
            invoiceData.currency ??
            invoiceData.paymentCurrency;
        const currency =
            typeof currencyCandidate === 'string' &&
            currencyCandidate.trim().length > 0
                ? currencyCandidate.trim().toUpperCase()
                : 'TRY';
        const invoiceNumber = invoice.invoiceNumber || invoice.id;

        const totalUnTaxAmount = AmountCalculationUtil.addNumberValues(
            ...items.map(item => Number(item.unTaxAmount) || 0),
        );
        const totalTaxAmount = AmountCalculationUtil.addNumberValues(
            ...items.map(item => Number(item.taxAmount) || 0),
        );
        const totalAmount = AmountCalculationUtil.addNumberValues(
            ...items.map(item => Number(item.totalAmount) || 0),
        );

        const issueDate = invoice.invoiceDate
            ? new Date(invoice.invoiceDate).toISOString().slice(0, 10)
            : new Date().toISOString().slice(0, 10);

        const doc = create({ version: '1.0', encoding: 'UTF-8' });
        const root = doc.ele('Invoice', {
            xmlns: 'urn:oasis:names:specification:ubl:schema:xsd:Invoice-2',
            'xmlns:cbc':
                'urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2',
            'xmlns:cac':
                'urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2',
        });

        root.ele('cbc:UBLVersionID').txt('2.1');
        root.ele('cbc:CustomizationID').txt('urn:cen.eu:en16931:2017');
        root.ele('cbc:ID').txt(invoiceNumber);
        root.ele('cbc:IssueDate').txt(issueDate);
        root.ele('cbc:InvoiceTypeCode').txt('380');
        root.ele('cbc:DocumentCurrencyCode').txt(currency);
        if (invoice.notes) {
            root.ele('cbc:Note').txt(invoice.notes);
        }

        const supplierParty = root
            .ele('cac:AccountingSupplierParty')
            .ele('cac:Party');
        this.buildParty(
            supplierParty,
            invoice.sellerInvoiceAccount,
            invoice.sellerInvoiceAddress,
        );

        const customerParty = root
            .ele('cac:AccountingCustomerParty')
            .ele('cac:Party');
        this.buildParty(
            customerParty,
            invoice.customerAccount,
            invoice.customerInvoiceAddress,
        );

        const taxTotal = root.ele('cac:TaxTotal');
        taxTotal
            .ele('cbc:TaxAmount', { currencyID: currency })
            .txt(totalTaxAmount.toFixed(2));
        const taxGroups = this.groupByTaxPercent(items);
        for (const [percent, group] of Object.entries(taxGroups)) {
            const subtotal = taxTotal.ele('cac:TaxSubtotal');
            subtotal
                .ele('cbc:TaxableAmount', { currencyID: currency })
                .txt(group.taxableAmount.toFixed(2));
            subtotal
                .ele('cbc:TaxAmount', { currencyID: currency })
                .txt(group.taxAmount.toFixed(2));
            const taxCat = subtotal.ele('cac:TaxCategory');
            taxCat.ele('cbc:ID').txt('S');
            taxCat.ele('cbc:Percent').txt(percent);
            taxCat.ele('cac:TaxScheme').ele('cbc:ID').txt('VAT');
        }

        const monetaryTotal = root.ele('cac:LegalMonetaryTotal');
        monetaryTotal
            .ele('cbc:LineExtensionAmount', { currencyID: currency })
            .txt(totalUnTaxAmount.toFixed(2));
        monetaryTotal
            .ele('cbc:TaxExclusiveAmount', { currencyID: currency })
            .txt(totalUnTaxAmount.toFixed(2));
        monetaryTotal
            .ele('cbc:TaxInclusiveAmount', { currencyID: currency })
            .txt(totalAmount.toFixed(2));
        monetaryTotal
            .ele('cbc:PayableAmount', { currencyID: currency })
            .txt(totalAmount.toFixed(2));

        items.forEach((item, index) => {
            const line = root.ele('cac:InvoiceLine');
            line.ele('cbc:ID').txt((index + 1).toString());
            line.ele('cbc:InvoicedQuantity', {
                unitCode: item.unit || 'C62',
            }).txt(String(item.quantity ?? 1));
            line.ele('cbc:LineExtensionAmount', { currencyID: currency }).txt(
                (Number(item.unTaxAmount) || 0).toFixed(2),
            );

            const lineTaxTotal = line.ele('cac:TaxTotal');
            lineTaxTotal
                .ele('cbc:TaxAmount', { currencyID: currency })
                .txt((Number(item.taxAmount) || 0).toFixed(2));
            const lineTaxSubtotal = lineTaxTotal.ele('cac:TaxSubtotal');
            lineTaxSubtotal
                .ele('cbc:TaxableAmount', { currencyID: currency })
                .txt((Number(item.unTaxAmount) || 0).toFixed(2));
            lineTaxSubtotal
                .ele('cbc:TaxAmount', { currencyID: currency })
                .txt((Number(item.taxAmount) || 0).toFixed(2));
            const lineTaxCat = lineTaxSubtotal.ele('cac:TaxCategory');
            lineTaxCat.ele('cbc:ID').txt('S');
            lineTaxCat.ele('cbc:Percent').txt(String(item.taxPercent ?? 0));
            lineTaxCat.ele('cac:TaxScheme').ele('cbc:ID').txt('VAT');

            const itemEle = line.ele('cac:Item');
            itemEle.ele('cbc:Name').txt(item.name || '');
            if (item.entityName) {
                itemEle.ele('cbc:Description').txt(item.entityName);
            }

            line.ele('cac:Price')
                .ele('cbc:PriceAmount', { currencyID: currency })
                .txt((Number(item.unitAmount) || 0).toFixed(2));
        });

        return doc.end({ prettyPrint: true });
    }

    private buildParty(
        partyEle: ReturnType<ReturnType<typeof create>['ele']>,
        account?: InvoiceAccountDTO | null,
        address?: InvoiceAddressDto | null,
    ): void {
        if (account?.name) {
            partyEle.ele('cac:PartyName').ele('cbc:Name').txt(account.name);
        }

        if (address) {
            const postalAddress = partyEle.ele('cac:PostalAddress');
            if (address.streetName)
                postalAddress.ele('cbc:StreetName').txt(address.streetName);
            if (address.additionalStreetName)
                postalAddress
                    .ele('cbc:AdditionalStreetName')
                    .txt(address.additionalStreetName);
            if (address.buildingNumber)
                postalAddress
                    .ele('cbc:BuildingNumber')
                    .txt(String(address.buildingNumber));
            if (address.citySubdivisionName)
                postalAddress
                    .ele('cbc:CitySubdivisionName')
                    .txt(address.citySubdivisionName);
            if (address.cityName)
                postalAddress.ele('cbc:CityName').txt(address.cityName);
            if (address.postalZone)
                postalAddress.ele('cbc:PostalZone').txt(address.postalZone);
            if (address.country) {
                postalAddress
                    .ele('cac:Country')
                    .ele('cbc:Name')
                    .txt(address.country);
            }
        }

        if (account?.legalIdentity) {
            const partyTaxScheme = partyEle.ele('cac:PartyTaxScheme');
            partyTaxScheme
                .ele('cbc:CompanyID')
                .txt(account.legalIdentity);
            partyTaxScheme
                .ele('cac:TaxScheme')
                .ele('cbc:ID')
                .txt(account.type === 'INDIVIDUAL' ? 'NRIC' : 'VAT');
        }

        if (account) {
            const legalEntity = partyEle.ele('cac:PartyLegalEntity');
            if (account.name)
                legalEntity.ele('cbc:RegistrationName').txt(account.name);
            if (account.legalIdentity)
                legalEntity.ele('cbc:CompanyID').txt(account.legalIdentity);
        }
    }

    private groupByTaxPercent(
        items: PaymentItemDto[],
    ): Record<string, { taxableAmount: number; taxAmount: number }> {
        const groups: Record<
            string,
            { taxableAmount: number; taxAmount: number }
        > = {};
        for (const item of items) {
            const percent = String(item.taxPercent ?? 0);
            if (!groups[percent]) {
                groups[percent] = { taxableAmount: 0, taxAmount: 0 };
            }
            groups[percent].taxableAmount = AmountCalculationUtil.addNumberValues(
                groups[percent].taxableAmount,
                Number(item.unTaxAmount) || 0,
            );
            groups[percent].taxAmount = AmountCalculationUtil.addNumberValues(
                groups[percent].taxAmount,
                Number(item.taxAmount) || 0,
            );
        }
        return groups;
    }
}
