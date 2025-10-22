// index.d.ts

/**
 * Type tokens understood by the validator.
 * - Built-ins from arc-lib's `is()` may appear as strings (e.g., "string", "number", "array", "object", etc.).
 * - Special tokens handled with custom logic: "parseInt", "parseFloat", "email", "uuid", "explicit".
 * - The literal `null` in the array allows `null` values to pass (short-circuits validation).
 */
export type ValidatorToken =
    | 'parseInt'
    | 'parseFloat'
    | 'email'
    | 'uuid'
    | 'explicit'
    | string
    | null;

/**
 * Validate `_unknown` against a list of `_types`.
 *
 * Behavior summary:
 * - If `_types` contains `null` and `_unknown === null`, validation passes.
 * - If `_types` contains "parseInt": requires `parseInt(_unknown)` to be a valid number.
 * - If `_types` contains "parseFloat": requires `parseFloat(_unknown)` to be a valid number.
 * - If `_types` contains "email": requires a valid email string (via `email-validator`).
 * - If `_types` contains "uuid": requires an RFC4122 v1–v5 UUID string.
 * - If `_types` contains "explicit":
 *     - The validator removes "explicit" from `_types` and then requires `_unknown` to be strictly equal
 *       to one of the remaining entries (e.g., `['explicit', 'on', 'off']` ⇒ only 'on' or 'off' pass).
 * - Otherwise: uses `is(_unknown)` (from arc-lib) and checks that the resulting string is included in `_types`.
 *
 * Throws:
 * - `TypeError` (message includes the expectation and the received type or value), or
 * - `_customError` if provided (thrown as-is whenever validation fails).
 *
 * Returns:
 * - `void` on success.
 */
export default function validateTypes(
    _unknown: unknown,
    _types: ValidatorToken[],
    _customError?: unknown | null
): void;
