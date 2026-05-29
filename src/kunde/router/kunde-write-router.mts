import { Hono } from 'hono';

import { container } from '../../container.mts';
import { getLogger } from '../../logger/logger.mts';
import { createBaseUrl } from './create-base-url.mts';
import { KundeNeuSchema, type KundeNeuType } from './kunde-validation.mts';
import {
    type KundeCreate,
    type KundeUpdate,
} from '../service/kunde-write-service.mts';

const { kundeWriteService } = container;

export const router = new Hono();

const logger = getLogger('kunde-write-router', 'file');

const kundeDtoToKundeCreateInput = (
    kundeDTO: KundeNeuType,
): KundeCreate => {
    const kunde: KundeCreate = {
        version: 0,
        nachname: kundeDTO.nachname,
        email: kundeDTO.email,
        username: kundeDTO.username ?? null,
    };

    if (kundeDTO.adresse !== undefined) {
        kunde.adresse = {
            create: {
                strasse: kundeDTO.adresse.strasse,
                hausnummer: kundeDTO.adresse.hausnummer,
                plz: kundeDTO.adresse.plz,
                ort: kundeDTO.adresse.ort,
            },
        };
    }

    if (kundeDTO.bestellungen !== undefined) {
        kunde.bestellungen = {
            create: kundeDTO.bestellungen.map((bestellungDTO) => ({
                produktname: bestellungDTO.produktname,
                menge: bestellungDTO.menge,
            })),
        };
    }

    return kunde;
};

router.post('/', async (c) => {
    const requestBody = await c.req.json();

    const kundeDTO = KundeNeuSchema.parse(requestBody);

    logger.debug('post: kundeDTO=%o', kundeDTO);

    const kunde = kundeDtoToKundeCreateInput(kundeDTO);

    const id = await kundeWriteService.create(kunde);

    const location = `${createBaseUrl(c.req)}/${id}`;

    c.header('Location', location);

    return c.body(null, 201);
});

const kundeDtoToKundeUpdateInput = (
    kundeDTO: KundeNeuType,
): KundeUpdate => {
    const kunde: KundeUpdate = {
        nachname: kundeDTO.nachname,
        email: kundeDTO.email,
        username: kundeDTO.username ?? null,
    };

    if (kundeDTO.adresse !== undefined) {
        kunde.adresse = {
            upsert: {
                create: {
                    strasse: kundeDTO.adresse.strasse,
                    hausnummer: kundeDTO.adresse.hausnummer,
                    plz: kundeDTO.adresse.plz,
                    ort: kundeDTO.adresse.ort,
                },
                update: {
                    strasse: kundeDTO.adresse.strasse,
                    hausnummer: kundeDTO.adresse.hausnummer,
                    plz: kundeDTO.adresse.plz,
                    ort: kundeDTO.adresse.ort,
                },
            },
        };
    }

    if (kundeDTO.bestellungen !== undefined) {
        kunde.bestellungen = {
            deleteMany: {},
            create: kundeDTO.bestellungen.map((bestellungDTO) => ({
                produktname: bestellungDTO.produktname,
                menge: bestellungDTO.menge,
            })),
        };
    }

    return kunde;
};

router.put('/:id', async (c) => {
    const id = c.req.param('id');
    logger.debug('put: id=%s', id);

    const idNumber = Number.parseInt(id, 10);

    if (Number.isNaN(idNumber)) {
        return c.notFound();
    }

    const requestBody = await c.req.json();

    const kundeDTO = KundeNeuSchema.parse(requestBody);

    logger.debug('put: kundeDTO=%o', kundeDTO);

    const kunde = kundeDtoToKundeUpdateInput(kundeDTO);

    const neueVersion = await kundeWriteService.update({
        id: idNumber,
        kunde,
    });

    logger.debug('put: neueVersion=%d', neueVersion);

    c.header('ETag', `"${neueVersion}"`);

    return c.body(null, 204);
});
