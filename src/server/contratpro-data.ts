import {
  AuthRequiredError,
  getRequestOrganizationId,
  getSupabaseReadHeaders,
} from "@/server/auth";
import {
  certificates as demoCertificates,
  contracts as demoContracts,
  customers as demoCustomers,
  payments as demoPayments,
} from "@/lib/mock-data";

type MaybeArray<T> = T | T[] | null | undefined;

type SupabaseContractRow = {
  id: string;
  status: string;
  end_date: string;
  price_ttc: number | string;
  payment_method: string;
  installations?: MaybeArray<{
    type: string;
    brand: string | null;
    model: string | null;
    customers?: MaybeArray<{
      company_name: string | null;
      first_name: string | null;
      last_name: string | null;
      city: string | null;
    }>;
  }>;
  interventions?: Array<{ performed_at: string }>;
};

type SupabaseCustomerRow = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  company_name: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  installations?: Array<{
    contracts?: Array<{ price_ttc: number | string }>;
  }>;
};

type SupabaseCertificateRow = {
  id: string;
  issued_at: string;
  sent_to_customer: boolean;
  legal_reference: string;
  interventions?: MaybeArray<{
    contracts?: MaybeArray<{
      installations?: MaybeArray<{
        type: string;
        brand: string | null;
        model: string | null;
        customers?: MaybeArray<{
          company_name: string | null;
          first_name: string | null;
          last_name: string | null;
        }>;
      }>;
    }>;
  }>;
};

type SupabaseCertificateDetailRow = {
  id: string;
  issued_at: string;
  sent_to_customer: boolean;
  sent_at: string | null;
  legal_reference: string;
  file_name: string | null;
  interventions?: MaybeArray<{
    id: string;
    performed_at: string;
    technician: string | null;
    report: string | null;
    contracts?: MaybeArray<{
      id: string;
      start_date: string;
      end_date: string;
      price_ttc: number | string;
      installations?: MaybeArray<{
        type: string;
        brand: string | null;
        model: string | null;
        serial_number: string | null;
        power_kw: number | string | null;
        location: string | null;
        customers?: MaybeArray<{
          company_name: string | null;
          first_name: string | null;
          last_name: string | null;
          email: string | null;
          phone: string | null;
          address: string | null;
          city: string | null;
          zip_code: string | null;
        }>;
      }>;
    }>;
  }>;
};

type SupabasePaymentRow = {
  id: string;
  amount: number | string;
  status: string;
  charge_date: string;
  description: string | null;
  failure_reason: string | null;
  gc_payment_id: string | null;
  mandate?: MaybeArray<{
    id: string;
    status: string;
    contracts?: MaybeArray<{
      id: string;
      end_date: string;
      installations?: MaybeArray<{
        customers?: MaybeArray<{
          company_name: string | null;
          first_name: string | null;
          last_name: string | null;
        }>;
      }>;
    }>;
  }>;
};

type SupabaseMandateOptionRow = {
  id: string;
  status: string;
  contracts?: MaybeArray<{
    id: string;
    end_date: string;
    price_ttc: number | string;
    installations?: MaybeArray<{
      type: string;
      brand: string | null;
      model: string | null;
      customers?: MaybeArray<{
        company_name: string | null;
        first_name: string | null;
        last_name: string | null;
        city: string | null;
      }>;
    }>;
  }>;
};

type SupabaseInvoiceRow = {
  id: string;
  number: string;
  status: string;
  issue_date: string;
  due_date: string;
  amount_ht: number | string;
  vat_rate: number | string;
  vat_amount: number | string;
  amount_ttc: number | string;
  paid_at: string | null;
  contracts?: MaybeArray<{
    id: string;
    installations?: MaybeArray<{
      type: string;
      brand: string | null;
      model: string | null;
      customers?: MaybeArray<{
        company_name: string | null;
        first_name: string | null;
        last_name: string | null;
        city: string | null;
      }>;
    }>;
  }>;
};

type SupabaseInvoiceDetailRow = {
  id: string;
  number: string;
  status: string;
  issue_date: string;
  due_date: string;
  amount_ht: number | string;
  vat_rate: number | string;
  vat_amount: number | string;
  amount_ttc: number | string;
  paid_at: string | null;
  contracts?: MaybeArray<{
    id: string;
    start_date: string;
    end_date: string;
    installations?: MaybeArray<{
      type: string;
      brand: string | null;
      model: string | null;
      serial_number: string | null;
      customers?: MaybeArray<{
        company_name: string | null;
        first_name: string | null;
        last_name: string | null;
        email: string | null;
        phone: string | null;
        address: string | null;
        city: string | null;
        zip_code: string | null;
      }>;
    }>;
  }>;
};

type SupabaseInvoiceContractOptionRow = {
  id: string;
  end_date: string;
  price_ht: number | string;
  vat_rate: number | string;
  price_ttc: number | string;
  installations?: MaybeArray<{
    type: string;
    brand: string | null;
    model: string | null;
    customers?: MaybeArray<{
      company_name: string | null;
      first_name: string | null;
      last_name: string | null;
      city: string | null;
    }>;
  }>;
};

type SupabaseProspectionLeadRow = {
  id: string;
  company_name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  specialty: string | null;
  source: string;
  status: string;
  score: number | string;
  next_action: string | null;
  last_touch_at: string | null;
  notes: string | null;
  created_at: string;
};

type SupabaseFacebookSettingsRow = {
  id: string;
  buffer_access_token: string | null;
  buffer_profile_id: string | null;
  apify_token: string | null;
  manychat_token: string | null;
  demo_url: string | null;
  n8n_webhook_url: string | null;
  posting_frequency: string;
  persona: string;
  updated_at: string;
};

