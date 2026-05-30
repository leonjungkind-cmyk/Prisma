import { Hono } from 'hono';

import { container } from '../container.mts';
import { getLogger } from '../logger/logger.mts';

export const router = new Hono();

const { keycloakService } = container;

const logger = getLogger('auth-router', 'file');

router.post('/token', async (c) => {
    const body = await c.req.json();

    logger.debug('token: body=%o', body);

    const username = body.username as string;
    const password = body.password as string;

    const token = await keycloakService.token(username, password);

    return c.json(token);
});
