import { type Prisma } from '../../generated/prisma/client.ts';
import { prismaClient } from '../../config/prisma-client.mts';
import { getLogger } from '../../logger/logger.mts';
import {
    EmailExistsError,
    NotFoundError,
    UsernameExistsError,
    VersionInvalidError,
    VersionOutdatedError,
} from './errors.mts';

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
    readonly version: string;
};

type KundeUpdated = Prisma.KundeGetPayload<{}>;

export class KundeWriteService {
    private static readonly VERSION_PATTERN = /^"\d+"/u;

    readonly #logger = getLogger(KundeWriteService.name);

    async create(kunde: KundeCreate) {
        this.#logger.debug('create: kunde=%o', kunde);

        await this.#validateCreate(kunde);

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

    async update({ id, kunde, version }: UpdateParams) {
        this.#logger.debug(
            'update: id=%s, kunde=%o, version=%s',
            id,
            kunde,
            version,
        );

        if (id === undefined) {
            throw new NotFoundError(`Es gibt keinen Kunden mit der ID ${id}.`);
        }

        await this.#validateUpdate(id, kunde, version);

        kunde.version = {
            increment: 1,
        };

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

    async delete(id: number) {
        this.#logger.debug('delete: id=%d', id);

        const kunde = await prismaClient.kunde.findUnique({
            where: {
                id,
            },
        });

        if (kunde === null) {
            this.#logger.debug('delete: not found');
            return false;
        }

        await prismaClient.$transaction(async (tx) => {
            await tx.kunde.delete({
                where: {
                    id,
                },
            });
        });

        this.#logger.debug('delete');
        return true;
    }

    async #validateCreate(kunde: KundeCreate) {
        this.#logger.debug('#validateCreate: email=%s', kunde.email);

        const anzahlEmail = await prismaClient.kunde.count({
            where: {
                email: kunde.email,
            },
        });

        if (anzahlEmail > 0) {
            throw new EmailExistsError(kunde.email);
        }

        if (kunde.username !== null && kunde.username !== undefined) {
            const anzahlUsername = await prismaClient.kunde.count({
                where: {
                    username: kunde.username,
                },
            });

            if (anzahlUsername > 0) {
                throw new UsernameExistsError(kunde.username);
            }
        }
    }

    async #validateUpdate(
        id: number,
        kunde: KundeUpdate,
        versionStr: string,
    ) {
        this.#logger.debug(
            '#validateUpdate: id=%d, versionStr=%s',
            id,
            versionStr,
        );

        if (!KundeWriteService.VERSION_PATTERN.test(versionStr)) {
            throw new VersionInvalidError(versionStr);
        }

        const version = Number.parseInt(versionStr.slice(1, -1), 10);

        const kundeDb = await prismaClient.kunde.findUnique({
            where: {
                id,
            },
        });

        if (kundeDb === null) {
            throw new NotFoundError(`Es gibt keinen Kunden mit der ID ${id}.`);
        }

        if (version < kundeDb.version) {
            throw new VersionOutdatedError(version);
        }

        if (typeof kunde.email === 'string') {
            const anzahlEmail = await prismaClient.kunde.count({
                where: {
                    email: kunde.email,
                    NOT: {
                        id,
                    },
                },
            });

            if (anzahlEmail > 0) {
                throw new EmailExistsError(kunde.email);
            }
        }

        if (typeof kunde.username === 'string') {
            const anzahlUsername = await prismaClient.kunde.count({
                where: {
                    username: kunde.username,
                    NOT: {
                        id,
                    },
                },
            });

            if (anzahlUsername > 0) {
                throw new UsernameExistsError(kunde.username);
            }
        }
    }
}
