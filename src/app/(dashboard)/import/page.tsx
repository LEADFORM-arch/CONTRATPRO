"use client";

import { readSheet } from "read-excel-file/browser";
import { useEffect, useMemo, useState } from "react";

import { AppShell, PageHeader, StatusPill } from "@/components/layout/AppShell";
import { formatEuro } from "@/lib/mock-data";

type ParsedRow = Record<string, string>;

type ImportReport = {
  mode: "dry-run" | "execute";
  totalRows: number;
  validRows: number;
  invalidRows: number;
  customersToCreate: number;
  customersToReuse: number;
  installationsToCreate: number;
  contractsToCreate: number;
  customersCreated: number;
  customersReused: number;
  installationsCreated: number;
  contractsCreated: number;
  warnings: string[];
  errors: string[];
  preview: Array<{
    line: number;
    customer: string;
    email: string;
    phone: string;
    city: string;
    equipment: string;
    contractAmount: number | null;
    action: "create" | "reuse" | "skip";
  }>;
};

type ImportLog = {
  contract_count: number;
  created_at: string;
  customer_created_count: number;
  customer_reused_count: number;
  error_count: number;
  file_name: string | null;
  id: string;
  installation_count: number;
  mode: "dry-run" | "execute";
  source: string;
  status: string;
  total_rows: number;
  valid_rows: number;
  warning_count: number;
};

const templateHeaders = [
  "raison sociale",
  "prenom",
  "nom de famille",
  "email",
  "telephone",
  "adresse",
  "code postal",
  "ville",
  "equipement",
  "marque",
  "modele",
  "numero serie",
  "puissance",
  "debut contrat",
  "echeance",
  "montant annuel",
  "tva",
  "mode paiement",
  "notes",
];

const templateRows = [
  [
    "Dupont Chauffage",
    "",
    "",
    "contact@dupont-chauffage.fr",
    "06 12 34 56 78",
    "12 rue des Lilas",
    "44000",
    "Nantes",
    "Chaudiere gaz",
    "Saunier Duval",
    "ThemaPlus",
    "SD-12345",
    "25",
    "01/01/2026",
    "31/12/2026",
    "189,00",
    "10",
    "SEPA",
    "Client prioritaire",
  ],
  [
    "Martin Habitat",
    "Paul",
    "Martin",
    "paul.martin@example.fr",
    "06 45 12 78 90",
    "8 avenue des Artisans",
    "59000",
    "Lille",
    "PAC air/eau",
    "Atlantic",
    "Alfea Extensa",
    "ATL-PAC-2026",
    "8",
    "15/02/2026",
    "14/02/2027",
    "264,00",
    "10",
    "Virement",
    "Contrat entretien PAC",
  ],
];

const templateFieldGuide = [
  {
    example: "Dupont Chauffage",
    label: "raison sociale",
    level: "Obligatoire",
    note: "Nom du client final ou de la société.",
  },
  {
    example: "contact@dupont-chauffage.fr",
    label: "email",
    level: "Conseillé",
    note: "Utile pour envoyer factures, attestations et relances.",
  },
  {
    example: "Chaudière gaz, PAC air/eau, VMC",
    label: "equipement",
    level: "Conseillé",
    note: "ContratPro reconnaît le vocabulaire CVC courant.",
  },
  {
    example: "Saunier Duval / ThemaPlus",
    label: "marque / modele",
    level: "Optionnel",
    note: "Rend le dossier terrain plus exploitable.",
  },
  {
    example: "31/12/2026",
    label: "echeance",
    level: "Conseillé",
    note: "Alimente les relances et le revenu à sécuriser.",
  },
  {
    example: "189,00",
    label: "montant annuel",
    level: "Conseillé",
    note: "Permet de calculer le portefeuille récurrent.",
  },
  {
    example: "SEPA, Virement, Chèque",
    label: "mode paiement",
    level: "Optionnel",
    note: "SEPA prépare le suivi paiement, sans exposer de clé technique.",
  },
];

const templateCsv = [templateHeaders, ...templateRows]
  .map((row) => row.map((cell) => `"${cell.replace(/"/g, "\"\"")}"`).join(";"))
  .join("\n");

