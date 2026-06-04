import { paths } from '../../src/config/paths.mts';
import { serverConfig } from '../../src/config/server.mts';

const { host, port } = serverConfig;

export const baseURL = `https://${host}:${port}`;

export const restURL = `${baseURL}${paths.rest}`;
export const authURL = `${baseURL}${paths.auth}`;
export const tokenPath = `${paths.auth}${paths.token}`;
export const tokenURL = `${baseURL}${tokenPath}`;

export const POST = 'POST';
export const PUT = 'PUT';
export const DELETE = 'DELETE';

export const ACCEPT = 'Accept';
export const CONTENT_TYPE = 'Content-Type';
export const LOCATION = 'Location';
export const IF_NONE_MATCH = 'If-None-Match';
export const IF_MATCH = 'If-Match';
export const AUTHORIZATION = 'Authorization';

export const APPLICATION_JSON = 'application/json';
export const X_WWW_FORM_URL_ENCODED = 'application/x-www-form-urlencoded';
export const BEARER = 'Bearer';

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
