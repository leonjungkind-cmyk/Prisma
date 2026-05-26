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
import { NotFoundError } from './kunde/service/errors.mts';
import { getLogger } from './logger/logger.mts';

const INTERNAL_SERVER_ERROR = 500;
const UNPROCESSABLE_CONTENT = 422;

export const app = new Hono();

const logger = getLogger('app', 'file');

const securityHeaders = createMiddleware(async (c: Context, next: Next) => {
    c.header('X-Content-Type-Options', 'nosniff');
    c.header('X-Frame-Options', 'SAMEORIGIN');

    await next();
});

app.use(secureHeaders(), cors(corsOptions), securityHeaders, compress());

app.route(paths.rest, router);

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
        return c.json(
            {
                status: UNPROCESSABLE_CONTENT,
                title: 'Unprocessable Content',
                detail: 'Die Anfrage enthält ungültige Daten.',
                issues: error.issues,
            },
            UNPROCESSABLE_CONTENT,
        );
    }

    logger.error('Interner Fehler: %o', error);
    console.log(error.stack);

    return c.body('Interner Fehler', INTERNAL_SERVER_ERROR);
});
