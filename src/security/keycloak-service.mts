import { getLogger } from '../logger/logger.mts';

const KEYCLOAK_URL = 'http://localhost:8880';
const REALM = 'javascript';
const CLIENT_ID = 'javascript-client';

type TokenResponse = {
    access_token: string;
    expires_in: number;
    refresh_expires_in: number;
    refresh_token: string;
    token_type: string;
    scope: string;
};

export class KeycloakService {
    readonly #logger = getLogger(KeycloakService.name);

    async token(username: string, password: string) {
        this.#logger.debug('token: username=%s', username);

        const response = await fetch(
            `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    grant_type: 'password',
                    client_id: CLIENT_ID,
                    username,
                    password,
                }),
            },
        );

        if (!response.ok) {
            this.#logger.debug('token: status=%d', response.status);
            throw new Error('Token konnte nicht erstellt werden.');
        }

        return (await response.json()) as TokenResponse;
    }
}
