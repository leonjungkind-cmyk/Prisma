import { paths } from '../../src/config/paths.mts';
import { serverConfig } from '../../src/config/server.mts';

// Gemeinsame URLs und IDs fuer die Integrationstests
export const baseURL = `https://localhost:${serverConfig.port}`;
export const restURL = new URL(paths.rest, baseURL).toString();
export const authURL = new URL(paths.auth, baseURL).toString();
export const tokenURL = new URL(`${paths.auth}${paths.token}`, baseURL).toString();

export const adminCredentials = {
    username: 'admin',
    password: 'p',
} as const;

export const userCredentials = {
    username: 'user',
    password: 'p',
} as const;

export const existingIds = [1, 20] as const;
export const getNotFoundId = '999999';
export const putExistingId = '30';
export const deleteExistingId = '50';