type SupabaseOrganizationRow = {
  id: string;
  name: string;
  siret: string | null;
  rge_number: string | null;
  vat_number: string | null;
  address: string | null;
  city: string | null;
  zip_code: string | null;
  phone: string | null;
  email: string | null;
  plan: string;
  updated_at: string;
};

type SupabaseRenewalRow = {
  id: string;
  status: string;
  end_date: string;
  price_ttc: number | string;
  payment_method: string;
  installations?: MaybeArray<{
    type: string;
    brand: string | null;
    model: string | null;
    customers?: MaybeArray<{
      company_name: string | null;
      first_name: string | null;
      last_name: string | null;
      email: string | null;
      phone: string | null;
      city: string | null;
    }>;
  }>;
};

type SupabaseRenewalActionRow = {
  id: string;
  contract_id: string;
  status: string;
  channel: string;
  message: string;
  due_at: string;
  completed_at: string | null;
  outcome: string | null;
  created_at: string;
  contracts?: MaybeArray<{
    installations?: MaybeArray<{
      customers?: MaybeArray<{
        company_name: string | null;
        first_name: string | null;
        last_name: string | null;
      }>;
    }>;
  }>;
};

type SupabaseInterventionRow = {
  id: string;
  performed_at: string;
  technician: string | null;
  status: string;
  report: string | null;
  next_visit_date: string | null;
  contracts?: MaybeArray<{
    id: string;
    end_date: string;
    price_ttc: number | string;
    installations?: MaybeArray<{
      type: string;
      brand: string | null;
      model: string | null;
      customers?: MaybeArray<{
        company_name: string | null;
        first_name: string | null;
        last_name: string | null;
        city: string | null;
      }>;
    }>;
  }>;
  certificates?: Array<{
    id: string;
    sent_to_customer: boolean;
  }>;
};

type SupabaseContractOptionRow = {
  id: string;
  end_date: string;
  installations?: MaybeArray<{
    type: string;
    brand: string | null;
    model: string | null;
    customers?: MaybeArray<{
      company_name: string | null;
      first_name: string | null;
      last_name: string | null;
      city: string | null;
    }>;
  }>;
};

type SupabaseContractDetailRow = {
  id: string;
  status: string;
  start_date: string;
  end_date: string;
  price_ht: number | string;
  vat_rate: number | string;
  price_ttc: number | string;
  billing_cycle: string;
  payment_method: string;
  notes: string | null;
  installations?: MaybeArray<{
    id: string;
    type: string;
    brand: string | null;
    model: string | null;
    serial_number: string | null;
    power_kw: number | string | null;
    location: string | null;
    customers?: MaybeArray<{
      id: string;
      company_name: string | null;
      first_name: string | null;
      last_name: string | null;
      email: string | null;
      phone: string | null;
      address: string | null;
      city: string | null;
      zip_code: string | null;
    }>;
  }>;
  interventions?: Array<{
    id: string;
    performed_at: string;
    technician: string | null;
    status: string;
    report: string | null;
    next_visit_date: string | null;
  }>;
  certificates?: Array<{
    id: string;
    issued_at: string;
    sent_to_customer: boolean;
    legal_reference: string;
    file_name: string | null;
  }>;
  sepa_mandates?: MaybeArray<{
    id: string;
    status: string;
    gc_mandate_id: string | null;
    signed_at: string | null;
    sepa_payments?: Array<{
      id: string;
      amount: number | string;
      status: string;
      charge_date: string;
      description: string | null;
    }>;
  }>;
};

type SupabaseCustomerDetailRow = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  company_name: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  address: string | null;
  zip_code: string | null;
  notes: string | null;
  installations?: Array<{
    id: string;
    type: string;
    brand: string | null;
    model: string | null;
    serial_number: string | null;
    power_kw: number | string | null;
    location: string | null;
    contracts?: Array<{
      id: string;
      status: string;
      start_date: string;
      end_date: string;
      price_ttc: number | string;
      payment_method: string;
    }>;
  }>;
};

function first<T>(value: MaybeArray<T>): T | undefined {
  return Array.isArray(value) ? value[0] : value ?? undefined;
}

function customerName(customer?: {
  company_name: string | null;
  first_name: string | null;
  last_name: string | null;
}) {
  if (!customer) {
    return "Client sans nom";
  }
  return (
    customer.company_name ||
    [customer.first_name, customer.last_name].filter(Boolean).join(" ") ||
    "Client sans nom"
  );
}

function formatDate(value?: string | null) {
  if (!value) {
    return "-";
  }
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function equipmentLabel(installation?: {
  type: string;
  brand: string | null;
  model: string | null;
}) {
  if (!installation) {
    return "Equipement non renseigne";
  }
  return [installation.brand, installation.model].filter(Boolean).join(" ") || installation.type;
}

function equipmentTypeLabel(type: string) {
  const labels: Record<string, string> = {
    BOILER_GAS: "Chaudiere gaz",
    BOILER_OIL: "Chaudiere fioul",
    HEAT_PUMP_AIR_AIR: "PAC air/air",
    HEAT_PUMP_AIR_WATER: "PAC air/eau",
    HEAT_PUMP_GEO: "PAC geothermie",
    AC_REVERSIBLE: "Clim reversible",
    VMC: "VMC",
    OTHER: "Autre equipement",
  };
  return labels[type] ?? type;
}

function contractStatusLabel(status: string) {
  const labels: Record<string, string> = {
    ACTIVE: "Actif",
    EXPIRING: "A renouveler",
    EXPIRED: "Expire",
    CANCELLED: "Annule",
    DRAFT: "Brouillon",
  };
  return labels[status] ?? status;
}

function paymentMethodLabel(method: string) {
  const labels: Record<string, string> = {
    SEPA: "SEPA actif",
    BANK_TRANSFER: "Virement",
    CHECK: "Cheque",
    CASH: "Especes",
  };
  return labels[method] ?? method;
}

function paymentStatusLabel(status: string) {
  const labels: Record<string, string> = {
    PENDING_SUBMISSION: "Programme",
    SUBMITTED: "Envoye",
    CONFIRMED: "Confirme",
    PAID_OUT: "Verse",
    FAILED: "A relancer",
    CANCELLED: "Annule",
    CHARGED_BACK: "Conteste",
  };
  return labels[status] ?? status;
}

function invoiceStatusLabel(status: string) {
  const labels: Record<string, string> = {
    DRAFT: "Brouillon",
    SENT: "Envoyee",
    PAID: "Payee",
    OVERDUE: "En retard",
    CANCELLED: "Annulee",
  };
  return labels[status] ?? status;
}

function daysUntil(value: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(value);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / 86_400_000);
}

