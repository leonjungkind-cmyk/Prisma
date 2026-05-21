import { PrismaClient } from '../generated/prisma/client.ts';
import { PrismaPg } from '@prisma/adapter-pg';
import { getLogger } from '../logger/logger.mts';
import { prismaQueryInsights } from '@prisma/sqlcommenter-query-insights';
import process from 'node:process';
import { styleText } from 'node:util';

const logger = getLogger('prisma-client', 'file');

// Datenbankverbindung über DATABASE_URL aus der .env
// PostgreSQL-User "kunde", Schema "kunde"
export const adapter = new PrismaPg({
    connectionString: process.env['DATABASE_URL'],
});

let tmpClient: PrismaClient;

// Im Debug-Modus: Query-Logging aktivieren
if (logger.isLevelEnabled('debug')) {
    const debugClient = new PrismaClient({
        adapter,
        errorFormat: 'pretty',
        log: [
            {
                emit: 'event',
                level: 'query',
            },
            'info',
            'warn',
            'error',
        ],
        comments: [prismaQueryInsights()],
    });

    // Jeden SQL-Query direkt in der Konsole ausgeben
    debugClient.$on('query', (event) => {
        const message = styleText(['black', 'bgWhite'], 'Query:');
        console.log(`${message} ${event.query}`);
    });

    tmpClient = debugClient;
} else {
    // Produktivbetrieb: schlanker Client ohne Query-Logging
    const prodClient = new PrismaClient({ adapter });
    tmpClient = prodClient;
}

// Zentraler Prisma-Client für alle Services
export const prismaClient = tmpClient;

// Verbindung zur Datenbank aufbauen
export const connectDB = async () => {
    await prismaClient.$connect();
    logger.info('Verbindung mit der DB ist hergestellt.');
};

// Verbindung zur Datenbank trennen
export const disconnectDB = async () => {
    await prismaClient.$disconnect();
    logger.info('Verbindung mit der DB ist getrennt.');
};
