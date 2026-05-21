// Fehlerklassen für die Kundenverwaltung

// Kein Kunde mit der gesuchten ID gefunden
export class NotFoundError extends Error {}

// Ungültige Versionsnummer beim Ändern
export class VersionInvalidError extends Error {
    readonly version: string | undefined;

    constructor(version: string | undefined) {
        super(`Die Versionsnummer ${version} ist ungueltig.`);
        this.version = version;
    }
}

// Veraltete Versionsnummer beim Ändern
export class VersionOutdatedError extends Error {
    readonly version: number;

    constructor(version: number) {
        super(`Die Versionsnummer ${version} ist nicht aktuell.`);
        this.version = version;
    }
}
