// The SDK has no bundled types; @types/iyzipay describes an older, incompatible CF API.
declare module 'iyzipay' {
    class Iyzipay {
        constructor(config: { apiKey: string; secretKey: string; uri: string });
        checkoutFormInitialize: {
            create(
                request: object,
                callback: (error: Error | null, result: unknown) => void,
            ): void;
        };
        checkoutForm: {
            retrieve(
                request: object,
                callback: (error: Error | null, result: unknown) => void,
            ): void;
        };
    }
    export = Iyzipay;
}