function renewalPriority(days: number) {
  if (days < 0) {
    return "Expire";
  }
  if (days <= 15) {
    return "Critique";
  }
  if (days <= 30) {
    return "Haute";
  }
  if (days <= 45) {
    return "Normale";
  }
  return "Preparation";
}

function renewalChannel(days: number, method: string) {
  if (days <= 15) {
    return "Appel + SMS";
  }
  if (days <= 30) {
    return method === "SEPA" ? "Email + lien SEPA" : "Email + appel";
  }
  if (days <= 45) {
    return "Email";
  }
  return "Preparation devis";
}

function renewalActionStatusLabel(status: string) {
  const labels: Record<string, string> = {
    TODO: "A faire",
    SENT: "Envoyee",
    REPLIED: "Reponse recue",
    WON: "Renouvele",
    LOST: "Perdu",
  };
  return labels[status] ?? status;
}

function interventionStatusLabel(status: string) {
  const labels: Record<string, string> = {
    CANCELLED: "Annulee",
    COMPLETED: "Realisee",
    SCHEDULED: "Planifiee",
  };
  return labels[status] ?? status;
}

async function organizationId() {
  return getRequestOrganizationId();
}

function leadStatusLabel(status: string) {
  const labels: Record<string, string> = {
    TO_QUALIFY: "A qualifier",
    CONTACTED: "Contacte",
    REPLIED: "A repondu",
    DEMO_SCHEDULED: "Demo planifiee",
    WON: "Gagne",
    LOST: "Perdu",
  };
  return labels[status] ?? status;
}

async function supabaseRequest<T>(path: string): Promise<T | null> {
  const baseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const headers = await getSupabaseReadHeaders();

  if (!baseUrl || !headers) {
    return null;
  }

  try {
    const response = await fetch(`${baseUrl}/rest/v1${path}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(12000),
      headers,
    });

    if (!response.ok) {
      console.warn(`[Supabase] ${response.status} on ${path}`);
      return null;
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof AuthRequiredError) {
      throw error;
    }
    console.warn("[Supabase] request failed", error);
    return null;
  }
}

export async function getContracts() {
  const rows = await supabaseRequest<SupabaseContractRow[]>(
    "/contracts?select=id,status,end_date,price_ttc,payment_method,installations(type,brand,model,customers(company_name,first_name,last_name,city)),interventions(performed_at)&order=end_date.asc",
  );

  if (!rows) {
    return demoContracts;
  }

  return rows.map((row) => {
    const installation = first(row.installations);
    const customer = first(installation?.customers);
    const latestVisit = [...(row.interventions ?? [])].sort((a, b) =>
      b.performed_at.localeCompare(a.performed_at),
    )[0];

    return {
      id: row.id,
      customer: customerName(customer),
      city: customer?.city ?? "-",
      equipment: equipmentLabel(installation),
      renewal: formatDate(row.end_date),
      value: Number(row.price_ttc),
      status: contractStatusLabel(row.status),
      payment: paymentMethodLabel(row.payment_method),
      lastVisit: formatDate(latestVisit?.performed_at),
    };
  });
}

export async function getRenewalPipeline() {
  const rows = await supabaseRequest<SupabaseRenewalRow[]>(
    "/contracts?status=neq.CANCELLED&select=id,status,end_date,price_ttc,payment_method,installations(type,brand,model,customers(company_name,first_name,last_name,email,phone,city))&order=end_date.asc",
  );

  if (!rows) {
    return demoContracts.map((contract, index) => ({
      id: contract.id,
      customer: contract.customer,
      city: contract.city,
      equipment: contract.equipment,
      endDate: contract.renewal,
      daysRemaining: [35, 51, 57, 72][index] ?? 45,
      value: contract.value,
      priority: ["Normale", "Preparation", "Preparation", "Preparation"][index] ?? "Preparation",
      channel: contract.payment.includes("SEPA") ? "Email + lien SEPA" : "Email",
      contact: "-",
      paymentMethod: contract.payment,
      script: `Bonjour, votre contrat d'entretien ${contract.equipment} arrive a echeance le ${contract.renewal}. Je vous propose de le renouveler afin de conserver le suivi annuel et l'attestation d'entretien.`,
    }));
  }

  return rows.map((row) => {
    const installation = first(row.installations);
    const customer = first(installation?.customers);
    const daysRemaining = daysUntil(row.end_date);
    const paymentMethod = paymentMethodLabel(row.payment_method);
    const equipment = equipmentLabel(installation);
    const endDate = formatDate(row.end_date);

    return {
      id: row.id,
      customer: customerName(customer),
      city: customer?.city ?? "-",
      equipment,
      endDate,
      daysRemaining,
      value: Number(row.price_ttc),
      priority: renewalPriority(daysRemaining),
      channel: renewalChannel(daysRemaining, row.payment_method),
      contact: customer?.email || customer?.phone || "-",
      paymentMethod,
      script: `Bonjour, votre contrat d'entretien ${equipment} arrive a echeance le ${endDate}. Je vous propose de le renouveler afin de conserver le suivi annuel, la priorite d'intervention et l'attestation d'entretien reglementaire.`,
    };
  });
}

