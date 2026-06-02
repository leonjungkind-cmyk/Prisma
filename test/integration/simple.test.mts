import { describe, expect, test } from 'vitest';

// -----------------------------------------------------------------------------
// T e s t   S u i t e
// -----------------------------------------------------------------------------
describe('simple', () => {
    test('true === true', () => {
        expect(true).toBe(true); // NOSONAR
    });

    test.todo('noch nicht fertig', () => {
        expect(true).toBe(false); // NOSONAR
    });
});
