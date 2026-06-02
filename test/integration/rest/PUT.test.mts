import { describe, expect, test } from 'vitest';

import { type KundeUpdateType } from '../../../src/kunde/router/kunde-validation.mts';
import { getToken } from '../token.mts';
import { restURL, putExistingId } from '../constants.mts';

type KundeGetResponse = {
    version: number;
    nachname: string;
    email: string;
};

let initialVersion: number | undefined;

const getKunde = async (id: string) => {
    const response = await fetch(`${restURL}/${id}`, {
        headers: {
            Accept: 'application/json',
        },
    });

    expect(response.status).toBe(200);

    return (await response.json()) as KundeGetResponse;
};

const updateBody = (kunde: KundeGetResponse): KundeUpdateType => ({
    nachname: `${kunde.nachname} Update`,
    email: kunde.email,
});

describe('PUT /rest/:id', () => {
    test('PUT /rest/30 ohne Token liefert 401', async () => {
        const response = await fetch(`${restURL}/${putExistingId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'If-Match': '"0"',
            },
            body: JSON.stringify({ nachname: 'Neu', email: 'neu@example.com' }),
        });

        expect(response.status).toBe(401);
    });

    test('PUT /rest/30 mit falschem Token liefert 401', async () => {
        const response = await fetch(`${restURL}/${putExistingId}`, {
            method: 'PUT',
            headers: {
                Authorization: 'Bearer falsch',
                'Content-Type': 'application/json',
                'If-Match': '"0"',
            },
            body: JSON.stringify({ nachname: 'Neu', email: 'neu@example.com' }),
        });

        expect(response.status).toBe(401);
    });

    test('PUT /rest/30 ohne Versionsnummer liefert 428', async () => {
        // Ohne If-Match fehlt die Precondition
        const token = await getToken();

        const response = await fetch(`${restURL}/${putExistingId}`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nachname: 'Neu', email: 'neu@example.com' }),
        });

        expect(response.status).toBe(428);
    });

    test('PUT /rest/30 aktualisiert einen Kunden und liefert ETag', async () => {
        // Aktuelle Versionsnummer fuer den spaeteren 412-Fall merken
        const token = await getToken();
        const kunde = await getKunde(putExistingId);
        initialVersion = kunde.version;
        const body = updateBody(kunde);

        const response = await fetch(`${restURL}/${putExistingId}`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
                'If-Match': `"${kunde.version}"`,
            },
            body: JSON.stringify(body),
        });

        expect(response.status).toBe(204);

        expect(response.headers.get('etag')).toBe(`"${kunde.version + 1}"`);

        const updatedResponse = await fetch(`${restURL}/${putExistingId}`, {
            headers: {
                Accept: 'application/json',
            },
        });

        expect(updatedResponse.status).toBe(200);

        const updated = (await updatedResponse.json()) as KundeGetResponse;

        expect(updated.nachname).toBe(body.nachname);
        expect(updated.email).toBe(body.email);
    });

    test('PUT /rest/30 mit alter Version liefert 412', async () => {
        // Alte Version wiederverwenden, damit die Precondition fehlschlaegt
        const token = await getToken();
        const kunde = await getKunde(putExistingId);
        const alteVersion = initialVersion ?? kunde.version;

        const response = await fetch(`${restURL}/${putExistingId}`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
                'If-Match': `"${alteVersion}"`,
            },
            body: JSON.stringify(updateBody(kunde)),
        });

        expect(response.status).toBe(412);
    });

    test('PUT /rest/999999 liefert 404', async () => {
        const token = await getToken();

        const response = await fetch(`${restURL}/999999`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
                'If-Match': '"0"',
            },
            body: JSON.stringify({ nachname: 'Neu', email: 'neu@example.com' }),
        });

        expect(response.status).toBe(404);
    });
});