export async function getRenewalActions() {
  const rows = await supabaseRequest<SupabaseRenewalActionRow[]>(
    "/renewal_actions?select=id,contract_id,status,channel,message,due_at,completed_at,outcome,created_at,contracts(installations(customers(company_name,first_name,last_name)))&order=created_at.desc&limit=12",
  );

  if (!rows) {
    return [];
  }

  return rows.map((row) => {
    const contract = first(row.contracts);
    const installation = first(contract?.installations);
    const customer = first(installation?.customers);

    return {
      id: row.id,
      contractId: row.contract_id,
      customer: customerName(customer),
      status: renewalActionStatusLabel(row.status),
      rawStatus: row.status,
      channel: row.channel,
      message: row.message,
      dueAt: formatDate(row.due_at),
      completedAt: formatDate(row.completed_at),
      outcome: row.outcome ?? "-",
      createdAt: formatDate(row.created_at),
    };
  });
}

export async function getContractDetail(id: string) {
  const rows = await supabaseRequest<SupabaseContractDetailRow[]>(
    `/contracts?id=eq.${encodeURIComponent(id)}&select=id,status,start_date,end_date,price_ht,vat_rate,price_ttc,billing_cycle,payment_method,notes,installations(id,type,brand,model,serial_number,power_kw,location,customers(id,company_name,first_name,last_name,email,phone,address,city,zip_code)),interventions(id,performed_at,technician,status,report,next_visit_date),certificates(id,issued_at,sent_to_customer,legal_reference,file_name),sepa_mandates(id,status,gc_mandate_id,signed_at,sepa_payments(id,amount,status,charge_date,description))`,
  );
  const row = rows?.[0];

  if (!row) {
    const demo = demoContracts.find((contract) => contract.id === id);
    if (!demo) {
      return null;
    }

    return {
      id: demo.id,
      customer: demo.customer,
      customerId: "",
      city: demo.city,
      contact: "-",
      email: "-",
      phone: "-",
      address: "-",
      equipment: demo.equipment,
      equipmentType: "Equipement",
      serialNumber: "-",
      powerKw: "-",
      location: "-",
      status: demo.status,
      startDate: "-",
      endDate: demo.renewal,
      priceHt: 0,
      vatRate: 0,
      priceTtc: demo.value,
      billingCycle: "Annuel",
      paymentMethod: demo.payment,
      notes: "",
      interventions: [
        {
          id: `${demo.id}-visit`,
          performedAt: demo.lastVisit,
          technician: "-",
          status: "Realisee",
          report: "Derniere visite importee depuis les donnees demo.",
          nextVisitDate: demo.renewal,
        },
      ],
      certificates: [],
      mandate: null,
      payments: [],
    };
  }

  const installation = first(row.installations);
  const customer = first(installation?.customers);
  const mandate = first(row.sepa_mandates);

  return {
    id: row.id,
    customer: customerName(customer),
    customerId: customer?.id ?? "",
    city: customer?.city ?? "-",
    contact: [customer?.first_name, customer?.last_name].filter(Boolean).join(" ") || "-",
    email: customer?.email ?? "-",
    phone: customer?.phone ?? "-",
    address: [customer?.address, customer?.zip_code, customer?.city].filter(Boolean).join(" ") || "-",
    equipment: equipmentLabel(installation),
    equipmentType: equipmentTypeLabel(installation?.type ?? "OTHER"),
    serialNumber: installation?.serial_number ?? "-",
    powerKw: installation?.power_kw ? `${installation.power_kw} kW` : "-",
    location: installation?.location ?? "-",
    status: contractStatusLabel(row.status),
    startDate: formatDate(row.start_date),
    endDate: formatDate(row.end_date),
    priceHt: Number(row.price_ht),
    vatRate: Number(row.vat_rate),
    priceTtc: Number(row.price_ttc),
    billingCycle: row.billing_cycle === "MONTHLY" ? "Mensuel" : "Annuel",
    paymentMethod: paymentMethodLabel(row.payment_method),
    notes: row.notes ?? "",
    interventions: (row.interventions ?? []).map((intervention) => ({
      id: intervention.id,
      performedAt: formatDate(intervention.performed_at),
      technician: intervention.technician ?? "-",
      status: intervention.status === "COMPLETED" ? "Realisee" : intervention.status,
      report: intervention.report ?? "-",
      nextVisitDate: formatDate(intervention.next_visit_date),
    })),
    certificates: (row.certificates ?? []).map((certificate) => ({
      id: certificate.id,
      issuedAt: formatDate(certificate.issued_at),
      status: certificate.sent_to_customer ? "Envoyee" : "A envoyer",
      legalReference: certificate.legal_reference,
      fileName: certificate.file_name ?? "-",
    })),
    mandate: mandate
      ? {
          id: mandate.id,
          status: mandate.status,
          providerId: mandate.gc_mandate_id ?? "-",
          signedAt: formatDate(mandate.signed_at),
        }
      : null,
    payments: (mandate?.sepa_payments ?? []).map((payment) => ({
      id: payment.id,
      amount: Number(payment.amount),
      status: paymentStatusLabel(payment.status),
      chargeDate: formatDate(payment.charge_date),
      description: payment.description ?? "-",
    })),
  };
}

