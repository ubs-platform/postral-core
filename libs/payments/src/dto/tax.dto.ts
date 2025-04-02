export class TaxDTO {
    constructor(
        public taxName: string,
        public fullAmount: number,
        public percent: number,
        public taxAmount: number,
        public untaxAmount,
    ) {}
}
