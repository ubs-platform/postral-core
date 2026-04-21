import { Injectable } from "@nestjs/common";

@Injectable()
export class CryptionUtil {

    encryptWithConfig(text: string | null | undefined, onError: "THROW" | "USE_DEFAULT" = "THROW"): string | null | undefined {
        if (process.env.POSTRAL_SENSITIVE_DATA_ENCRYPTION_ENABLED !== "true") {
            console.warn('Encryption is disabled. Returning original text.');
            return text; // Preserve null/undefined when encryption is disabled
        }
        if (text == null) {
            return text; // Preserve null/undefined so optional fields round-trip correctly
        }
        try {
            const key = Buffer.from(process.env.POSTRAL_SENSITIVE_DATA_ENCRYPTION_KEY!, 'utf-8');
            const iv = Buffer.from(process.env.POSTRAL_SENSITIVE_DATA_ENCRYPTION_IV!, 'utf-8');
            const algorithm = process.env.POSTRAL_SENSITIVE_DATA_ENCRYPTION_ALGORITHM!;
            return this.encrypt(text, key, iv, algorithm);
        } catch (e) {
            console.error('Error encrypting data:', e);
            if (onError === "THROW") {
                throw e;
            } else {
                console.error('Encryption failed, returning original text due to onError setting:', text);
                return text; // Return original text if encryption fails and onError is set to USE_DEFAULT
            }
        }

    }

    decryptWithConfig(encryptedText: string | null | undefined, onError: "THROW" | "USE_DEFAULT" = "THROW"): string | null | undefined {
        if (process.env.POSTRAL_SENSITIVE_DATA_ENCRYPTION_ENABLED !== "true" && process.env.POSTRAL_SENSITIVE_DATA_ENCRYPTION_ENABLED !== "false-decrypt") {
            console.warn('Decryption is disabled. Returning original encrypted text.');
            return encryptedText; // Preserve null/undefined when decryption is disabled
        }
        if (encryptedText == null) {
            return encryptedText; // Preserve null/undefined so optional fields round-trip correctly
        }
        // false-decrypt durumunda, şifrelenmiş veriyi çözümleyebiliriz ancak şifreleme işlemi devre dışı bırakılmıştır. Bu durumda, şifrelenmiş veriyi çözümleyebiliriz ancak yeni veriler şifrelenmeyecektir.
        // Bu durumda development ortamlarının uyumluluğu için her veri bir kere kaydedilmesi gerekiyor...

        try {
            
            const key = Buffer.from(process.env.POSTRAL_SENSITIVE_DATA_ENCRYPTION_KEY!, 'utf-8');
            const iv = Buffer.from(process.env.POSTRAL_SENSITIVE_DATA_ENCRYPTION_IV!, 'utf-8');
            const algorithm = process.env.POSTRAL_SENSITIVE_DATA_ENCRYPTION_ALGORITHM!;
            return this.decrypt(encryptedText, key, iv, algorithm);
        } catch (e) {
            console.error('Error decrypting data:', e);
            if (onError === "THROW") {
                throw e;
            } else {
                console.error('Decryption failed, returning original encrypted text due to onError setting:', encryptedText);
                return encryptedText; // Return original encrypted text if decryption fails and onError is set to USE_DEFAULT
            }
        }

    }

    encrypt(text: string, key: Buffer, iv: Buffer, algorithm: string): string {
        const crypto = require('crypto');
        const cipher = crypto.createCipheriv(algorithm, key, iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return encrypted;
    }

    decrypt(encryptedText: string, key: Buffer, iv: Buffer, algorithm: string): string {
        const crypto = require('crypto');
        const decipher = crypto.createDecipheriv(algorithm, key, iv);
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
}