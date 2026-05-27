import type { HonoRequest } from 'hono';

export const createBaseUrl = (req: HonoRequest) => {
    const url = new URL(req.url);

    return `${url.protocol}//${url.host}${url.pathname}`;
};
