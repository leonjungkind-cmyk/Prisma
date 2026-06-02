import { adminCredentials, tokenURL } from './constants.mts';

type TokenResponse = {
    access_token: string;
};

export const getToken = async (
    username: string = adminCredentials.username,
    password: string = adminCredentials.password,
) => {
    const response = await fetch(tokenURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
        throw new Error(`Token konnte nicht erstellt werden: ${response.status}`);
    }

    const tokenResponse = (await response.json()) as TokenResponse;
    return tokenResponse.access_token;
};
