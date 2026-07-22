export class ExternalPlatformDTO {
    id: string = '';

    // Görünen ad, örn. "Hepsiburada"
    name: string = '';

    // Benzersiz kod, örn. HEPSIBURADA / TRENDYOL / AMAZON / GOOGLE_PLAY
    code: string = '';

    active: boolean = true;

    createdAt?: Date;

    updatedAt?: Date;
}
