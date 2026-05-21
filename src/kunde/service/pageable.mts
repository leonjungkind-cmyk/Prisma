export const DEFAULT_PAGE_SIZE = 5;
export const MAX_PAGE_SIZE = 100;
export const DEFAULT_PAGE_NUMBER = 0;

export type Pageable = {
    // Seitennummer, Zählung ab 0
    readonly number: number;
    // Maximale Datensätze pro Seite
    readonly size: number;
};

export type PageableProps = {
    readonly number?: string | undefined;
    readonly size?: string | undefined;
};

// Pageable-Objekt aus Query-Parametern erstellen
export const createPageable = ({ number, size }: PageableProps): Pageable => {
    const numberFloat = Number(number);
    let numberInt: number;
    if (Number.isNaN(numberFloat) || !Number.isInteger(numberFloat)) {
        numberInt = DEFAULT_PAGE_NUMBER;
    } else {
        numberInt = numberFloat - 1;
        if (numberInt < 0) {
            numberInt = DEFAULT_PAGE_NUMBER;
        }
    }

    const sizeFloat = Number(size);
    let sizeInt: number;
    if (Number.isNaN(sizeFloat) || !Number.isInteger(sizeFloat)) {
        sizeInt = DEFAULT_PAGE_SIZE;
    } else {
        sizeInt = sizeFloat;
        if (sizeInt < 1 || sizeInt > MAX_PAGE_SIZE) {
            sizeInt = DEFAULT_PAGE_SIZE;
        }
    }

    return { number: numberInt, size: sizeInt };
};
