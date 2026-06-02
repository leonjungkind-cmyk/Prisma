import { describe, expect, test } from 'vitest';

import { existingIds, getNotFoundId, restURL } from '../constants.mts';

describe('GET /rest/:id', () => {
    test.each(existingIds)('GET /rest/%s liefert einen Kunden', async (id) => {
        const response = await fetch(`${restURL}/${id}`, {
            headers: {
                Accept: 'application/json',
            },
        });

        expect(response.status).toBe(200);

        const body = (await response.json()) as {
            id: number;
            version: number;
            adresse: { id: number };
            bestellungen: unknown[];
        };

        expect(body.id).toBe(id);
        expect(body.adresse).toBeDefined();
        expect(Array.isArray(body.bestellungen)).toBe(true);

        // ETag muss zur aktuellen Versionsnummer passen
        const etag = response.headers.get('etag');

        expect(etag).toBe(`W/"${body.version}"`);

        const notModifiedResponse = await fetch(`${restURL}/${id}`, {
            headers: {
                Accept: 'application/json',
                'If-None-Match': `"${body.version}"`,
            },
        });

        expect(notModifiedResponse.status).toBe(304);
    });

    test('GET /rest/999999 liefert 404', async () => {
        const response = await fetch(`${restURL}/${getNotFoundId}`, {
            headers: {
                Accept: 'application/json',
            },
        });

        expect(response.status).toBe(404);
    });
});