function decodeCsv(buffer: ArrayBuffer) {
  const utf8 = new TextDecoder("utf-8").decode(buffer);
  if (!utf8.includes("\uFFFD")) {
    return utf8;
  }
  return new TextDecoder("windows-1252").decode(buffer);
}

function splitCsvLine(line: string, separator: string) {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && next === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === separator && !inQuotes) {
      cells.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  cells.push(current.trim());
  return cells;
}

function detectSeparator(line: string) {
  return [";", "\t", ","]
    .map((separator) => ({
      separator,
      count: splitCsvLine(line, separator).length,
    }))
    .sort((a, b) => b.count - a.count)[0].separator;
}

function parseCsv(content: string): ParsedRow[] {
  const lines = content.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) {
    return [];
  }

  const separator = detectSeparator(lines[0]);
  const headers = splitCsvLine(lines[0], separator).map((cell) => cell.trim());

  return lines.slice(1).map((line) => {
    const cells = splitCsvLine(line, separator);
    return headers.reduce<ParsedRow>((row, header, index) => {
      row[header] = cells[index] ?? "";
      return row;
    }, {});
  });
}

function parseXlsxMatrix(matrix: unknown[][]): ParsedRow[] {
  const [headerRow, ...bodyRows] = matrix;
  const headers = (headerRow ?? []).map((cell) => String(cell ?? "").trim());
  if (!headers.some(Boolean)) {
    return [];
  }

  return bodyRows
    .filter((row) => row.some((cell) => String(cell ?? "").trim()))
    .map((row) =>
      headers.reduce<ParsedRow>((parsed, header, index) => {
        if (header) {
          parsed[header] = String(row[index] ?? "").trim();
        }
        return parsed;
      }, {}),
    );
}

async function parseFile(file: File) {
  if (file.name.toLowerCase().endsWith(".xlsx")) {
    return parseXlsxMatrix((await readSheet(file)) as unknown[][]);
  }

  const buffer = await file.arrayBuffer();
  return parseCsv(decodeCsv(buffer));
}

function hasRequiredClient(rows: ParsedRow[]) {
  const headers = Object.keys(rows[0] ?? {})
    .map((header) =>
      header
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .trim(),
    );

  return headers.some((header) =>
    ["nom client", "raison sociale", "client", "entreprise", "societe", "prenom"].includes(
      header,
    ),
  );
}

