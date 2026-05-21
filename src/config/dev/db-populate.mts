import { PrismaClient } from '../../generated/prisma/client.ts';
import { PrismaPg } from '@prisma/adapter-pg';
import { URL } from 'node:url';
import { adapter } from '../prisma-client.mts';
import { config } from '../app.mts';
import { getLogger } from '../../logger/logger.mts';
import process from 'node:process';
import { readFile } from 'node:fs/promises';
import { resourcesURL } from '../resources.mts';

export class DbPopulateService {
    readonly #dbPopulate = config.db?.populate === true;

    readonly #dbURL = new URL('postgresql/', resourcesURL);

    readonly #prisma: PrismaClient;

    readonly #prismaAdmin: PrismaClient;

    readonly #logger = getLogger(DbPopulateService.name);

    constructor() {
        // Prisma-Client für den normalen DB-Zugriff
        this.#prisma = new PrismaClient({ adapter, errorFormat: 'pretty' });

        // Separater Admin-Client für COPY-Befehle
        const adapterAdmin = new PrismaPg({
            connectionString: process.env['DATABASE_URL_ADMIN'],
        });
        this.#prismaAdmin = new PrismaClient({
            adapter: adapterAdmin,
            errorFormat: 'pretty',
        });
    }

    async populate() {
        if (!this.#dbPopulate) {
            return;
        }

        const dropScript = new URL('drop-table.sql', this.#dbURL);
        this.#logger.debug('dropScript = %s', dropScript);
        const dropStatements = await readFile(dropScript, 'utf8');

        const createScript = new URL('create-table.sql', this.#dbURL);
        this.#logger.debug('createScript = %s', createScript);
        const createStatements = await readFile(createScript, 'utf8');

        const copyScript = new URL('copy-csv.sql', this.#dbURL);
        this.#logger.debug('copyScript = %s', copyScript);
        const copyStatements = await readFile(copyScript, 'utf8');

        await this.#prisma.$connect();
        await this.#prisma.$transaction(async (tx) => {
            await tx.$executeRawUnsafe(dropStatements);
            await tx.$executeRawUnsafe(createStatements);
        });
        await this.#prisma.$disconnect();

        // COPY erfordert Admin-Rechte für CSV-Import
        await this.#prismaAdmin.$connect();
        await this.#prismaAdmin.$transaction(async (tx) => {
            await tx.$executeRawUnsafe(copyStatements);
        });
        await this.#prismaAdmin.$disconnect();
    }
}