export async function getCustomers() {
  const rows = await supabaseRequest<SupabaseCustomerRow[]>(
    "/customers?select=id,first_name,last_name,company_name,email,phone,city,installations(contracts(price_ttc))&order=company_name.asc",
  );

  if (!rows) {
    return demoCustomers;
  }

  return rows.map((row) => {
    const allContracts = (row.installations ?? []).flatMap(
      (installation) => installation.contracts ?? [],
    );
    const revenue = allContracts.reduce(
      (sum, contract) => sum + Number(contract.price_ttc),
      0,
    );

    return {
      id: row.id,
      name: customerName(row),
      contact: [row.first_name, row.last_name].filter(Boolean).join(" ") || "-",
      city: row.city ?? "-",
      phone: row.phone ?? "-",
      email: row.email ?? "-",
      contracts: allContracts.length,
      revenue,
    };
  });
}

export async function getCustomerDetail(id: string) {
  const rows = await supabaseRequest<SupabaseCustomerDetailRow[]>(
    `/customers?id=eq.${encodeURIComponent(id)}&select=id,first_name,last_name,company_name,email,phone,address,city,zip_code,notes,installations(id,type,brand,model,serial_number,power_kw,location,contracts(id,status,start_date,end_date,price_ttc,payment_method))`,
  );
  const row = rows?.[0];

  if (!row) {
    const demo = demoCustomers.find((customer) => customer.id === id);
    if (!demo) {
      return null;
    }

    return {
      id: demo.id,
      name: demo.name,
      contact: demo.contact,
      email: demo.email,
      phone: demo.phone,
      address: demo.city,
      city: demo.city,
      notes: "",
      contracts: demo.contracts,
      revenue: demo.revenue,
      installations: [],
    };
  }

  const installations = row.installations ?? [];
  const contracts = installations.flatMap((installation) => installation.contracts ?? []);
  const revenue = contracts.reduce(
    (sum, contract) => sum + Number(contract.price_ttc),
    0,
  );

  return {
    id: row.id,
    name: customerName(row),
    contact: [row.first_name, row.last_name].filter(Boolean).join(" ") || "-",
    email: row.email ?? "-",
    phone: row.phone ?? "-",
    address: [row.address, row.zip_code, row.city].filter(Boolean).join(" ") || "-",
    city: row.city ?? "-",
    notes: row.notes ?? "",
    contracts: contracts.length,
    revenue,
    installations: installations.map((installation) => ({
      id: installation.id,
      equipment: equipmentLabel(installation),
      equipmentType: equipmentTypeLabel(installation.type),
      serialNumber: installation.serial_number ?? "-",
      powerKw: installation.power_kw ? `${installation.power_kw} kW` : "-",
      location: installation.location ?? "-",
      contracts: (installation.contracts ?? []).map((contract) => ({
        id: contract.id,
        status: contractStatusLabel(contract.status),
        startDate: formatDate(contract.start_date),
        endDate: formatDate(contract.end_date),
        priceTtc: Number(contract.price_ttc),
        paymentMethod: paymentMethodLabel(contract.payment_method),
      })),
    })),
  };
}

export async function getCustomerOptions() {
  const rows = await supabaseRequest<SupabaseCustomerRow[]>(
    "/customers?select=id,first_name,last_name,company_name,email,phone,city&order=company_name.asc",
  );

  if (!rows) {
    return demoCustomers.map((customer) => ({
      id: customer.id,
      label: `${customer.name} - ${customer.city}`,
    }));
  }

  return rows.map((row) => ({
    id: row.id,
    label: `${customerName(row)} - ${row.city ?? "Ville non renseignee"}`,
  }));
}

export async function getContractOptions() {
  const rows = await supabaseRequest<SupabaseContractOptionRow[]>(
    "/contracts?status=neq.CANCELLED&select=id,end_date,installations(type,brand,model,customers(company_name,first_name,last_name,city))&order=end_date.asc",
  );

  if (!rows) {
    return demoContracts.map((contract) => ({
      id: contract.id,
      label: `${contract.customer} - ${contract.equipment}`,
    }));
  }

  return rows.map((row) => {
    const installation = first(row.installations);
    const customer = first(installation?.customers);

    return {
      id: row.id,
      label: `${customerName(customer)} - ${equipmentLabel(installation)} - ${formatDate(row.end_date)}`,
    };
  });
}

export async function getInterventions() {
  const rows = await supabaseRequest<SupabaseInterventionRow[]>(
    "/interventions?select=id,performed_at,technician,status,report,next_visit_date,contracts(id,end_date,price_ttc,installations(type,brand,model,customers(company_name,first_name,last_name,city))),certificates(id,sent_to_customer)&order=performed_at.asc",
  );

  if (!rows) {
    return demoContracts.map((contract) => ({
      id: `int-${contract.id}`,
      contractId: contract.id,
      customer: contract.customer,
      city: contract.city,
      equipment: contract.equipment,
      performedAt: contract.lastVisit,
      technician: "-",
      status: "Realisee",
      report: "Intervention issue des donnees demo.",
      nextVisitDate: contract.renewal,
      certificateId: "",
      certificateStatus: "A verifier",
      value: contract.value,
    }));
  }

  return rows.map((row) => {
    const contract = first(row.contracts);
    const installation = first(contract?.installations);
    const customer = first(installation?.customers);
    const certificate = row.certificates?.[0];

    return {
      id: row.id,
      contractId: contract?.id ?? "",
      customer: customerName(customer),
      city: customer?.city ?? "-",
      equipment: equipmentLabel(installation),
      performedAt: formatDate(row.performed_at),
      technician: row.technician ?? "-",
      status: interventionStatusLabel(row.status),
      report: row.report ?? "-",
      nextVisitDate: formatDate(row.next_visit_date),
      certificateId: certificate?.id ?? "",
      certificateStatus: certificate
        ? certificate.sent_to_customer
          ? "Attestation envoyee"
          : "Attestation a envoyer"
        : "Attestation a generer",
      value: Number(contract?.price_ttc ?? 0),
    };
  });
}

