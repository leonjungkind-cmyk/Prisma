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
import { paths } from './config/paths.mts';
import { router } from './kunde/router/kunde-router.mts';
import { secureHeaders } from 'hono/secure-headers';
import { showRoutes } from 'hono/dev';

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
    return c.body('Interner Fehler', 500);
});
