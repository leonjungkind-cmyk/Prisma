import process from 'node:process';
import { styleText } from 'node:util';

const { NODE_ENV, CLIENT_SECRET, LOG_LEVEL } = process.env;

export type EnvType = {
    NODE_ENV: string | undefined;
    CLIENT_SECRET: string | undefined;
    LOG_LEVEL: string | undefined;
};

export const env: EnvType = {
    NODE_ENV,
    CLIENT_SECRET,
    LOG_LEVEL,
} as const;

const message = styleText(['black', 'bgWhite'], 'NODE_ENV:');
console.log(`${message} ${NODE_ENV}`);
