import { hostname } from 'node:os';
import { getLogger } from '../logger/logger.mts';

const logger = getLogger('config/keycloak', 'file');

// Im Docker-Container ist der Rechnername ein 12-stelliger Hex-String
const isContainer = /^[0-9a-f]{12}$/u.test(hostname());
const KEYCLOAK_HOST = isContainer ? 'host.docker.internal' : 'localhost';
const KEYCLOAK_HTTP_URL = `http://${KEYCLOAK_HOST}:8880`;
// KC_HOSTNAME=localhost in Keycloak sorgt dafür, dass der "iss"-Claim immer localhost:8880 enthält
const KEYCLOAK_ISSUER_URL = 'http://localhost:8880';
const REALM = 'javascript';
const CLIENT_ID = 'javascript-client';

const issuer = `${KEYCLOAK_ISSUER_URL}/realms/${REALM}`;
const oidcHttpUrl = `${KEYCLOAK_HTTP_URL}/realms/${REALM}/protocol/openid-connect`;

export const keycloakConfig = {
    realm: REALM,
    issuer,
    jwksUri: `${oidcHttpUrl}/certs`,
    clientId: CLIENT_ID,
    audience: ['account'],
    accessTokenUrl: `${oidcHttpUrl}/token`,
    secret:
        process.env['CLIENT_SECRET'] ??
        'ERROR: Umgebungsvariable CLIENT_SECRET nicht gesetzt!',
};

logger.debug('keycloakConfig=%o', {
    ...keycloakConfig,
    secret: '***',
});
