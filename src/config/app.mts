import { parse } from 'smol-toml';
import { readFile } from 'node:fs/promises';
import { resourcesURL } from './resources.mts';

export type AppConfig = Record<
    'server' | 'db' | 'keycloak' | 'log' | 'health' | 'mail',
    any
>;

const appUrl = new URL('app.toml', resourcesURL);
const appText = await readFile(appUrl, { encoding: 'utf8' });
// alternativ: Bun.TOML.parse()
export const config = parse(appText) as AppConfig;
