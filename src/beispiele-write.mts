import { PrismaPg } from '@prisma/adapter-pg';
import process from 'node:process';
import { styleText } from 'node:util';
import { PrismaClient, type Prisma } from './generated/prisma/client.ts';

let message = styleText(
    'yellow',
    `process.env['DATABASE_URL']=${process.env['DATABASE_URL']}`,
);
console.log(message);
console.log();

const adapter = new PrismaPg({
    connectionString: process.env['DATABASE_URL_ADMIN'],
});

const log: (Prisma.LogLevel | Prisma.LogDefinition)[] = [
    {
        emit: 'event',
        level: 'query',
    },
    'info',
    'warn',
    'error',
];

// PrismaClient fuer DB "kunde" (siehe Umgebungsvariable DATABASE_URL in ".env")
// d.h. mit PostgreSQL-User "kunde" und Schema "kunde"
const prisma = new PrismaClient({
    adapter,
    errorFormat: 'pretty',
    log,
});
prisma.$on('query', (e) => {
    message = styleText('green', `Query: ${e.query}`);
    console.log(message);
    message = styleText('cyan', `Duration: ${e.duration} ms`);
    console.log(message);
});

const neuerKunde: Prisma.KundeCreateInput = {
    nachname: 'Mustermann',
    email: 'max.mustermann@beispiel.de',
    username: 'maxmustermann',
    version: 0,
    // 1:1-Beziehung
    adresse: {
        create: {
            strasse: 'Musterstrasse',
            hausnummer: '1',
            plz: '76133',
            ort: 'Karlsruhe',
        },
    },
    // 1:N-Beziehung
    bestellungen: {
        create: [
            {
                produktname: 'Beispielprodukt',
                menge: 1,
            },
        ],
    },
};
type KundeCreated = Prisma.KundeGetPayload<{
    include: {
        adresse: true;
        bestellungen: true;
    };
}>;

const geaenderterKunde: Prisma.KundeUpdateInput = {
    version: { increment: 1 },
    nachname: 'Geaendert',
    email: 'geaendert@beispiel.de',
    username: 'geaendert',
};
type KundeUpdated = Prisma.KundeGetPayload<{}>; // eslint-disable-line @typescript-eslint/no-empty-object-type

// Schreib-Operationen mit dem Model "Kunde"
try {
    await prisma.$connect();
    await prisma.$transaction(async (tx) => {
        // Neuer Datensatz mit generierter ID
        const kundeDb: KundeCreated = await tx.kunde.create({
            data: neuerKunde,
            include: { adresse: true, bestellungen: true },
        });
        message = styleText(['black', 'bgWhite'], 'Generierte ID:');
        console.log(`${message} ${kundeDb.id}`);
        console.log();

        // Version +1 wegen "Optimistic Locking" bzw. Vermeidung von "Lost Updates"
        const kundeUpdated: KundeUpdated = await tx.kunde.update({
            data: geaenderterKunde,
            where: { id: 30 },
        });
        // eslint-disable-next-line require-atomic-updates
        message = styleText(['black', 'bgWhite'], 'Aktualisierte Version:');
        console.log(`${message} ${kundeUpdated.version}`);
        console.log();

        // https://www.prisma.io/docs/orm/prisma-schema/data-model/relations/referential-actions#referential-action-defaults
        // https://www.prisma.io/docs/orm/prisma-schema/data-model/relations/relation-mode
        const geloescht = await tx.kunde.delete({ where: { id: 70 } });
        // eslint-disable-next-line require-atomic-updates
        message = styleText(['black', 'bgWhite'], 'Geloescht:');
        console.log(`${message} ${geloescht.id}`);
    });
} finally {
    await prisma.$disconnect();
}
