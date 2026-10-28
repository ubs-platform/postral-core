import { BadRequestException } from '@nestjs/common';

const MAX_RETURN_URL_LENGTH = 2048;
const MAX_RETURN_ORIGINS = 50;
// Public path of this service as seen by browsers; the proxy strips only `/service/payment`.
const DEFAULT_PUBLIC_API_PATH = '/service/payment/api/';
const PLACEHOLDER_ORIGIN = 'http://postral.invalid';

export function isProductionEnvironment(): boolean {
    return process.env.NODE_ENV === 'production';
}

function publicApiPath(): string {
    const path = process.env.POSTRAL_PUBLIC_API_PATH || DEFAULT_PUBLIC_API_PATH;
    return path.endsWith('/') ? path : `${path}/`;
}

function parseHttpUrl(value: string): URL | null {
    try {
        const url = new URL(value);
        if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
            return null;
        }
        return url;
    } catch {
        return null;
    }
}

/** Normalizes admin-entered return origins (`https://app.example.com`) and rejects anything else. */
export function normalizeReturnOrigins(input: unknown): string[] {
    if (input === undefined || input === null) return [];
    if (!Array.isArray(input) || input.length > MAX_RETURN_ORIGINS) {
        throw new BadRequestException(`Allowed return origins must be a list of at most ${MAX_RETURN_ORIGINS} items`);
    }
    const origins = new Set<string>();
    for (const value of input) {
        const url = typeof value === 'string' ? parseHttpUrl(value.trim()) : null;
        if (!url || url.pathname !== '/' || url.search || url.hash) {
            throw new BadRequestException(`Invalid return origin: ${String(value)}`);
        }
        origins.add(url.origin);
    }
    return [...origins];
}

/**
 * Validates the frontend URL a browser is sent back to after payment.
 * Outside production every http(s) origin is allowed; in production the origin must be whitelisted.
 */
export function validateReturnUrl(
    value: unknown,
    allowedOrigins: string[] | undefined,
    production = isProductionEnvironment(),
): string {
    if (typeof value !== 'string' || !value || value.length > MAX_RETURN_URL_LENGTH) {
        throw new BadRequestException('Invalid redirectUrl');
    }
    const url = parseHttpUrl(value);
    if (!url) {
        throw new BadRequestException('redirectUrl must be an absolute http(s) URL without credentials');
    }
    if (production) {
        if (!allowedOrigins?.length) {
            throw new BadRequestException('Allowed return origins are not configured');
        }
        if (!allowedOrigins.includes(url.origin)) {
            throw new BadRequestException('redirectUrl origin is not allowed');
        }
    }
    return url.toString();
}

/** Public path of the Postral endpoint that checks the payment and forwards the browser to the frontend. */
export function operationReturnPath(operationRecordId: string): string {
    return `${publicApiPath()}payment/operation/${encodeURIComponent(operationRecordId)}/return`;
}

/**
 * Adds `redirectUrl` to a channel payment page URL. Absolute URLs stay absolute; app-origin and
 * legacy bare relative paths become app-origin paths so clients can open them as-is.
 */
export function withChannelReturnUrl(channelRedirectUrl: string, returnUrl: string): string {
    const absolute = /^[a-z][a-z\d+.-]*:/i.test(channelRedirectUrl);
    const source = absolute || channelRedirectUrl.startsWith('/')
        ? channelRedirectUrl
        : publicApiPath() + channelRedirectUrl;
    const url = new URL(source, PLACEHOLDER_ORIGIN);
    url.searchParams.set('redirectUrl', returnUrl);
    return absolute ? url.toString() : url.pathname + url.search + url.hash;
}

export function appendReturnParams(returnUrl: string, params: Record<string, string>): string {
    const url = new URL(returnUrl);
    for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, value);
    }
    return url.toString();
}