function actionLabel(action: ImportReport["preview"][number]["action"]) {
  if (action === "create") {
    return "Creation";
  }
  if (action === "reuse") {
    return "Reprise";
  }
  return "Ignore";
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function logStatusLabel(status: string) {
  if (status === "IMPORTED") {
    return "Importe";
  }
  if (status === "NEEDS_REVIEW") {
    return "À corriger";
  }
  return "Prêt";
}

function buildImportDecision({
  report,
  result,
  rowsCount,
}: {
  report: ImportReport | null;
  result: ImportReport | null;
  rowsCount: number;
}) {
  if (result) {
    return {
      action: "Voir les contrats",
      href: "/contracts",
      proof: [
        `${result.customersCreated} client(s) créé(s)`,
        `${result.installationsCreated} équipement(s) créé(s)`,
        `${result.contractsCreated} contrat(s) créé(s)`,
      ],
      status: "Import terminé",
      tone: "success",
      title: "Le portefeuille Excel est entré dans ContratPro.",
    };
  }

  if (report?.invalidRows) {
    return {
      action: "Corriger Excel puis relancer",
      href: null,
      proof: [
        `${report.validRows} ligne(s) prête(s)`,
        `${report.invalidRows} ligne(s) à corriger`,
        "Aucune création lancée",
      ],
      status: "À corriger",
      tone: "warning",
      title: "Le fichier est lisible, mais certaines lignes bloquent.",
    };
  }

  if (report) {
    return {
      action: "Confirmer l'import",
      href: null,
      proof: [
        `${report.customersToCreate} client(s) à créer`,
        `${report.customersToReuse} client(s) retrouvé(s)`,
        `${report.contractsToCreate} contrat(s) à suivre`,
      ],
      status: "Simulation prête",
      tone: "ready",
      title: "Le plan d'import est propre.",
    };
  }

  if (rowsCount > 0) {
    return {
      action: "Lancer la simulation",
      href: null,
      proof: [
        `${rowsCount} ligne(s) détectée(s)`,
        "Contrôle des colonnes en attente",
        "Création toujours bloquée",
      ],
      status: "Lecture fichier",
      tone: "reading",
      title: "Le fichier est chargé, reste à contrôler le plan.",
    };
  }

  return {
    action: "Sélectionner le fichier",
    href: null,
    proof: [
      "CSV, TXT ou XLSX accepté",
      "Simulation obligatoire",
      "Aucune écriture sans confirmation",
    ],
    status: "À préparer",
    tone: "idle",
    title: "Reprenez le portefeuille Excel sans ressaisie.",
  };
}

function buildImportRunway({
  fileName,
  report,
  result,
  rowsCount,
}: {
  fileName: string;
  report: ImportReport | null;
  result: ImportReport | null;
  rowsCount: number;
}) {
  return [
    {
      detail: fileName || "Le fichier clients et contrats",
      label: "Déposer Excel",
      number: "1",
      state: rowsCount > 0 ? "done" : "active",
    },
    {
      detail: report
        ? `${report.validRows} ligne(s) prêtes à importer`
        : result
          ? "Simulation validée"
          : "ContratPro contrôle avant création",
      label: "Vérifier simulation",
      number: "2",
      state: result || report ? "done" : rowsCount > 0 ? "active" : "idle",
    },
    {
      detail: result
        ? `${result.contractsCreated} contrat(s) créés`
        : "Aucune écriture sans clic final",
      label: "Confirmer création",
      number: "3",
      state: result ? "done" : report ? "active" : "idle",
    },
  ];
}

export default function ClientImportPage() {
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [report, setReport] = useState<ImportReport | null>(null);
  const [result, setResult] = useState<ImportReport | null>(null);
  const [logs, setLogs] = useState<ImportLog[]>([]);
  const [error, setError] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  const columns = Object.keys(rows[0] ?? {});
  const previewRows = rows.slice(0, 5);
  const canAnalyze = rows.length > 0 && hasRequiredClient(rows) && !isAnalyzing;
  const canExecute = Boolean(report && report.validRows > 0 && !isExecuting);
  const importDecision = buildImportDecision({
    report,
    result,
    rowsCount: rows.length,
  });
  const importRunway = buildImportRunway({
    fileName,
    report,
    result,
    rowsCount: rows.length,
  });
  const templateHref = useMemo(
    () => `data:text/csv;charset=utf-8,${encodeURIComponent(templateCsv)}`,
    [],
  );

  async function refreshLogs() {
    try {
      const response = await fetch("/api/import/clients", { method: "GET" });
      const payload = (await response.json()) as { logs?: ImportLog[] };
      if (response.ok) {
        setLogs(payload.logs ?? []);
      }
    } catch {
      setLogs([]);
    }
  }

  useEffect(() => {
    void refreshLogs();
  }, []);

  async function analyzeRows(nextRows = rows, nextFileName = fileName) {
    setIsAnalyzing(true);
    setError("");
    setReport(null);
    setResult(null);

    try {
      const response = await fetch("/api/import/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: nextFileName, mode: "dry-run", rows: nextRows }),
      });
      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error ?? "Analyse impossible.");
        return;
      }

      setReport(payload as ImportReport);
      void refreshLogs();
    } catch {
      setError("Le serveur n'a pas repondu pendant l'analyse.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function handleFile(file: File | undefined) {
    if (!file) {
      return;
    }

    setError("");
    setReport(null);
    setResult(null);
    setFileName(file.name);

    try {
      const parsedRows = await parseFile(file);
      setRows(parsedRows);

      if (!parsedRows.length) {
        setError("Le fichier ne contient aucune ligne exploitable.");
        return;
      }

      if (hasRequiredClient(parsedRows)) {
        await analyzeRows(parsedRows, file.name);
      }
    } catch {
      setError("Impossible de lire ce fichier. Utilisez un CSV ou un XLSX simple avec une ligne d'en-tete.");
    }
  }

  async function executeImport() {
    setIsExecuting(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/import/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName, mode: "execute", rows }),
      });
      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error ?? "Import impossible.");
        return;
      }

      setResult(payload as ImportReport);
      setReport(null);
      void refreshLogs();
    } catch {
      setError("Le serveur n'a pas repondu pendant l'import.");
    } finally {
      setIsExecuting(false);
    }
  }

  return (
    <AppShell activePath="/import">
      <PageHeader
        action={
          <a
            className="premium-secondary-action rounded-md px-4 py-2 text-sm font-semibold"
            href={templateHref}
            download="modele-import-contratpro.csv"
          >
            Modèle Excel/CSV
          </a>
        }
        description="Déposez le fichier. ContratPro simule avant de créer."
        eyebrow="Onboarding données"
        title="Reprendre un fichier Excel sans ressaisie"
      />

      <section className="import-runway mt-6" aria-label="Parcours import">
        {importRunway.map((step) => (
          <article className="import-runway-step" data-state={step.state} key={step.number}>
            <span>{step.number}</span>
            <div>
              <strong>{step.label}</strong>
              <p>{step.detail}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="import-decision-note mt-6 rounded-lg border p-5" data-tone={importDecision.tone}>
        <div className="import-decision-copy">
          <p className="text-xs font-semibold uppercase tracking-wide text-cyan-300">
            Fiche de contrôle import
          </p>
          <h3>{importDecision.title}</h3>
          <span>
            ContratPro lit le fichier, prépare une simulation avant création, puis
            attend votre confirmation pour écrire les clients, équipements et contrats.
          </span>
        </div>
        <div className="import-decision-proof" aria-label="Preuves de controle import">
          <StatusPill>{importDecision.status}</StatusPill>
          {importDecision.proof.map((item) => (
            <p key={item}>{item}</p>
          ))}
        </div>
        {importDecision.href ? (
          <a className="premium-action rounded-md px-4 py-2 text-sm font-semibold" href={importDecision.href}>
            {importDecision.action}
          </a>
        ) : (
          <span className="import-next-action">{importDecision.action}</span>
        )}
      </section>

      <label className="import-dropzone mt-6 flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-6 py-8 text-center">
        <span className="import-dropzone-mark">CSV/XLSX</span>
        <span className="text-base font-semibold">
          Déposer le fichier clients et contrats
        </span>
        <span className="mt-2 max-w-2xl text-sm text-zinc-500">
          Le contrôle se lance avant toute création. Aucun client n’est écrit sans confirmation.
        </span>
        <input
          accept=".csv,.txt,.xlsx"
          className="sr-only"
          onChange={(event) => handleFile(event.target.files?.[0])}
          type="file"
        />
      </label>

      <section className="import-model-panel mt-6 rounded-lg border p-5">
        <div className="import-model-header">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
              Modèle chauffagiste
            </p>
            <h3>Préparer un fichier Excel que ContratPro comprend.</h3>
            <span>
              Gardez vos colonnes terrain. ContratPro reconnaît les libellés courants
              et simule l’import avant de créer quoi que ce soit.
            </span>
          </div>
          <a
            className="premium-action rounded-md px-4 py-2 text-sm font-semibold"
            href={templateHref}
            download="modele-import-contratpro.csv"
          >
            Télécharger le modèle Excel/CSV
          </a>
        </div>

        <div className="import-model-grid mt-5">
          <div className="import-column-list">
            {templateFieldGuide.map((field) => (
              <article className="import-column-row" key={field.label}>
                <div>
                  <strong>{field.label}</strong>
                  <p>{field.note}</p>
                  <small>{field.example}</small>
                </div>
                <StatusPill>{field.level}</StatusPill>
              </article>
            ))}
          </div>

          <aside className="import-example-sheet" aria-label="Exemple de ligne chauffagiste">
            <p>Exemple prêt à importer</p>
            <h4>Contrat entretien chaudière</h4>
            <dl>
              <div>
                <dt>Client</dt>
                <dd>Dupont Chauffage</dd>
              </div>
              <div>
                <dt>Équipement</dt>
                <dd>Chaudière gaz Saunier Duval ThemaPlus</dd>
              </div>
              <div>
                <dt>Échéance</dt>
                <dd>31/12/2026</dd>
              </div>
              <div>
                <dt>Montant</dt>
                <dd>189,00 EUR TTC / an</dd>
              </div>
              <div>
                <dt>Paiement</dt>
                <dd>SEPA</dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>

      {error ? (
        <p className="import-error mt-5 rounded-md border px-3 py-2 text-sm leading-6">
          {error}
        </p>
      ) : null}

      {rows.length > 0 ? (
        <div className="mt-5 grid gap-4 xl:grid-cols-[360px_1fr]">
          <aside className="import-control-card rounded-lg border p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Fichier
            </p>
            <p className="mt-2 break-all text-sm font-semibold text-zinc-50">
              {fileName}
            </p>

            <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-zinc-500">Lignes</dt>
                <dd className="font-semibold text-zinc-50">{rows.length}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">Colonnes</dt>
                <dd className="font-semibold text-zinc-50">{columns.length}</dd>
              </div>
              {report ? (
                <>
                  <div>
                    <dt className="text-zinc-500">Clients à créer</dt>
                    <dd className="font-semibold text-zinc-50">{report.customersToCreate}</dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Clients repris</dt>
                    <dd className="font-semibold text-zinc-50">{report.customersToReuse}</dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Équipements</dt>
                    <dd className="font-semibold text-zinc-50">
                      {report.installationsToCreate}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Contrats</dt>
                    <dd className="font-semibold text-zinc-50">{report.contractsToCreate}</dd>
                  </div>
                </>
              ) : null}
            </dl>

            {!hasRequiredClient(rows) ? (
              <p className="import-error mt-4 rounded-md border px-3 py-2 text-xs leading-5">
                Ajoutez une colonne raison sociale, client, entreprise, societe
                ou prenom avant analyse.
              </p>
            ) : null}

            <button
              className="premium-secondary-action mt-5 w-full rounded-md px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!canAnalyze}
              onClick={() => analyzeRows()}
              type="button"
            >
              {isAnalyzing ? "Analyse en cours..." : "Reanalyser"}
            </button>

            <button
              className="premium-action mt-3 w-full rounded-md px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:bg-zinc-400"
              disabled={!canExecute}
              onClick={executeImport}
              type="button"
            >
              {isExecuting ? "Import en cours..." : "Confirmer l'import"}
            </button>

            {report?.warnings.length ? (
              <ul className="mt-4 space-y-1 text-xs leading-5 text-amber-200">
                {report.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            ) : null}
          </aside>

          <div className="grid gap-4">
            {report ? (
              <section className="import-preview rounded-lg border p-4 shadow-sm">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-zinc-50">
                      Plan d'import
                    </h3>
                    <p className="mt-1 text-sm text-zinc-500">
                      {report.validRows} lignes valides, {report.invalidRows} lignes a corriger.
                    </p>
                  </div>
                  <StatusPill>{report.mode === "dry-run" ? "Simulation" : "Execute"}</StatusPill>
                </div>

                {report.errors.length ? (
                  <div className="import-error mt-4 rounded-md border px-3 py-2 text-xs leading-5">
                    {report.errors.slice(0, 6).map((message) => (
                      <p key={message}>{message}</p>
                    ))}
                  </div>
                ) : null}

                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[760px] text-left text-sm">
                    <thead>
                      <tr className="dashboard-table-head">
                        <th className="px-4 py-3 font-semibold">Ligne</th>
                        <th className="px-4 py-3 font-semibold">Client</th>
                        <th className="px-4 py-3 font-semibold">Contact</th>
                        <th className="px-4 py-3 font-semibold">Equipement</th>
                        <th className="px-4 py-3 font-semibold">Contrat</th>
                        <th className="px-4 py-3 font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/80">
                      {report.preview.map((row) => (
                        <tr className="import-preview-row" key={`${row.line}-${row.customer}`}>
                          <td className="px-4 py-3 text-zinc-400">{row.line}</td>
                          <td className="px-4 py-3">
                            <p className="font-semibold text-zinc-50">{row.customer}</p>
                            <p className="text-xs text-zinc-500">{row.city}</p>
                          </td>
                          <td className="px-4 py-3 text-zinc-300">
                            <p>{row.email}</p>
                            <p className="text-xs text-zinc-500">{row.phone}</p>
                          </td>
                          <td className="px-4 py-3 text-zinc-300">{row.equipment}</td>
                          <td className="px-4 py-3 text-zinc-300">
                            {row.contractAmount === null ? "-" : formatEuro(row.contractAmount)}
                          </td>
                          <td className="px-4 py-3">
                            <StatusPill>{actionLabel(row.action)}</StatusPill>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            ) : null}

            {!report ? (
              <div className="import-preview overflow-x-auto rounded-lg border shadow-sm">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead>
                    <tr className="dashboard-table-head">
                      {columns.map((column) => (
                        <th className="px-4 py-3 font-semibold" key={column}>
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/80">
                    {previewRows.map((row, index) => (
                      <tr className="import-preview-row" key={index}>
                        {columns.map((column) => (
                          <td className="max-w-64 truncate px-4 py-3 text-zinc-300" key={column}>
                            {row[column] || "-"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {result ? (
        <section className="import-success mt-5 rounded-lg border p-4">
          <h3 className="text-base font-semibold text-emerald-200">
            Import termine
          </h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Clients crees", result.customersCreated],
              ["Clients repris", result.customersReused],
              ["Equipements", result.installationsCreated],
              ["Contrats", result.contractsCreated],
            ].map(([label, value]) => (
              <div className="dashboard-mini-metric" key={label}>
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  {label}
                </p>
                <strong className="mt-2 block text-xl font-semibold text-zinc-950">
                  {value}
                </strong>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <details className="import-history mt-6 rounded-lg border p-4 shadow-sm">
        <summary className="import-history-summary">
          Voir l'historique des imports
        </summary>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Historique
            </p>
            <h3 className="mt-1 text-base font-semibold text-zinc-50">
              Derniers imports et simulations
            </h3>
          </div>
          <button
            className="premium-secondary-action rounded-md px-4 py-2 text-sm font-semibold"
            onClick={() => void refreshLogs()}
            type="button"
          >
            Actualiser
          </button>
        </div>

        {logs.length ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead>
                <tr className="dashboard-table-head">
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Fichier</th>
                  <th className="px-4 py-3 font-semibold">Mode</th>
                  <th className="px-4 py-3 font-semibold">Lignes</th>
                  <th className="px-4 py-3 font-semibold">Clients</th>
                  <th className="px-4 py-3 font-semibold">Contrats</th>
                  <th className="px-4 py-3 font-semibold">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {logs.map((log) => (
                  <tr className="import-preview-row" key={log.id}>
                    <td className="px-4 py-3 text-zinc-300">
                      {formatDateTime(log.created_at)}
                    </td>
                    <td className="max-w-64 truncate px-4 py-3 text-zinc-300">
                      {log.file_name ?? "Fichier non renseigne"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill>{log.mode === "execute" ? "Import" : "Simulation"}</StatusPill>
                    </td>
                    <td className="px-4 py-3 text-zinc-300">
                      {log.valid_rows}/{log.total_rows}
                      {log.error_count ? (
                        <span className="ml-2 text-rose-300">({log.error_count} erreurs)</span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-zinc-300">
                      {log.customer_created_count} crees · {log.customer_reused_count} repris
                    </td>
                    <td className="px-4 py-3 text-zinc-300">{log.contract_count}</td>
                    <td className="px-4 py-3">
                      <StatusPill>{logStatusLabel(log.status)}</StatusPill>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="import-empty-history mt-4 rounded-md border p-4">
            <strong>Aucun import journalise pour cette organisation.</strong>
            <p>
              Deposez un fichier, lancez une simulation, puis confirmez uniquement
              quand le plan d'import est propre.
            </p>
          </div>
        )}
      </details>

      {rows.length === 0 ? (
        <section className="mt-6 grid gap-4 lg:grid-cols-3">
          {[
            ["1. Fichier", "CSV, TXT ou XLSX avec une ligne d'en-tete claire."],
            ["2. Simulation", "ContratPro détecte les clients existants et les lignes incomplètes."],
            ["3. Import", "Création des clients, équipements et contrats après confirmation."],
          ].map(([title, description]) => (
            <article
              className="import-schema-card rounded-lg border p-4 shadow-sm"
              key={title}
            >
              <StatusPill>{title}</StatusPill>
              <p className="mt-3 text-sm leading-6 text-zinc-600">
                {description}
              </p>
            </article>
          ))}
        </section>
      ) : null}
    </AppShell>
  );
}
