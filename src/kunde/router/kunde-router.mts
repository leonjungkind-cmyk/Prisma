import { Hono } from 'hono';
import { container } from '../../container.mts';
import { createPage } from './page.mts';
import { createPageable } from '../service/pageable.mts';
import { getLogger } from '../../logger/logger.mts';

const { kundeService } = container;

export const router = new Hono();

const logger = getLogger('kunde-router', 'file');

// Suche per ID
router.get('/:id', async (c) => {
    const { req } = c;
    const accept = req.header('Accept')?.toLowerCase() ?? '*/*';
    if (accept !== '*/*' && !/(json|html)/u.test(accept)) {
        logger.debug('get: Accept=%s', accept);
        return c.body(null, 406);
    }

    const id = req.param('id');
    logger.debug('get: id=%s', id);
    const idNumber = Number.parseInt(id, 10);
    if (Number.isNaN(idNumber)) {
        return c.notFound();
    }

    // Bestellungen immer mitladen
    const kunde = await kundeService.findById({
        id: idNumber,
        mitBestellungen: true,
    });

    // ETag für Caching
    const ifNonMatch = req.header('If-None-Match');
    const { version } = kunde;
    if (ifNonMatch === `"${version}"`) {
        logger.debug('get: Not Modified');
        return c.body(null, 304);
    }

    logger.debug('get: version=%d', version);
    const { header, json } = c;
    header('ETag', `"${version}"`);

    logger.debug('get: %o', kunde);
    return json(kunde);
});

// Suche mit Query-Parametern
router.get('/', async (c) => {
    const { req } = c;
    const accept = req.header('Accept')?.toLowerCase() ?? '*/*';
    if (accept !== '*/*' && !/(json|html)/u.test(accept)) {
        logger.debug('get: Accept=%s', accept);
        return c.body(null, 406);
    }

    const queryParams = req.query();
    logger.debug('get: queryParams=%o', queryParams);
    const countOnly = queryParams['count-only'];
    if (countOnly !== undefined) {
        const count = await kundeService.count();
        logger.debug('get: count=%d', count);
        return c.json({ count });
    }

    const { page, size } = queryParams;
    delete queryParams['page'];
    delete queryParams['size'];
    logger.debug(
        'get: page=%s, size=%s, queryParams=%o',
        page,
        size,
        queryParams,
    );

    const pageable = createPageable({ number: page, size });
    const kundenSlice = await kundeService.find(queryParams, pageable);
    const kundePage = createPage(kundenSlice, pageable);
    logger.debug('get: kundePage=%o', kundePage);
    return c.json(kundePage);
});
