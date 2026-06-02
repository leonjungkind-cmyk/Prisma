import { adminCredentials, tokenURL } from './constants.mts';

type TokenResponse = {
    access_token: string;
};

export const getToken = async (
    username: string = adminCredentials.username,
    password: string = adminCredentials.password,
) => {
    // Zugangsdaten als Form-Daten senden
    const response = await fetch(tokenURL, {
        method: 'POST',
        body: JSON.stringify({ username, password }),
        headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
        throw new Error(`Token konnte nicht erstellt werden: ${response.status}`);
    }

    const tokenResponse = (await response.json()) as TokenResponse;
    return tokenResponse.access_token;
};
