import { type PrettyOptions } from 'pino-pretty';
import { config } from './app.mts';
import { env } from './env.mts';
import pino from 'pino';
import { styleText } from 'node:util';

const { log } = config;
const pretty = log?.pretty === true;

export type LogLevel = 'error' | 'warn' | 'info' | 'debug';
let logLevelTmp: LogLevel = 'info';
if (env.LOG_LEVEL !== undefined) {
    logLevelTmp = env.LOG_LEVEL as LogLevel;
} else if (log?.level !== undefined) {
    logLevelTmp = log?.level as LogLevel;
}
export const logLevel = logLevelTmp;

const message = styleText(['black', 'bgWhite'], 'logger config:');
console.log(`${message} logLevel=${logLevel}, pretty=${pretty}`);

const prettyOptions: PrettyOptions = {
    translateTime: 'SYS:standard',
    singleLine: true,
    colorize: true,
    ignore: 'pid,hostname',
};
const prettyTransportOptions = {
    level: logLevel,
    target: 'pino-pretty',
    options: prettyOptions,
};

export const parentLogger: pino.Logger<string> = pretty
    ? pino({ level: logLevel }, pino.transport(prettyTransportOptions))
    : pino({ level: logLevel });
