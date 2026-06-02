import { describe, expect, test } from 'vitest';

import { deleteExistingId, restURL } from '../constants.mts';
import { getToken } from '../token.mts';

describe('DELETE /rest/:id', () => {
    test('DELETE /rest/50 ohne Token liefert 401', async () => {
        // Ohne Token darf nicht geloescht werden
        const response = await fetch(`${restURL}/${deleteExistingId}`, {
            method: 'DELETE',
        });

        expect(response.status).toBe(401);
    });

    test('DELETE /rest/50 mit falschem Token liefert 401', async () => {
        const response = await fetch(`${restURL}/${deleteExistingId}`, {
            method: 'DELETE',
            headers: {
                Authorization: 'Bearer falsch',
            },
        });

        expect(response.status).toBe(401);
    });

    test('DELETE /rest/50 mit User-Token liefert 403', async () => {
        // User darf hier keine Loeschrechte haben
        const token = await getToken('user', 'p');

        const response = await fetch(`${restURL}/${deleteExistingId}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        expect(response.status).toBe(403);
    });

    test('DELETE /rest/50 mit Admin-Token liefert 204', async () => {
        const token = await getToken();

        const response = await fetch(`${restURL}/${deleteExistingId}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        expect(response.status).toBe(204);
    });

    test('DELETE /rest/999999 liefert 204', async () => {
        const token = await getToken();

        const response = await fetch(`${restURL}/999999`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        expect(response.status).toBe(204);
    });
});
