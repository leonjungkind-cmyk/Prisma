// Erlaubte Suchparameter für die Kundensuche
export type Suchparameter = {
    readonly nachname?: string;
    readonly email?: string;
    readonly username?: string;
};

// Gültige Namen für die Suchparameter
export const suchparameterNamen = [
    'nachname',
    'email',
    'username',
];
