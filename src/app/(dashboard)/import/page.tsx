"use client";

import { readSheet } from "read-excel-file/browser";
import { useMemo, useState } from "react";

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
  "debut contrat",
  "echeance",
  "montant annuel",
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
    "01/01/2026",
    "31/12/2026",
    "189,00",
    "SEPA",
    "Client prioritaire",
  ],
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

export default function ClientImportPage() {
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [report, setReport] = useState<ImportReport | null>(null);
  const [result, setResult] = useState<ImportReport | null>(null);
  const [error, setError] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  const columns = Object.keys(rows[0] ?? {});
  const previewRows = rows.slice(0, 5);
  const canAnalyze = rows.length > 0 && hasRequiredClient(rows) && !isAnalyzing;
  const canExecute = Boolean(report && report.validRows > 0 && !isExecuting);
  const templateHref = useMemo(
    () => `data:text/csv;charset=utf-8,${encodeURIComponent(templateCsv)}`,
    [],
  );

  async function analyzeRows(nextRows = rows) {
    setIsAnalyzing(true);
    setError("");
    setReport(null);
    setResult(null);

    try {
      const response = await fetch("/api/import/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "dry-run", rows: nextRows }),
      });
      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error ?? "Analyse impossible.");
        return;
      }

      setReport(payload as ImportReport);
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
        await analyzeRows(parsedRows);
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
        body: JSON.stringify({ mode: "execute", rows }),
      });
      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error ?? "Import impossible.");
        return;
      }

      setResult(payload as ImportReport);
      setReport(null);
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
            Modele CSV
          </a>
        }
        description="Importez un fichier CSV ou XLSX, controlez le plan d'import, puis creez les clients, equipements et contrats dans Supabase."
        eyebrow="Onboarding donnees"
        title="Import clients et contrats"
      />

      <label className="import-dropzone mt-6 flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-6 py-8 text-center">
        <span className="import-dropzone-mark">CSV/XLSX</span>
        <span className="text-base font-semibold">
          Selectionner un export clients
        </span>
        <span className="mt-2 max-w-2xl text-sm text-zinc-500">
          Colonnes reconnues : raison sociale, email, telephone, adresse, ville,
          equipement, marque, modele, echeance, montant annuel et mode paiement.
        </span>
        <input
          accept=".csv,.txt,.xlsx"
          className="sr-only"
          onChange={(event) => handleFile(event.target.files?.[0])}
          type="file"
        />
      </label>

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
                    <dt className="text-zinc-500">Clients a creer</dt>
                    <dd className="font-semibold text-zinc-50">{report.customersToCreate}</dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Clients repris</dt>
                    <dd className="font-semibold text-zinc-50">{report.customersToReuse}</dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Equipements</dt>
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

      {rows.length === 0 ? (
        <section className="mt-6 grid gap-4 lg:grid-cols-3">
          {[
            ["1. Fichier", "CSV, TXT ou XLSX avec une ligne d'en-tete claire."],
            ["2. Simulation", "ContratPro detecte les clients existants et les lignes incompletes."],
            ["3. Import", "Creation des clients, equipements et contrats apres confirmation."],
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
