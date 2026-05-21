import { URL } from 'node:url';
import { styleText } from 'node:util';

export const resourcesURL = new URL('resources/', import.meta.url);
const message = styleText(['black', 'bgWhite'], 'resourcesURL:');
console.log(`${message} ${resourcesURL}`);
