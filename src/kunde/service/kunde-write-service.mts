import { type Prisma } from '../../generated/prisma/client.ts';
import { prismaClient } from '../../config/prisma-client.mts';
import { getLogger } from '../../logger/logger.mts';
import { NotFoundError } from './errors.mts';

export type KundeCreate = Prisma.KundeCreateInput;

type KundeCreated = Prisma.KundeGetPayload<{
    include: {
        adresse: true;
        bestellungen: true;
    };
}>;

export type KundeUpdate = Prisma.KundeUpdateInput;

export type UpdateParams = {
    readonly id: number | undefined;
    readonly kunde: KundeUpdate;
};

type KundeUpdated = Prisma.KundeGetPayload<{}>;

export class KundeWriteService {
    readonly #logger = getLogger(KundeWriteService.name);

    async create(kunde: KundeCreate) {
        this.#logger.debug('create: kunde=%o', kunde);

        let kundeDb: KundeCreated | undefined;

        await prismaClient.$transaction(async (tx) => {
            kundeDb = await tx.kunde.create({
                data: kunde,
                include: {
                    adresse: true,
                    bestellungen: true,
                },
            });
        });

        this.#logger.debug('create: kundeDb.id=%s', kundeDb?.id);

        return kundeDb?.id ?? Number.NaN;
    }

    async update({ id, kunde }: UpdateParams) {
        this.#logger.debug('update: id=%s, kunde=%o', id, kunde);

        if (id === undefined) {
            throw new NotFoundError(`Es gibt keinen Kunden mit der ID ${id}.`);
        }

        let kundeUpdated: KundeUpdated | undefined;

        await prismaClient.$transaction(async (tx) => {
            kundeUpdated = await tx.kunde.update({
                data: kunde,
                where: {
                    id,
                },
            });
        });

        this.#logger.debug(
            'update: kundeUpdated=%s',
            JSON.stringify(kundeUpdated),
        );

        return kundeUpdated?.version ?? Number.NaN;
    }
}
