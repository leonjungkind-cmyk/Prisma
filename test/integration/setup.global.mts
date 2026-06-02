import process from 'node:process';

export default async function setupGlobal() {
    process.env['NODE_ENV'] = 'test';

    await import('./constants.mjs');
}
