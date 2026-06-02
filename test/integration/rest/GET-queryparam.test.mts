import { describe, expect, test } from 'vitest';

import { restURL } from '../constants.mts';
import { type KundeMitAdresse } from '../../../src/kunde/service/kunde-service.mts';
import { type Page } from '../../../src/kunde/router/page.mts';

describe('GET /rest mit Query-Parametern', () => {
    test('GET /rest liefert alle Kunden als Page', async () => {
        // Grundabfrage ohne Filter
        const response = await fetch(restURL, {
            headers: {
                Accept: 'application/json',
            },
        });

        expect(response.status).toBe(200);

        const body = (await response.json()) as Page<KundeMitAdresse>;

        expect(body.content.length).toBeGreaterThan(0);
        expect(body.page.size).toBe(5);
        expect(body.page.number).toBe(0);
        expect(body.page.totalElements).toBeGreaterThan(0);
        expect(body.page.totalPages).toBeGreaterThan(0);
    });

    test('GET /rest?nachname=Schmidt findet Kunden nach Nachname', async () => {
        // Filter nach Nachname
        const response = await fetch(`${restURL}?nachname=Schmidt`, {
            headers: {
                Accept: 'application/json',
            },
        });

        expect(response.status).toBe(200);

        const body = (await response.json()) as Page<KundeMitAdresse>;

        expect(body.content.length).toBeGreaterThan(0);
        expect(
            body.content.every((kunde) => kunde.nachname.includes('Schmidt')),
        ).toBe(true);
    });

    test('GET /rest?email=mueller@example.de findet Kunden nach E-Mail', async () => {
        // Exakte E-Mail-Suche
        const response = await fetch(`${restURL}?email=mueller@example.de`, {
            headers: {
                Accept: 'application/json',
            },
        });

        expect(response.status).toBe(200);

        const body = (await response.json()) as Page<KundeMitAdresse>;

        expect(body.content.length).toBeGreaterThan(0);
        expect(
            body.content.every((kunde) => kunde.email === 'mueller@example.de'),
        ).toBe(true);
    });

    test('GET /rest?foo=bar liefert 404', async () => {
        const response = await fetch(`${restURL}?foo=bar`, {
            headers: {
                Accept: 'application/json',
            },
        });

        expect(response.status).toBe(404);
    });
});
