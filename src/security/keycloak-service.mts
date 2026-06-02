import { getLogger } from '../logger/logger.mts';
import { keycloakConfig } from '../config/keycloak.mts';

const { accessTokenUrl, clientId, secret } = keycloakConfig;

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
            accessTokenUrl,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    grant_type: 'password',
                    client_id: clientId,
                    client_secret: secret,
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
