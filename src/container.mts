import { KundeService } from './kunde/service/kunde-service.mts';
import { DbPopulateService } from './config/dev/db-populate.mts';

const kundeService = new KundeService();

// Zentraler Container für Service-Singletons
export const container = {
    kundeService,
    dbPopulateService: new DbPopulateService(),
};
