export const contracts = [
  {
    id: "ctr-001",
    customer: "Maison Lefevre",
    city: "Nantes",
    equipment: "PAC air/eau Atlantic 8 kW",
    renewal: "12 juin 2026",
    value: 289,
    status: "À renouveler",
    payment: "SEPA actif",
    lastVisit: "14 juin 2025",
  },
  {
    id: "ctr-002",
    customer: "Cabinet Martin",
    city: "Rennes",
    equipment: "Clim réversible Daikin",
    renewal: "28 juin 2026",
    value: 420,
    status: "Relance envoyée",
    payment: "Virement",
    lastVisit: "02 juillet 2025",
  },
  {
    id: "ctr-003",
    customer: "SCI Bellecour",
    city: "Lyon",
    equipment: "Chaudière gaz Frisquet",
    renewal: "04 juillet 2026",
    value: 360,
    status: "SEPA actif",
    payment: "SEPA actif",
    lastVisit: "08 juillet 2025",
  },
  {
    id: "ctr-004",
    customer: "Boulangerie Moreau",
    city: "Tours",
    equipment: "VMC + PAC air/air",
    renewal: "19 juillet 2026",
    value: 510,
    status: "Visite à caler",
    payment: "Chèque",
    lastVisit: "21 juillet 2025",
  },
];

export const customers = [
  {
    id: "cus-001",
    name: "Maison Lefevre",
    contact: "Claire Lefevre",
    city: "Nantes",
    phone: "06 12 45 78 90",
    email: "claire.lefevre@example.fr",
    contracts: 2,
    revenue: 578,
  },
  {
    id: "cus-002",
    name: "Cabinet Martin",
    contact: "Dr Martin",
    city: "Rennes",
    phone: "02 99 00 00 00",
    email: "contact@cabinet-martin.fr",
    contracts: 1,
    revenue: 420,
  },
  {
    id: "cus-003",
    name: "SCI Bellecour",
    contact: "Amandine Roux",
    city: "Lyon",
    phone: "04 72 00 00 00",
    email: "gestion@sci-bellecour.fr",
    contracts: 3,
    revenue: 1080,
  },
];

export const certificates = [
  {
    id: "att-001",
    customer: "SCI Bellecour",
    equipment: "Chaudière gaz Frisquet",
    issuedAt: "08 juillet 2025",
    status: "Envoyée",
    legalReference: "Arrêté 15/09/2009",
  },
  {
    id: "att-002",
    customer: "Cabinet Martin",
    equipment: "Clim réversible Daikin",
    issuedAt: "02 juillet 2025",
    status: "Archivée",
    legalReference: "Arrêté 02/03/2017",
  },
  {
    id: "att-003",
    customer: "Maison Lefevre",
    equipment: "PAC air/eau Atlantic 8 kW",
    issuedAt: "14 juin 2025",
    status: "À renvoyer",
    legalReference: "Arrêté 02/03/2017",
  },
];

export const payments = [
  {
    id: "pay-001",
    customer: "Maison Lefevre",
    amount: 289,
    method: "SEPA",
    dueDate: "12 juin 2026",
    status: "Programmé",
  },
  {
    id: "pay-002",
    customer: "Cabinet Martin",
    amount: 420,
    method: "Virement",
    dueDate: "28 juin 2026",
    status: "À relancer",
  },
  {
    id: "pay-003",
    customer: "SCI Bellecour",
    amount: 360,
    method: "SEPA",
    dueDate: "04 juillet 2026",
    status: "Mandat actif",
  },
];

export function formatEuro(value: number) {
  return `${value.toLocaleString("fr-FR")} EUR`;
}
