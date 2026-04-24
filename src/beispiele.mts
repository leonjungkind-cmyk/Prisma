import { PrismaPg } from '@prisma/adapter-pg';
import { prismaQueryInsights } from '@prisma/sqlcommenter-query-insights';
import process from 'node:process';
import { styleText } from 'node:util';
import {
    PrismaClient,
    type Kunde,
    type Prisma,
} from './generated/prisma/client.ts';

let message = styleText(['black', 'bgWhite'], 'Node version');
console.log(`${message}=${process.version}`);
message = styleText(['black', 'bgWhite'], 'DATABASE_URL');
console.log(`${message}=${process.env['DATABASE_URL']}`);
console.log();

// "named parameter" durch JSON-Objekt
const adapter = new PrismaPg({
    connectionString: process.env['DATABASE_URL'],
});

// union type
const log: (Prisma.LogLevel | Prisma.LogDefinition)[] = [
    {
        // siehe unten: prisma.$on('query', ...);
        emit: 'event',
        level: 'query',
    },
    'info',
    'warn',
    'error',
];

// PrismaClient passend zur Umgebungsvariable DATABASE_URL in ".env"
// d.h. mit PostgreSQL-User "kunde" und Schema "kunde"
const prisma = new PrismaClient({
    // shorthand property
    adapter,
    errorFormat: 'pretty',
    log,
    // Kommentar zu Log-Ausgabe:
    // /*prismaQuery='Kunde.findMany%3A...
    comments: [prismaQueryInsights()],
});
prisma.$on('query', (e) => {
    message = styleText('green', `Query: ${e.query}`);
    console.log(message);
    message = styleText('cyan', `Duration: ${e.duration} ms`);
    console.log(message);
});

export type KundeMitAdresseUndBestellungen = Prisma.KundeGetPayload<{
    include: {
        adresse: true;
        bestellungen: true;
    };
}>;

// Operationen mit dem Model "Kunde"
try {
    await prisma.$connect();

    // Das Resultat ist null, falls kein Datensatz gefunden
    const kunde: Kunde | null = await prisma.kunde.findUnique({
        where: { id: 1 },
    });
    message = styleText(['black', 'bgWhite'], 'kunde');
    console.log(`${message} = %j`, kunde);
    console.log();

    // SELECT *
    // FROM   kunde
    // JOIN   adresse ON kunde.id = adresse.kunde_id
    // WHERE  kunde.nachname LIKE "%n%"
    const kunden: KundeMitAdresseUndBestellungen[] = await prisma.kunde.findMany({
        where: {
            nachname: {
                // https://www.prisma.io/docs/orm/prisma-client/queries/filtering-and-sorting#filter-conditions-and-operators
                contains: 'n',
            },
        },
        // Fetch-Join mit Adresse und Bestellungen
        include: {
            adresse: true,
            bestellungen: true,
        },
    });
    message = styleText(['black', 'bgWhite'], 'kundenMitBestellungen');
    console.log(`${message} = %j`, kunden);
    console.log();

    // higher-order function und arrow function
    const bestellungen = kunden.map((k) => k.bestellungen);
    message = styleText(['black', 'bgWhite'], 'bestellungen');
    console.log(`${message} = %j`, bestellungen);
    console.log();

    // union type
    const adressen = kunden.map((k) => k.adresse?.ort);
    message = styleText(['black', 'bgWhite'], 'adressen');
    console.log(`${message} = %j`, adressen);
    console.log();

    // Pagination
    const kundenPage2: Kunde[] = await prisma.kunde.findMany({
        skip: 5,
        take: 5,
    });
    message = styleText(['black', 'bgWhite'], 'kundenPage2');
    console.log(`${message} = %j`, kundenPage2);
    console.log();
} finally {
    await prisma.$disconnect();
}

// PrismaClient mit PostgreSQL-User "postgres", d.h. mit Administrationsrechten
const adapterAdmin = new PrismaPg({
    connectionString: process.env['DATABASE_URL_ADMIN'],
});
const prismaAdmin = new PrismaClient({ adapter: adapterAdmin });
try {
    const kundenAdmin: Kunde[] = await prismaAdmin.kunde.findMany({
        where: {
            nachname: {
                contains: 'n',
            },
        },
    });
    message = styleText(['black', 'bgWhite'], 'kundenAdmin');
    console.log(`${message} = ${JSON.stringify(kundenAdmin)}`);
} finally {
    await prismaAdmin.$disconnect();
}
