import { type Context, type HonoRequest, type Next } from 'hono';
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';
import { JOSEError } from 'jose/errors';

import {
    ForbiddenError,
    InternalServerError,
    UnauthorizedError,
} from './errors.mts';
import { keycloakConfig } from '../config/keycloak.mts';
import { getLogger } from '../logger/logger.mts';

const logger = getLogger('roles-required', 'file');

type Rolle = 'admin' | 'user';

const { issuer, jwksUri, clientId, audience } = keycloakConfig;

const jwks = createRemoteJWKSet(new URL(jwksUri));

const getToken = (req: HonoRequest) => {
    const auth = req.header('Authorization');

    if (!auth?.startsWith('Bearer ')) {
        throw new UnauthorizedError('Authorization fehlt im Header');
    }

    const token = auth.slice(7);
    logger.debug('getToken: token=%s', token);

    return token;
};

const verifyToken = async (token: string) => {
    try {
        return await jwtVerify(token, jwks, {
            issuer,
            audience,
        });
    } catch (err) {
        logger.debug('verifyToken: err=%o', err as object);

        if (err instanceof JOSEError) {
            throw new UnauthorizedError('Token nicht gueltig');
        }

        throw new InternalServerError();
    }
};

const getRollen = (payload: JWTPayload) => {
    const resourceAccess = payload['resource_access'];

    if (
        resourceAccess === undefined ||
        resourceAccess === null ||
        typeof resourceAccess !== 'object' ||
        !(clientId in resourceAccess)
    ) {
        throw new ForbiddenError('Keine Rolle im Token enthalten');
    }

    const clientAccess = (resourceAccess as Record<string, unknown>)[clientId];

    if (
        clientAccess === null ||
        clientAccess === undefined ||
        typeof clientAccess !== 'object' ||
        !('roles' in clientAccess)
    ) {
        throw new ForbiddenError('Keine Rolle im Token enthalten');
    }

    const roles = (clientAccess as { roles: string[] }).roles;

    logger.debug('getRollen: roles=%o', roles);

    return roles;
};

export const rolesRequired =
    (...roles: Rolle[]) =>
    async (c: Context, next: Next) => {
        const token = getToken(c.req);

        const { payload } = await verifyToken(token);
        logger.debug('rolesRequired: payload=%o', payload);

        const rollen = getRollen(payload);

        const rolleVorhanden = roles.some((role) => rollen.includes(role));

        if (!rolleVorhanden) {
            throw new ForbiddenError('Erforderliche Rolle nicht vorhanden');
        }

        await next();
    };
