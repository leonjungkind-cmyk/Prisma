import { z } from 'zod';

const AdresseSchema = z
    .object({
        strasse: z.string().trim().min(1),
        hausnummer: z.string().trim().min(1),
        plz: z.string().trim().regex(/^\d{5}$/u),
        ort: z.string().trim().min(1),
    })
    .strict();

const BestellungSchema = z
    .object({
        produktname: z.string().trim().min(1),
        menge: z.number().int().positive(),
    })
    .strict();

export const KundeNeuSchema = z
    .object({
        nachname: z.string().trim().min(1),
        email: z.email(),
        username: z.string().trim().min(1).optional().nullable(),
        adresse: AdresseSchema.optional(),
        bestellungen: z.array(BestellungSchema).optional(),
    })
    .strict();

export type KundeNeuType = z.infer<typeof KundeNeuSchema>;

export const KundeUpdateSchema = z
    .object({
        nachname: z.string().trim().min(1),
        email: z.email(),
        username: z.string().trim().min(1).optional().nullable(),
        adresse: AdresseSchema.optional(),
        bestellungen: z.array(BestellungSchema).optional(),
    })
    .strict();

export type KundeUpdateType = z.infer<typeof KundeUpdateSchema>;
