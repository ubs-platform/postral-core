import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Payment } from './payment.entity';

@Entity()
export class Participant {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    /** Gerçek ya da Tüzel kişi */
    personalityType: 'INDUVIDIAL' | 'COMMERCIAL';

    fullName: string;

    /***
     * Türkiye, ABD, vs. vatandaşı olduğu
     * */
    identityCountry: string;
    /**
     * Türkiye:
     * TCKN ya da VKN
     * Diğer ülkeler: Vergi numarası
     */
    identityNumber: string;
}
