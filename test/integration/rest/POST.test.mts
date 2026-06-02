import { randomUUID } from 'node:crypto';

import { describe, expect, test } from 'vitest';

import { type KundeNeuType, KundeNeuSchema } from '../../../src/kunde/router/kunde-validation.mts';
import { KundeService } from '../../../src/kunde/service/kunde-service.mts';
import { getToken } from '../token.mts';
import { restURL } from '../constants.mts';

const createBody = (suffix: string): KundeNeuType => ({
    nachname: `Muell ${suffix}`,
    email: `maxi.muell.${suffix}@example.com`,
    username: `mueller_${suffix}`,
    adresse: {
        strasse: 'Hauptstrasse',
        hausnummer: '1',
        plz: '76133',
        ort: 'Karlsruhe',
    },
    bestellungen: [
        {
            produktname: 'Laptop',
            menge: 2,
        },
    ],
});

describe('POST /rest', () => {
    test('POST /rest ohne Token liefert 401', async () => {
        // Ohne Authentifizierung darf kein Kunde angelegt werden
        const response = await fetch(restURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(createBody(randomUUID())),
        });

        expect(response.status).toBe(401);
    });

    test('POST /rest mit gueltigem Token legt einen Kunden an', async () => {
        // Admin-Token fuer die Schreiboperation holen
        const token = await getToken();
        const body = createBody(randomUUID());

        const response = await fetch(restURL, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        expect(response.status).toBe(201);

        const location = response.headers.get('location');

        expect(location).toMatch(/^https:\/\/localhost:3000\/rest\/\d+$/u);

        const id = location?.split('/').at(-1) ?? '';

        expect(KundeService.ID_PATTERN.test(id)).toBe(true);

        const createdResponse = await fetch(location ?? '', {
            headers: {
                Accept: 'application/json',
            },
        });

        expect(createdResponse.status).toBe(200);

        const createdBody = (await createdResponse.json()) as KundeNeuType & {
            id: number;
        };

        expect(createdBody.id).toBeGreaterThan(0);
        expect(createdBody.nachname).toBe(body.nachname);
        expect(createdBody.email).toBe(body.email);
    });

    test('POST /rest mit ungueltigen Daten liefert 422 und die erwarteten Pfade', async () => {
        const invalidBody = {
            nachname: '',
            email: 'keine-email',
            username: '',
        };

        // Zod muss dieselben Pflichtfelder wie die API pruefen
        const parsed = KundeNeuSchema.safeParse(invalidBody);

        expect(parsed.success).toBe(false);

        const expectedPaths = ['nachname', 'email', 'username'];
        const issues = (parsed as unknown as {
            success: false;
            error: { issues: { path: PropertyKey[] }[] };
        }).error.issues;

        expect(issues.map((issue) => String(issue.path[0]))).toStrictEqual(
            expect.arrayContaining(expectedPaths),
        );

        const token = await getToken();

        const response = await fetch(restURL, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(invalidBody),
        });

        expect(response.status).toBe(422);
    });

    test('POST /rest mit doppelt verwendeter E-Mail liefert 400', async () => {
        // Dieselben Daten zweimal speichern muss fehlschlagen
        const token = await getToken();
        const body = createBody(randomUUID());

        const response1 = await fetch(restURL, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        expect(response1.status).toBe(201);

        const response2 = await fetch(restURL, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        expect(response2.status).toBe(400);
    });
});