export async function getCertificates() {
  const rows = await supabaseRequest<SupabaseCertificateRow[]>(
    "/certificates?select=id,issued_at,sent_to_customer,legal_reference,interventions(contracts(installations(type,brand,model,customers(company_name,first_name,last_name))))&order=issued_at.desc",
  );

  if (!rows) {
    return demoCertificates;
  }

  return rows.map((row) => {
    const intervention = first(row.interventions);
    const contract = first(intervention?.contracts);
    const installation = first(contract?.installations);
    const customer = first(installation?.customers);

    return {
      id: row.id,
      customer: customerName(customer),
      equipment: equipmentLabel(installation),
      issuedAt: formatDate(row.issued_at),
      status: row.sent_to_customer ? "Envoyee" : "A envoyer",
      legalReference: row.legal_reference,
    };
  });
}

export async function getCertificateDetail(id: string) {
  const rows = await supabaseRequest<SupabaseCertificateDetailRow[]>(
    `/certificates?id=eq.${encodeURIComponent(id)}&select=id,issued_at,sent_to_customer,sent_at,legal_reference,file_name,interventions(id,performed_at,technician,report,contracts(id,start_date,end_date,price_ttc,installations(type,brand,model,serial_number,power_kw,location,customers(company_name,first_name,last_name,email,phone,address,city,zip_code))))`,
  );
  const row = rows?.[0];

  if (!row) {
    const demo = demoCertificates.find((certificate) => certificate.id === id);
    if (!demo) {
      return null;
    }

    return {
      id: demo.id,
      fileName: `${demo.id}.pdf`,
      customer: demo.customer,
      contact: "-",
      email: "-",
      phone: "-",
      address: "-",
      equipment: demo.equipment,
      equipmentType: "Equipement CVC",
      serialNumber: "-",
      powerKw: "-",
      location: "-",
      issuedAt: demo.issuedAt,
      sentAt: "-",
      status: demo.status,
      legalReference: demo.legalReference,
      performedAt: demo.issuedAt,
      technician: "-",
      report: "Attestation issue des donnees demo.",
      contractId: "",
      contractPeriod: "-",
    };
  }

  const intervention = first(row.interventions);
  const contract = first(intervention?.contracts);
  const installation = first(contract?.installations);
  const customer = first(installation?.customers);

  return {
    id: row.id,
    fileName: row.file_name ?? `attestation-${row.id}.pdf`,
    customer: customerName(customer),
    contact: [customer?.first_name, customer?.last_name].filter(Boolean).join(" ") || "-",
    email: customer?.email ?? "-",
    phone: customer?.phone ?? "-",
    address: [customer?.address, customer?.zip_code, customer?.city].filter(Boolean).join(" ") || "-",
    equipment: equipmentLabel(installation),
    equipmentType: equipmentTypeLabel(installation?.type ?? "OTHER"),
    serialNumber: installation?.serial_number ?? "-",
    powerKw: installation?.power_kw ? `${installation.power_kw} kW` : "-",
    location: installation?.location ?? "-",
    issuedAt: formatDate(row.issued_at),
    sentAt: formatDate(row.sent_at),
    status: row.sent_to_customer ? "Envoyee" : "A envoyer",
    legalReference: row.legal_reference,
    performedAt: formatDate(intervention?.performed_at),
    technician: intervention?.technician ?? "-",
    report: intervention?.report ?? "-",
    contractId: contract?.id ?? "",
    contractPeriod: contract
      ? `${formatDate(contract.start_date)} - ${formatDate(contract.end_date)}`
      : "-",
  };
}

export async function getPayments() {
  const rows = await supabaseRequest<SupabasePaymentRow[]>(
    "/sepa_payments?select=id,amount,status,charge_date,description,failure_reason,gc_payment_id,mandate:sepa_mandates(id,status,contracts(id,end_date,installations(customers(company_name,first_name,last_name))))&order=charge_date.asc",
  );

  if (!rows) {
    return demoPayments.map((payment) => ({
      ...payment,
      contractId: "",
      description: "Paiement issu des donnees demo",
      failureReason: "",
      providerPaymentId: "",
      mandateId: "",
      mandateStatus: payment.method === "SEPA" ? "Actif" : "-",
      rawStatus: payment.status === "A relancer" ? "FAILED" : "PENDING_SUBMISSION",
    }));
  }

  return rows.map((row) => {
    const mandate = first(row.mandate);
    const contract = first(mandate?.contracts);
    const installation = first(contract?.installations);
    const customer = first(installation?.customers);

    return {
      id: row.id,
      customer: customerName(customer),
      amount: Number(row.amount),
      contractId: contract?.id ?? "",
      description: row.description ?? "-",
      failureReason: row.failure_reason ?? "",
      providerPaymentId: row.gc_payment_id ?? "",
      mandateId: mandate?.id ?? "",
      mandateStatus: mandate?.status ?? "-",
      method: "SEPA",
      rawStatus: row.status,
      dueDate: formatDate(row.charge_date),
      status: paymentStatusLabel(row.status),
    };
  });
}

