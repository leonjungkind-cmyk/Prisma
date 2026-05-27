import { type Prisma } from '../../generated/prisma/client.ts';
import { getLogger } from '../../logger/logger.mts';
import { prismaClient } from '../../config/prisma-client.mts';

export type KundeCreate = Prisma.KundeCreateInput;

type KundeCreated = Prisma.KundeGetPayload<{
    include: {
        adresse: true;
        bestellungen: true;
    };
}>;

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
}
