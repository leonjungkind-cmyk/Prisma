import { type Context, Hono, type Next } from 'hono';
import { compress } from 'hono/compress';
import { cors } from 'hono/cors';
import { showRoutes } from 'hono/dev';
import { createMiddleware } from 'hono/factory';
import { secureHeaders } from 'hono/secure-headers';
import { ZodError } from 'zod';

import { corsOptions } from './config/cors.mts';
import { router as devRouter } from './config/dev/dev-router.mts';
import { env } from './config/env.mts';
import { paths } from './config/paths.mts';
import { router } from './kunde/router/kunde-router.mts';
import { router as kundeWriteRouter } from './kunde/router/kunde-write-router.mts';
import {
    EmailExistsError,
    NotFoundError,
    UsernameExistsError,
    VersionInvalidError,
    VersionOutdatedError,
} from './kunde/service/errors.mts';
import { getLogger } from './logger/logger.mts';
import {
    badRequest,
    createProblemDetails,
    forbidden,
    preconditionFailed,
    unauthorized,
    unprocessableContent,
} from './problem-details.mts';
import { router as authRouter } from './security/auth-router.mts';
import { ForbiddenError, UnauthorizedError } from './security/errors.mts';

const INTERNAL_SERVER_ERROR = 500;

export const app = new Hono();

const logger = getLogger('app', 'file');

const securityHeaders = createMiddleware(async (c: Context, next: Next) => {
    c.header('X-Content-Type-Options', 'nosniff');
    c.header('X-Frame-Options', 'SAMEORIGIN');

    await next();
});

app.use(secureHeaders(), cors(corsOptions), securityHeaders, compress());

app.route(paths.rest, router);
app.route(paths.rest, kundeWriteRouter);

app.route('/auth', authRouter);

const { NODE_ENV } = env;

if (NODE_ENV === 'development' || NODE_ENV === 'test') {
    app.route(paths.dev, devRouter);
}

if (logger.isLevelEnabled('debug')) {
    showRoutes(app, { verbose: true });
}

// oxlint-disable-next-line promise/prefer-await-to-callbacks
app.onError((error, c) => {
    if (error instanceof NotFoundError) {
        return c.notFound();
    }

    if (error instanceof ZodError) {
        return createProblemDetails(
            c,
            unprocessableContent,
            'Die Anfrage enthält ungültige Daten.',
        );
    }

    if (error instanceof EmailExistsError) {
        return createProblemDetails(c, badRequest, error.message);
    }

    if (error instanceof UsernameExistsError) {
        return createProblemDetails(c, badRequest, error.message);
    }

    if (error instanceof VersionInvalidError) {
        return createProblemDetails(c, badRequest, error.message);
    }

    if (error instanceof VersionOutdatedError) {
        return createProblemDetails(c, preconditionFailed, error.message);
    }

    if (error instanceof UnauthorizedError) {
        return createProblemDetails(c, unauthorized, error.message);
    }

    if (error instanceof ForbiddenError) {
        return createProblemDetails(c, forbidden, error.message);
    }

    logger.error('Interner Fehler: %o', error);
    console.log(error.stack);

    return c.body('Interner Fehler', INTERNAL_SERVER_ERROR);
});