export async function getMandateOptions() {
  const rows = await supabaseRequest<SupabaseMandateOptionRow[]>(
    "/sepa_mandates?status=eq.ACTIVE&select=id,status,contracts(id,end_date,price_ttc,installations(type,brand,model,customers(company_name,first_name,last_name,city)))&order=signed_at.desc",
  );

  if (!rows) {
    return [];
  }

  return rows.map((row) => {
    const contract = first(row.contracts);
    const installation = first(contract?.installations);
    const customer = first(installation?.customers);

    return {
      id: row.id,
      amount: Number(contract?.price_ttc ?? 0),
      contractId: contract?.id ?? "",
      label: `${customerName(customer)} - ${equipmentLabel(installation)} - ${formatDate(contract?.end_date)}`,
    };
  });
}

export async function getInvoices() {
  const orgId = await organizationId();
  const rows = await supabaseRequest<SupabaseInvoiceRow[]>(
    `/invoices?organization_id=eq.${encodeURIComponent(orgId)}&select=id,number,status,issue_date,due_date,amount_ht,vat_rate,vat_amount,amount_ttc,paid_at,contracts(id,installations(type,brand,model,customers(company_name,first_name,last_name,city)))&order=issue_date.desc`,
  );

  if (!rows) {
    return demoContracts.slice(0, 3).map((contract, index) => ({
      id: `inv-${contract.id}`,
      number: `FAC-DEMO-000${index + 1}`,
      customer: contract.customer,
      city: contract.city,
      contractId: contract.id,
      equipment: contract.equipment,
      issueDate: contract.lastVisit,
      dueDate: contract.renewal,
      amountHt: Math.round((contract.value / 1.1) * 100) / 100,
      vatRate: 10,
      vatAmount: Math.round((contract.value - contract.value / 1.1) * 100) / 100,
      amountTtc: contract.value,
      rawStatus: index === 0 ? "SENT" : "PAID",
      status: index === 0 ? "Envoyee" : "Payee",
      paidAt: index === 0 ? "-" : contract.lastVisit,
    }));
  }

  return rows.map((row) => {
    const contract = first(row.contracts);
    const installation = first(contract?.installations);
    const customer = first(installation?.customers);

    return {
      id: row.id,
      number: row.number,
      customer: customerName(customer),
      city: customer?.city ?? "-",
      contractId: contract?.id ?? "",
      equipment: equipmentLabel(installation),
      issueDate: formatDate(row.issue_date),
      dueDate: formatDate(row.due_date),
      amountHt: Number(row.amount_ht),
      vatRate: Number(row.vat_rate),
      vatAmount: Number(row.vat_amount),
      amountTtc: Number(row.amount_ttc),
      rawStatus: row.status,
      status: invoiceStatusLabel(row.status),
      paidAt: formatDate(row.paid_at),
    };
  });
}

export async function getInvoiceDetail(id: string) {
  const orgId = await organizationId();
  const rows = await supabaseRequest<SupabaseInvoiceDetailRow[]>(
    `/invoices?id=eq.${encodeURIComponent(id)}&organization_id=eq.${encodeURIComponent(orgId)}&select=id,number,status,issue_date,due_date,amount_ht,vat_rate,vat_amount,amount_ttc,paid_at,contracts(id,start_date,end_date,installations(type,brand,model,serial_number,customers(company_name,first_name,last_name,email,phone,address,city,zip_code)))`,
  );
  const row = rows?.[0];

  if (!row) {
    return null;
  }

  const contract = first(row.contracts);
  const installation = first(contract?.installations);
  const customer = first(installation?.customers);

  return {
    id: row.id,
    number: row.number,
    customer: customerName(customer),
    contact: [customer?.first_name, customer?.last_name].filter(Boolean).join(" ") || "-",
    email: customer?.email ?? "-",
    phone: customer?.phone ?? "-",
    address: [customer?.address, customer?.zip_code, customer?.city].filter(Boolean).join(" ") || "-",
    contractId: contract?.id ?? "",
    contractPeriod: contract
      ? `${formatDate(contract.start_date)} - ${formatDate(contract.end_date)}`
      : "-",
    equipment: equipmentLabel(installation),
    equipmentType: equipmentTypeLabel(installation?.type ?? "OTHER"),
    serialNumber: installation?.serial_number ?? "-",
    issueDate: formatDate(row.issue_date),
    dueDate: formatDate(row.due_date),
    amountHt: Number(row.amount_ht),
    vatRate: Number(row.vat_rate),
    vatAmount: Number(row.vat_amount),
    amountTtc: Number(row.amount_ttc),
    rawStatus: row.status,
    status: invoiceStatusLabel(row.status),
    paidAt: formatDate(row.paid_at),
  };
}

export async function getInvoiceContractOptions() {
  const rows = await supabaseRequest<SupabaseInvoiceContractOptionRow[]>(
    "/contracts?status=neq.CANCELLED&select=id,end_date,price_ht,vat_rate,price_ttc,installations(type,brand,model,customers(company_name,first_name,last_name,city))&order=end_date.asc",
  );

  if (!rows) {
    return demoContracts.map((contract) => ({
      id: contract.id,
      amountHt: Math.round((contract.value / 1.1) * 100) / 100,
      vatRate: 10,
      amountTtc: contract.value,
      label: `${contract.customer} - ${contract.equipment}`,
    }));
  }

  return rows.map((row) => {
    const installation = first(row.installations);
    const customer = first(installation?.customers);

    return {
      id: row.id,
      amountHt: Number(row.price_ht),
      vatRate: Number(row.vat_rate),
      amountTtc: Number(row.price_ttc),
      label: `${customerName(customer)} - ${equipmentLabel(installation)} - ${formatDate(row.end_date)}`,
    };
  });
}

