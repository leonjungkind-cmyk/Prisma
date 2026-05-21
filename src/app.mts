import { type Context, Hono, type Next } from 'hono';
import { NotFoundError } from './kunde/service/errors.mts';
import {
    createProblemDetails,
    unprocessableContent,
} from './problem-details.mts';
import { type ZodError } from 'zod';
import { compress } from 'hono/compress';
import { cors } from 'hono/cors';
import { corsOptions } from './config/cors.mts';
import { createMiddleware } from 'hono/factory';
import { env } from './config/env.mts';
import { getLogger } from './logger/logger.mts';
import { paths } from './config/paths.mts';
import { router as devRouter } from './config/dev/dev-router.mts';
import { router } from './kunde/router/kunde-router.mts';
import { secureHeaders } from 'hono/secure-headers';
import { showRoutes } from 'hono/dev';

const INTERNAL_SERVER_ERROR = 500;

export const app = new Hono();

const logger = getLogger('app', 'file');

// Zusätzliche Security-Header setzen
const securityHeaders = createMiddleware(async (c: Context, next: Next) => {
    c.header('X-Content-Type-Options', 'nosniff');
    c.header('X-Frame-Options', 'SAMEORIGIN');
    await next();
});

app.use(secureHeaders(), cors(corsOptions), securityHeaders, compress());

// Routen registrieren
app.route(paths.rest, router);

const { NODE_ENV } = env;
if (NODE_ENV === 'development' || NODE_ENV === 'test') {
    app.route(paths.dev, devRouter);
}

if (logger.isLevelEnabled('debug')) {
    showRoutes(app, { verbose: true });
}

// Globaler Error-Handler
// oxlint-disable-next-line promise/prefer-await-to-callbacks
app.onError((error, c) => {
    if (error instanceof NotFoundError) {
        return c.notFound();
    }

    if (error.name === 'ZodError') {
        return createProblemDetails(
            c,
            unprocessableContent,
            (error as ZodError).issues,
        );
    }

    logger.error('Interner Fehler: %o', error);
    console.log(error.stack);
    return c.body('Interner Fehler', INTERNAL_SERVER_ERROR);
});
