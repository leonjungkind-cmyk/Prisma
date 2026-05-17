import { app } from './app.mts';

Bun.serve({
    port: 3000,
    fetch: app.fetch,
});

console.log('Server läuft auf Port 3000');
