import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import validateTypes from '../index.js';

// A valid RFC 4122 UUID (v4 example)
const VALID_UUID = '123e4567-e89b-42d3-a456-426614174000';

describe('validateTypes (integration with real arc-lib & email-validator)', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });

    // --- null short-circuit ----------------------------------------------------
    it('allows null when `_types` contains literal null', () => {
        expect(() => validateTypes(null, ['string', null])).not.toThrow();
        expect(() => validateTypes(null, [null])).not.toThrow();

        // If null is NOT allowed, it should throw via default branch
        expect(() => validateTypes(null, ['string'])).toThrow(TypeError);
    });

    // --- parseInt branch --------------------------------------------------------
    it('parseInt: passes numeric-like strings and numbers', () => {
        expect(() => validateTypes('42', ['parseInt'])).not.toThrow();
        expect(() => validateTypes(0, ['parseInt'])).not.toThrow();
        expect(() => validateTypes(123.99, ['parseInt'])).not.toThrow(); // parseInt(123.99) -> 123
    });

    it('parseInt: throws TypeError on invalid input and sets `.value` on error; custom error overrides', () => {
        // default TypeError with .value
        try {
            validateTypes('not-a-number', ['parseInt']);
            throw new Error('should have thrown');
        } catch (err) {
            expect(err).toBeInstanceOf(TypeError);
            expect(String(err.message)).toMatch(/Expected parseInt\./);
            expect(err).toHaveProperty('value', 'not-a-number');
        }

        // custom error precedence
        const custom = new RangeError('custom parseInt error');
        expect(() => validateTypes('NaNish', ['parseInt'], custom)).toThrow(custom);
    });

    // --- parseFloat branch ------------------------------------------------------
    it('parseFloat: passes floats and numeric strings', () => {
        expect(() => validateTypes('3.14159', ['parseFloat'])).not.toThrow();
        expect(() => validateTypes(2.5, ['parseFloat'])).not.toThrow();
    });

    it('parseFloat: throws on invalid input; custom error precedence', () => {
        const custom = new Error('pf custom');
        expect(() => validateTypes('NaNish', ['parseFloat'], custom)).toThrow(custom);
        expect(() => validateTypes('NaNish', ['parseFloat'])).toThrow(TypeError);
    });

    // --- email branch -----------------------------------------------------------
    it('email: validates properly', () => {
        expect(() => validateTypes('user@example.com', ['email'])).not.toThrow();
        expect(() => validateTypes('bad-email', ['email'])).toThrow(TypeError);

        const custom = new Error('bad email');
        expect(() => validateTypes('also-bad', ['email'], custom)).toThrow(custom);
    });

    // --- explicit branch --------------------------------------------------------
    it('explicit: requires value be one of the provided literals (after removing "explicit")', () => {
        expect(() => validateTypes('on', ['explicit', 'on', 'off'])).not.toThrow();
        expect(() => validateTypes('off', ['explicit', 'on', 'off'])).not.toThrow();
        expect(() => validateTypes('maybe', ['explicit', 'on', 'off'])).toThrow(TypeError);

        const custom = new Error('explicit custom');
        expect(() => validateTypes('maybe', ['explicit', 'yes', 'no'], custom)).toThrow(custom);
    });

    // --- uuid branch ------------------------------------------------------------
    it('uuid: accepts RFC 4122 (v1–v5) strings and rejects invalid formats/non-strings', () => {
        expect(() => validateTypes(VALID_UUID, ['uuid'])).not.toThrow();

        // wrong variant/letters
        expect(() => validateTypes('123e4567-e89b-42d3-a456-42661417400Z', ['uuid'])).toThrow(TypeError);
        // wrong sections
        expect(() => validateTypes('123e4567e89b-42d3-a456-426614174000', ['uuid'])).toThrow(TypeError);
        // non-string
        expect(() => validateTypes(123, ['uuid'])).toThrow(TypeError);

        const custom = new Error('uuid custom');
        expect(() => validateTypes('not-a-uuid', ['uuid'], custom)).toThrow(custom);
    });

    // --- default branch (arc-lib is(...)) --------------------------------------
    it('default type check: matches arc-lib `is()` results', () => {
        // strings
        expect(() => validateTypes('hello', ['string'])).not.toThrow();
        // numbers
        expect(() => validateTypes(5, ['number'])).not.toThrow();
        // arrays
        expect(() => validateTypes([1, 2], ['array'])).not.toThrow();
        // objects
        expect(() => validateTypes({ a: 1 }, ['object'])).not.toThrow();

        // mismatch throws
        expect(() => validateTypes({ a: 1 }, ['string'])).toThrow(TypeError);

        const custom = new Error('mismatch custom');
        expect(() => validateTypes({ a: 1 }, ['string'], custom)).toThrow(custom);
    });

    // --- short-circuit & ordering ----------------------------------------------
    it('short-circuits on the first special branch found (e.g., parseInt)', () => {
        // When parseInt is present and succeeds, it returns before checking others
        expect(() => validateTypes('42', ['parseInt', 'email', 'string'])).not.toThrow();

        // When parseInt is present and fails, it throws immediately (others ignored)
        const custom = new Error('early custom');
        expect(() => validateTypes('nope', ['parseInt', 'email', 'string'], custom)).toThrow(custom);
    });
});
