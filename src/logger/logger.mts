import { parentLogger } from '../config/logger.mts';
import type pino from 'pino';

export const getLogger: (
    context: string,
    kind?: string,
) => pino.Logger<string> = (context: string, kind = 'class') => {
    const bindings: Record<string, string> = {};
    bindings[kind] = context;
    return parentLogger.child(bindings);
};
