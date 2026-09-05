# Sensitive Field Encryption

## Configuration and Scope

Sensitive data encryption is configured through `POSTRAL_SENSITIVE_DATA_ENCRYPTION_ENABLED`, with modes to encrypt new data, disable encryption, or decrypt existing data without encrypting new values. The implementation is mapper-based through `apps/payment/src/util/cryption-util.ts`, not a database transformer.

Encrypted account fields include legal identity and banking/tax data. Address and invoice-address mappers encrypt address components; invoice account legal identity is also encrypted. Consult the mapper before adding or changing a sensitive field.

## Querying Encrypted Values

Plaintext equality queries against an encrypted column do not match. If equality lookup of an encrypted field is required, encrypt the normalized search input with the same configured encryption routine before querying. Do not add plaintext duplicate fields merely for search without an explicit security decision.

See `docs/sensitive-field-encryption.md` for the broader compliance and field-coverage discussion.
