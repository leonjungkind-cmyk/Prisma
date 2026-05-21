import { Prisma } from '../../generated/prisma/client.ts';
import { type KundeWhereInput } from '../../generated/prisma/models/Kunde.ts';
import { type Suchparameter } from './suchparameter.mts';
import { getLogger } from '../../logger/logger.mts';

const logger = getLogger('buildWhere', 'func');

// WHERE-Klausel für die Kundensuche aus den Suchparametern bauen
export const buildWhere = (suchparameter: Suchparameter) => {
    logger.debug('buildWhere: suchparameter=%o', suchparameter);

    const where: KundeWhereInput = {};

    Object.entries(suchparameter).forEach(([key, value]) => {
        switch (key) {
            case 'nachname':
                where.nachname = {
                    contains: value,
                    mode: Prisma.QueryMode.insensitive,
                };
                break;
            case 'email':
                where.email = { equals: value };
                break;
            case 'username':
                where.username = {
                    contains: value,
                    mode: Prisma.QueryMode.insensitive,
                };
                break;
            default:
                break;
        }
    });

    logger.debug('buildWhere: where=%o', where);
    return where;
};
