import { KundeService } from './kunde/service/kunde-service.mts';
import { KundeWriteService } from './kunde/service/kunde-write-service.mts';
import { DbPopulateService } from './config/dev/db-populate.mts';
import { KeycloakService } from './security/keycloak-service.mts';

// Zentraler Container für Service-Singletons
export const container = {
    kundeService: new KundeService(),
    kundeWriteService: new KundeWriteService(),
    dbPopulateService: new DbPopulateService(),
    keycloakService: new KeycloakService(),
};
