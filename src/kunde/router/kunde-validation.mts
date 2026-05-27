import { z } from 'zod';

export const KundeNeuSchema = z.object({
    nachname: z.string().min(1),
    email: z.email(),
    username: z.string().min(1).optional().nullable(),

    adresse: z
        .object({
            strasse: z.string().min(1),
            hausnummer: z.string().min(1),
            plz: z.string().min(1),
            ort: z.string().min(1),
        })
        .optional(),

    bestellungen: z
        .array(
            z.object({
                produktname: z.string().min(1),
                menge: z.number().int().positive(),
            }),
        )
        .optional(),
});

export type KundeNeuType = z.infer<typeof KundeNeuSchema>;
