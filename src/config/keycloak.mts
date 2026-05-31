import { getLogger } from '../logger/logger.mts';

const logger = getLogger('config/keycloak', 'file');

const KEYCLOAK_HTTP_URL = 'http://localhost:8880';
const KEYCLOAK_HTTPS_URL = 'https://localhost:8843';
const REALM = 'javascript';
const CLIENT_ID = 'javascript-client';

const issuer = `${KEYCLOAK_HTTPS_URL}/realms/${REALM}`;
const oidcHttpUrl = `${KEYCLOAK_HTTP_URL}/realms/${REALM}/protocol/openid-connect`;
const oidcHttpsUrl = `${issuer}/protocol/openid-connect`;

export const keycloakConfig = {
    realm: REALM,
    issuer,
    jwksUri: `${oidcHttpUrl}/certs`,
    clientId: CLIENT_ID,
    audience: ['account'],
    accessTokenUrl: `${oidcHttpsUrl}/token`,
    secret:
        process.env['CLIENT_SECRET'] ??
        'ERROR: Umgebungsvariable CLIENT_SECRET nicht gesetzt!',
};

logger.debug('keycloakConfig=%o', {
    ...keycloakConfig,
    secret: '***',
});
