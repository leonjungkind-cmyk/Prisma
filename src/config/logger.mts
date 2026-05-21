import { type PrettyOptions } from 'pino-pretty';
import { config } from './app.mts';
import { env } from './env.mts';
import pino from 'pino';
import { resolve } from 'node:path';
import { styleText } from 'node:util';

const logDirDefault = '/tmp';
const logFileNameDefault = 'server.log';
const logFileDefault = resolve(logDirDefault, logFileNameDefault);

const { log } = config;

if (typeof log?.dir !== 'string') {
    console.debug(`log.dir=${log.dir}`);
    throw new TypeError('Das konfigurierte Log-Verzeichnis ist kein String');
}

const logDir: string | null =
    (log?.dir as string | undefined) === undefined ? null : log.dir.trimEnd();
const logFile =
    logDir === null ? logFileDefault : resolve(logDir, logFileNameDefault);
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
console.log(
    `${message} logLevel=${logLevel}, logFile=${logFile}, pretty=${pretty}`,
);

const fileOptions = {
    level: logLevel,
    target: 'pino/file',
    options: { destination: logFile },
};
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

const options: pino.TransportMultiOptions | pino.TransportSingleOptions = pretty
    ? { targets: [fileOptions, prettyTransportOptions] }
    : { targets: [fileOptions] };
const transports = pino.transport(options);

export const parentLogger: pino.Logger<string> = pino(
    { level: logLevel },
    transports,
);
