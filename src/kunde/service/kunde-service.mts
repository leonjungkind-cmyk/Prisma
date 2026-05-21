import { type Prisma } from '../../generated/prisma/client.ts';
import { type KundeInclude } from '../../generated/prisma/models/Kunde.ts';
import { type Suchparameter, suchparameterNamen } from './suchparameter.mts';
import { NotFoundError } from './errors.mts';
import { type Pageable } from './pageable.mts';
import { type Slice } from './slice.mts';
import { buildWhere } from './where-builder.mts';
import { getLogger } from '../../logger/logger.mts';
import { prismaClient } from '../../config/prisma-client.mts';

type FindByIdParams = {
    readonly id: number;
};

export type KundeMitAdresse = Prisma.KundeGetPayload<{
    include: { adresse: true };
}>;

export class KundeService {
    static readonly ID_PATTERN = /^[1-9]\d{0,10}$/u;

    readonly #includeAdresse: KundeInclude = { adresse: true };

    readonly #logger = getLogger(KundeService.name);

    // Einen Kunden anhand seiner ID laden
    async findById({ id }: FindByIdParams): Promise<Readonly<KundeMitAdresse>> {
        this.#logger.debug('findById: id=%d', id);

        const kunde: KundeMitAdresse | null =
            await prismaClient.kunde.findUnique({
                where: { id },
                include: this.#includeAdresse,
            });
        if (kunde === null) {
            this.#logger.debug('Kein Kunde mit der ID %d gefunden', id);
            throw new NotFoundError(`Kein Kunde mit der ID ${id} gefunden.`);
        }

        this.#logger.debug('findById: kunde=%o', kunde);
        return kunde;
    }

    // Kunden mit optionalen Suchparametern und Paging suchen
    async find(
        suchparameter: Suchparameter | null,
        pageable: Pageable,
    ): Promise<Readonly<Slice<Readonly<KundeMitAdresse>>>> {
        this.#logger.debug(
            'find: suchparameter=%s, pageable=%o',
            JSON.stringify(suchparameter),
            pageable,
        );

        if (suchparameter === null) {
            return await this.#findAll(pageable);
        }
        const keys = Object.keys(suchparameter);
        if (keys.length === 0) {
            return await this.#findAll(pageable);
        }

        if (!this.#checkKeys(keys)) {
            this.#logger.debug('Ungueltige Suchparameter');
            throw new NotFoundError('Ungueltige Suchparameter');
        }

        const where = buildWhere(suchparameter);
        const { number, size } = pageable;
        const kunden: KundeMitAdresse[] = await prismaClient.kunde.findMany({
            where,
            skip: number * size,
            take: size,
            include: this.#includeAdresse,
        });
        if (kunden.length === 0) {
            this.#logger.debug('find: Keine Kunden gefunden');
            throw new NotFoundError(
                `Keine Kunden gefunden: ${JSON.stringify(suchparameter)}`,
            );
        }
        const totalElements = await this.count(where);
        return this.#createSlice(kunden, totalElements);
    }

    // Anzahl der Kunden zählen
    async count(where?: Prisma.KundeWhereInput) {
        this.#logger.debug('count: where=%o', where ?? 'undefined');
        const { count } = prismaClient.kunde;
        const anzahl =
            where === undefined ? await count() : await count({ where });
        this.#logger.debug('count: %d', anzahl);
        return anzahl;
    }

    async #findAll(
        pageable: Pageable,
    ): Promise<Readonly<Slice<KundeMitAdresse>>> {
        const { number, size } = pageable;
        const kunden: KundeMitAdresse[] = await prismaClient.kunde.findMany({
            skip: number * size,
            take: size,
            include: this.#includeAdresse,
        });
        if (kunden.length === 0) {
            this.#logger.debug('#findAll: Keine Kunden gefunden');
            throw new NotFoundError(`Ungueltige Seite "${number}"`);
        }
        const totalElements = await this.count();
        return this.#createSlice(kunden, totalElements);
    }

    #createSlice(
        kunden: KundeMitAdresse[],
        totalElements: number,
    ): Readonly<Slice<KundeMitAdresse>> {
        const kundeSlice: Slice<KundeMitAdresse> = {
            content: kunden,
            totalElements,
        };
        this.#logger.debug('#createSlice: kundeSlice=%o', kundeSlice);
        return kundeSlice;
    }

    #checkKeys(keys: string[]) {
        this.#logger.debug('#checkKeys: keys=%o', keys);
        let validKeys = true;
        keys.forEach((key) => {
            if (!suchparameterNamen.includes(key)) {
                this.#logger.debug(
                    '#checkKeys: ungueltiger Suchparameter "%s"',
                    key,
                );
                validKeys = false;
            }
        });
        return validKeys;
    }
}
