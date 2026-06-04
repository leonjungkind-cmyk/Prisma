import { getLogger } from '../logger/logger.mts';
import { keycloakConfig } from '../config/keycloak.mts';

const { accessTokenUrl, clientId, secret } = keycloakConfig;

export type TokenData = {
    readonly username: string | undefined;
    readonly password: string | undefined;
};

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

    async token({ username, password }: TokenData) {
        this.#logger.debug('token: username=%s', username);

        if (typeof username !== 'string' || typeof password !== 'string') {
            return;
        }

        const response = await fetch(accessTokenUrl, {
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
        });

        if (!response.ok) {
            this.#logger.debug('token: status=%d', response.status);
            return;
        }

        return (await response.json()) as TokenResponse;
    }
}
