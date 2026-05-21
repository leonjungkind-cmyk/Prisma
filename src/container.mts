import { KundeService } from './kunde/service/kunde-service.mts';

const kundeService = new KundeService();

// Zentraler Container für Service-Singletons (manuelle Dependency Injection)
export const container = {
    kundeService,
};
