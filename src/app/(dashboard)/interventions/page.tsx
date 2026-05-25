import { AppShell, PageHeader, StatusPill } from "@/components/layout/AppShell";
import { formatEuro } from "@/lib/mock-data";
import { getInterventions } from "@/server/contratpro-data";

import { CertificateAction } from "./CertificateAction";

type InterventionTone = "amber" | "cyan" | "emerald" | "rose";

function StatCard({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  tone: InterventionTone;
}) {
  return (
    <article className="intervention-stat-card" data-tone={tone}>
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
        {label}
      </p>
      <strong className="mt-3 block text-3xl font-semibold text-zinc-50">
        {value}
      </strong>
      <p className="mt-2 text-sm leading-5 text-zinc-400">{detail}</p>
    </article>
  );
}

function needsCertificate(certificateStatus: string) {
  return (
    certificateStatus.includes("generer") ||
    certificateStatus.includes("générer") ||
    certificateStatus.includes("envoyer")
  );
}

function phoneHref(phone: string) {
  const digits = phone.replace(/[^\d+]/g, "");
  return digits && phone !== "-" ? `tel:${digits}` : "";
}

export default async function InterventionsPage() {
  const interventions = await getInterventions();
  const scheduled = interventions.filter((intervention) =>
    intervention.status.includes("Planifi"),
  );
  const completed = interventions.filter(
    (intervention) =>
      intervention.status.includes("Realis") ||
      intervention.status.includes("Réalis"),
  );
  const certificatesToGenerate = interventions.filter((intervention) =>
    needsCertificate(intervention.certificateStatus),
  );
  const priorityIntervention = certificatesToGenerate[0] ?? scheduled[0] ?? interventions[0];
  const protectedRevenue = interventions.reduce(
    (sum, intervention) => sum + intervention.value,
    0,
  );

  return (
    <AppShell activePath="/interventions">
      <PageHeader
        action={
          <a className="premium-action rounded-md text-sm font-semibold" href="/interventions/new">
            Planifier visite
          </a>
        }
        description="Pilotez les visites CVC rattachees aux contrats, puis sortez l'attestation sans double saisie."
        eyebrow="Operations terrain"
        title="Planning interventions"
      />

      <section className="intervention-command-panel mt-6" data-od-id="intervention-next-action">
        <div>
          <p>Prochaine action</p>
          <h3>
            {priorityIntervention
              ? `${priorityIntervention.customer} - ${priorityIntervention.equipment}`
              : "Planifier une visite terrain"}
          </h3>
          <span>
            {priorityIntervention
              ? `${priorityIntervention.performedAt} - ${priorityIntervention.certificateStatus}`
              : "Aucune visite a traiter. Commencez par rattacher une intervention a un contrat."}
          </span>
        </div>
        <div className="intervention-command-actions">
          {priorityIntervention?.phone && phoneHref(priorityIntervention.phone) ? (
            <a
              className="premium-secondary-action rounded-md px-3 py-2 text-sm font-semibold"
              href={phoneHref(priorityIntervention.phone)}
            >
              Appeler client
            </a>
          ) : null}
          {priorityIntervention?.contractId ? (
            <a
              className="premium-secondary-action rounded-md px-3 py-2 text-sm font-semibold"
              href={`/contracts/${priorityIntervention.contractId}`}
            >
              Ouvrir dossier
            </a>
          ) : null}
          {priorityIntervention ? (
            <CertificateAction
              certificateId={priorityIntervention.certificateId}
              contractId={priorityIntervention.contractId}
              interventionId={priorityIntervention.id}
            />
          ) : (
            <a className="premium-action rounded-md text-sm font-semibold" href="/interventions/new">
              Creer visite
            </a>
          )}
        </div>
      </section>

      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          detail="visites dans le planning"
          label="Total"
          tone="cyan"
          value={String(interventions.length)}
        />
        <StatCard
          detail="a realiser ou confirmer"
          label="Planifiees"
          tone="amber"
          value={String(scheduled.length)}
        />
        <StatCard
          detail="attestations a produire"
          label="Documents"
          tone="rose"
          value={String(certificatesToGenerate.length)}
        />
        <StatCard
          detail="contrats couverts par ces visites"
          label="Revenu protege"
          tone="emerald"
          value={formatEuro(protectedRevenue)}
        />
      </div>

      <section className="intervention-section mt-6 overflow-hidden">
        <div className="intervention-section-header flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-zinc-50">
              File terrain
            </h3>
            <p className="mt-1 text-sm text-zinc-400">
              Client, equipement, date, dossier et PDF restent sur une seule ligne.
            </p>
          </div>
          <StatusPill>{completed.length} realisee(s)</StatusPill>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead>
              <tr className="dashboard-table-head text-xs uppercase tracking-wide text-zinc-400">
                <th className="px-4 py-3 font-semibold">Client</th>
                <th className="px-4 py-3 font-semibold">Equipement</th>
                <th className="px-4 py-3 font-semibold">Intervention</th>
                <th className="px-4 py-3 font-semibold">Technicien</th>
                <th className="px-4 py-3 font-semibold">Prochaine</th>
                <th className="px-4 py-3 font-semibold">Attestation</th>
                <th className="px-4 py-3 font-semibold">Statut</th>
                <th className="px-4 py-3 font-semibold">Dossier</th>
                <th className="px-4 py-3 font-semibold">PDF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {interventions.map((intervention) => (
                <tr className="intervention-table-row" key={intervention.id}>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-zinc-50">
                      {intervention.customer}
                    </p>
                    <p className="mt-1 text-xs text-zinc-400">
                      {intervention.city}
                    </p>
                    <p className="mt-1 text-xs text-cyan-200">
                      {intervention.phone}
                    </p>
                  </td>
                  <td className="px-4 py-4 text-zinc-300">
                    {intervention.equipment}
                  </td>
                  <td className="px-4 py-4 font-medium text-zinc-50">
                    {intervention.performedAt}
                  </td>
                  <td className="px-4 py-4 text-zinc-300">
                    {intervention.technician}
                  </td>
                  <td className="px-4 py-4 text-zinc-300">
                    {intervention.nextVisitDate}
                  </td>
                  <td className="px-4 py-4">
                    <span className="intervention-certificate-pill">
                      {intervention.certificateStatus}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <StatusPill>{intervention.status}</StatusPill>
                  </td>
                  <td className="px-4 py-4">
                    {intervention.contractId ? (
                      <a
                        className="premium-secondary-action rounded-md px-3 py-2 text-sm font-semibold"
                        href={`/contracts/${intervention.contractId}`}
                      >
                        Ouvrir
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <CertificateAction
                      certificateId={intervention.certificateId}
                      contractId={intervention.contractId}
                      interventionId={intervention.id}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
