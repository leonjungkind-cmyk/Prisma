import process from 'node:process';

export default async function setupGlobal() {
    // Testmodus fuer die Integrationstests aktivieren
    process.env['NODE_ENV'] = 'test';

    // Gemeinsame Konstanten einmal laden
    await import('./constants.mjs');
}
