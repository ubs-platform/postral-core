export class RelatedAccountFilterDto {
    constructor(partial: Partial<RelatedAccountFilterDto>) {
        Object.assign(this, partial);
    }
    // İlgili hesapların id'lerini tutar. Bu id'ler transaction'larda source veya target olarak geçebilir.
    relatedAccountIds?: string[] = [];
    // Seçilecek hesapların hangi tarafta olduğunu belirtir. SOURCE, TARGET veya BOTH olabilir. Default olarak BOTH seçilir.
    selectFrom: "SOURCE" | "TARGET" | "BOTH" = "BOTH";
    // İlgili hesapların hangi tarafta olduğunu belirtir. SOURCE, TARGET veya BOTH olabilir. Default olarak BOTH seçilir.
    filterRelatedAccountIdsIn : "SOURCE" | "TARGET" | "BOTH" = "BOTH";
}