import { catalog } from "./catalog-data";
import { packagingCatalog } from "./packaging-data";
// Packaging participates in commerce, while the INCI library stays ingredient-only.
export const commerceCatalog = [...catalog, ...packagingCatalog];
