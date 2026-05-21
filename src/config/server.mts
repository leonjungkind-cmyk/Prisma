import { URL } from 'node:url';
import { config } from './app.mts';
import { env } from './env.mts';
import { getLogger } from '../logger/logger.mts';
import { hostname } from 'node:os';
import { readFile } from 'node:fs/promises';
import { resourcesURL } from './resources.mts';

const logger = getLogger('config/server', 'file');

const { NODE_ENV } = env;

const computername = hostname();
const { server } = config;
if (
    typeof server === 'object' &&
    (typeof server.port !== 'number' || typeof server.portHttp !== 'number')
) {
    throw new TypeError('Ein konfigurierter Port ist keine Zahl');
}
const port = (server?.port as number | undefined) ?? 3000; // oxlint-disable-line no-magic-numbers
logger.debug('port = %d', port);
const portHttp = (server?.portHttp as number | undefined) ?? 3030; // oxlint-disable-line no-magic-numbers
logger.debug('portHttp = %d', portHttp);

const tlsURL = new URL('tls/', resourcesURL);
logger.debug('tlsURL = %s', tlsURL);

const key = await readFile(new URL('key.pem', tlsURL), { encoding: 'utf8' });
const cert = await readFile(new URL('certificate.crt', tlsURL), {
    encoding: 'utf8',
});

export type NodeEnv =
    | 'development'
    | 'PRODUCTION'
    | 'production'
    | 'test'
    | undefined;

type ServerConfig = {
    host: string;
    port: number;
    portHttp: number;
    key: string;
    cert: string;
    nodeEnv: NodeEnv;
};

export const serverConfig: ServerConfig = {
    host: computername,
    port,
    portHttp,
    key,
    cert,
    nodeEnv: NODE_ENV as NodeEnv,
} as const;