export async function getProspectionLeads() {
  const orgId = await organizationId();
  const rows = await supabaseRequest<SupabaseProspectionLeadRow[]>(
    `/prospection_leads?organization_id=eq.${encodeURIComponent(orgId)}&select=id,company_name,contact_name,email,phone,city,specialty,source,status,score,next_action,last_touch_at,notes,created_at&order=score.desc`,
  );

  const fallback = [
    {
      id: "lead_thermi_ouest",
      company: "Thermi Ouest",
      contact: "Julien Morin",
      email: "contact@thermi-ouest.fr",
      phone: "02 41 00 00 00",
      city: "Angers",
      specialty: "Pompes a chaleur",
      source: "FACEBOOK",
      status: "A qualifier",
      rawStatus: "TO_QUALIFY",
      score: 72,
      nextAction: "Verifier volume contrats entretien",
      lastTouch: "-",
      notes: "A reagi a un post sur les renouvellements oublies.",
    },
    {
      id: "lead_clim_habitat_44",
      company: "Clim Habitat 44",
      contact: "Sarah Petit",
      email: "hello@climhabitat44.fr",
      phone: "02 40 00 00 00",
      city: "Nantes",
      specialty: "Clim reversible",
      source: "FACEBOOK",
      status: "Contacte",
      rawStatus: "CONTACTED",
      score: 81,
      nextAction: "Envoyer lien demo et sequence J+2",
      lastTouch: "-",
      notes: "Profil tres proche ICP : petite equipe, PAC et clim reversible.",
    },
    {
      id: "lead_riviere_chauffage",
      company: "Riviere Chauffage",
      contact: "Marc Riviere",
      email: "contact@riviere-chauffage.fr",
      phone: "02 99 00 00 00",
      city: "Rennes",
      specialty: "Chaudiere gaz",
      source: "REFERRAL",
      status: "Demo planifiee",
      rawStatus: "DEMO_SCHEDULED",
      score: 88,
      nextAction: "Confirmer creneau demo",
      lastTouch: "-",
      notes: "Demande une vue simple des contrats actifs et relances.",
    },
  ];

  if (!rows) {
    return fallback;
  }

  return rows.map((row) => ({
    id: row.id,
    company: row.company_name,
    contact: row.contact_name ?? "-",
    email: row.email ?? "-",
    phone: row.phone ?? "-",
    city: row.city ?? "-",
    specialty: row.specialty ?? "-",
    source: row.source,
    status: leadStatusLabel(row.status),
    rawStatus: row.status,
    score: Number(row.score),
    nextAction: row.next_action ?? "-",
    lastTouch: formatDate(row.last_touch_at),
    notes: row.notes ?? "-",
  }));
}

export async function getFacebookSettings() {
  const orgId = await organizationId();
  const rows = await supabaseRequest<SupabaseFacebookSettingsRow[]>(
    `/facebook_channel_settings?organization_id=eq.${encodeURIComponent(orgId)}&select=id,buffer_access_token,buffer_profile_id,apify_token,manychat_token,demo_url,n8n_webhook_url,posting_frequency,persona,updated_at&limit=1`,
  );
  const row = rows?.[0];

  if (!row) {
    return {
      id: "",
      bufferAccessTokenConfigured: false,
      bufferProfileId: "",
      apifyTokenConfigured: false,
      manychatTokenConfigured: false,
      demoUrl: "https://contratpro.fr/demo",
      n8nWebhookUrl: "https://votre-n8n.com/webhook/fb-comment",
      postingFrequency: "3 posts / semaine",
      persona: "Marc, chauffagiste senior franc, utile et non vendeur",
      updatedAt: "-",
    };
  }

  return {
    id: row.id,
    bufferAccessTokenConfigured: Boolean(row.buffer_access_token),
    bufferProfileId: row.buffer_profile_id ?? "",
    apifyTokenConfigured: Boolean(row.apify_token),
    manychatTokenConfigured: Boolean(row.manychat_token),
    demoUrl: row.demo_url ?? "",
    n8nWebhookUrl: row.n8n_webhook_url ?? "",
    postingFrequency: row.posting_frequency,
    persona: row.persona,
    updatedAt: formatDate(row.updated_at),
  };
}

export async function getOrganizationProfile() {
  const orgId = await organizationId();
  const rows = await supabaseRequest<SupabaseOrganizationRow[]>(
    `/organizations?id=eq.${encodeURIComponent(orgId)}&select=id,name,siret,rge_number,vat_number,address,city,zip_code,phone,email,plan,updated_at&limit=1`,
  );
  const row = rows?.[0];

  if (!row) {
    return {
      id: orgId,
      name: "JD Chauffage & Clim",
      siret: "",
      rgeNumber: "",
      vatNumber: "",
      address: "",
      city: "Nantes",
      zipCode: "",
      phone: "",
      email: "contact@jd-chauffage.fr",
      plan: "STARTER",
      fullAddress: "Nantes",
      updatedAt: "-",
    };
  }

  return {
    id: row.id,
    name: row.name,
    siret: row.siret ?? "",
    rgeNumber: row.rge_number ?? "",
    vatNumber: row.vat_number ?? "",
    address: row.address ?? "",
    city: row.city ?? "",
    zipCode: row.zip_code ?? "",
    phone: row.phone ?? "",
    email: row.email ?? "",
    plan: row.plan,
    fullAddress: [row.address, row.zip_code, row.city].filter(Boolean).join(" ") || "-",
    updatedAt: formatDate(row.updated_at),
  };
}
