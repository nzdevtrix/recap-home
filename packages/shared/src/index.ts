export enum UserRole {
  PRIVATE = 'PRIVATE',
  RIDER = 'RIDER',
  BUSINESS = 'BUSINESS',
  DEVELOPER = 'DEVELOPER',
  SYSTEM_OPERATOR = 'SYSTEM_OPERATOR',
  CUSTOMER_CARE = 'CUSTOMER_CARE',
  REGIONAL_OPERATOR = 'REGIONAL_OPERATOR',
  LOCAL_RIDER_MONITOR = 'LOCAL_RIDER_MONITOR'
}

export enum OrderStatus {
  PENDING = 'PENDING',
  ASSIGNED = 'ASSIGNED',
  PICKED_UP = 'PICKED_UP',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export enum BusinessLegalType {
  INDIVIDUALE = 'INDIVIDUALE',
  SNC = 'SNC',
  SAS = 'SAS',
  SRL = 'SRL',
  SRLS = 'SRLS',
  SPA = 'SPA',
  SAPA = 'SAPA',
  COOPERATIVA = 'COOPERATIVA',
  CONSORZIO = 'CONSORZIO',
  ONLUS = 'ONLUS',
  FREELANCE = 'FREELANCE',
  ALTRO = 'ALTRO'
}

export enum BusinessCategory {
  RISTORAZIONE = 'RISTORAZIONE',
  FAST_FOOD = 'FAST_FOOD',
  BAR = 'BAR',
  GELATERIA = 'GELATERIA',
  PASTICCERIA = 'PASTICCERIA',
  PANIFICIO = 'PANIFICIO',
  RISTORANTE = 'RISTORANTE',
  PIZZERIA = 'PIZZERIA',
  RISTORANTE_ETNICO = 'RISTORANTE_ETNICO',
  AGRITURISMO = 'AGRITURISMO',
  SUPERMERCATO = 'SUPERMERCATO',
  IPERMERCATO = 'IPERMERCATO',
  DISCOUNT = 'DISCOUNT',
  MINIMERCATO = 'MINIMERCATO',
  NEGOZIO_ALIMENTARI = 'NEGOZIO_ALIMENTARI',
  MACELLERIA = 'MACELLERIA',
  PESCHERIA = 'PESCHERIA',
  ORTOFRUTTA = 'ORTOFRUTTA',
  FORMAGGIO = 'FORMAGGIO',
  SALUMERIA = 'SALUMERIA',
  ENOTECA = 'ENOTECA',
  OLIO = 'OLIO',
  GASTRONOMIA = 'GASTRONOMIA',
  RISTORAZIONE_COLLETTIVA = 'RISTORAZIONE_COLLETTIVA',
  CATERING = 'CATERING',
  COMMERCIO_ELETTRONICO = 'COMMERCIO_ELETTRONICO',
  PRODOTTI_BIOLOGICI = 'PRODOTTI_BIOLOGICI',
  ALIMENTI_ANIMALI = 'ALIMENTI_ANIMALI',
  BEVANDE = 'BEVANDE',
  ALTRO = 'ALTRO'
}

export enum RiderApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export enum BusinessStatus {
  PENDING_BANKING = 'PENDING_BANKING',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  DEACTIVATED = 'DEACTIVATED'
}

export enum DocumentType {
  IDENTITY_FRONT = 'IDENTITY_FRONT',
  IDENTITY_BACK = 'IDENTITY_BACK',
  PERMESSO_SOGGIORNO = 'PERMESSO_SOGGIORNO',
  TESSERA_SANITARIA = 'TESSERA_SANITARIA',
  BANK_PROOF = 'BANK_PROOF'
}

// Business legal type labels in Italian
export const BusinessLegalTypeLabels: Record<BusinessLegalType, string> = {
  [BusinessLegalType.INDIVIDUALE]: 'Ditta Individuale',
  [BusinessLegalType.SNC]: 'Società in Nome Collettivo (S.N.C.)',
  [BusinessLegalType.SAS]: 'Società in Accomandita Semplice (S.A.S.)',
  [BusinessLegalType.SRL]: 'Società a Responsabilità Limitata (S.R.L.)',
  [BusinessLegalType.SRLS]: 'S.R.L. Semplificata',
  [BusinessLegalType.SPA]: 'Società per Azioni (S.p.A.)',
  [BusinessLegalType.SAPA]: 'Società in Accomandita per Azioni (S.A.p.A.)',
  [BusinessLegalType.COOPERATIVA]: 'Società Cooperativa',
  [BusinessLegalType.CONSORZIO]: 'Consorzio',
  [BusinessLegalType.ONLUS]: 'Organizzazione Non Lucrativa (ONLUS)',
  [BusinessLegalType.FREELANCE]: 'Libero Professionista',
  [BusinessLegalType.ALTRO]: 'Altro'
};

// Business category labels in Italian
export const BusinessCategoryLabels: Record<BusinessCategory, string> = {
  [BusinessCategory.RISTORAZIONE]: 'Ristorazione',
  [BusinessCategory.FAST_FOOD]: 'Fast Food / Street Food',
  [BusinessCategory.BAR]: 'Bar / Caffetteria',
  [BusinessCategory.GELATERIA]: 'Gelateria',
  [BusinessCategory.PASTICCERIA]: 'Pasticceria / Dolciumi',
  [BusinessCategory.PANIFICIO]: 'Panificio / Forno',
  [BusinessCategory.RISTORANTE]: 'Ristorante',
  [BusinessCategory.PIZZERIA]: 'Pizzeria',
  [BusinessCategory.RISTORANTE_ETNICO]: 'Ristorante Etnico',
  [BusinessCategory.AGRITURISMO]: 'Agriturismo',
  [BusinessCategory.SUPERMERCATO]: 'Supermercato',
  [BusinessCategory.IPERMERCATO]: 'Ipermercato',
  [BusinessCategory.DISCOUNT]: 'Discount Alimentare',
  [BusinessCategory.MINIMERCATO]: 'Minimercato / Drogheria',
  [BusinessCategory.NEGOZIO_ALIMENTARI]: 'Negozio di Alimentari',
  [BusinessCategory.MACELLERIA]: 'Macelleria',
  [BusinessCategory.PESCHERIA]: 'Pescheria',
  [BusinessCategory.ORTOFRUTTA]: 'Frutta e Verdura',
  [BusinessCategory.FORMAGGIO]: 'Formaggeria / Latticini',
  [BusinessCategory.SALUMERIA]: 'Salumeria',
  [BusinessCategory.ENOTECA]: 'Enoteca',
  [BusinessCategory.OLIO]: 'Oleificio',
  [BusinessCategory.GASTRONOMIA]: 'Gastronomia',
  [BusinessCategory.RISTORAZIONE_COLLETTIVA]: 'Ristorazione Collettiva (Mense, Catering)',
  [BusinessCategory.CATERING]: 'Catering per Eventi',
  [BusinessCategory.COMMERCIO_ELETTRONICO]: 'E-commerce Alimentare',
  [BusinessCategory.PRODOTTI_BIOLOGICI]: 'Prodotti Biologici e Naturali',
  [BusinessCategory.ALIMENTI_ANIMALI]: 'Alimenti per Animali',
  [BusinessCategory.BEVANDE]: 'Produzione e Vendita Bevande',
  [BusinessCategory.ALTRO]: 'Altro'
};
