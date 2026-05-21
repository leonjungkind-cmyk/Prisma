import { Hono } from 'hono';
import { container } from '../../container.mts';

// Endpunkt zum manuellen Neuladen der DB im Entwicklungsmodus
export const router = new Hono();

router.post('/db_populate', async (c) => {
    await container.dbPopulateService.populate();
    return c.json({ db_populate: 'ok' });
});
