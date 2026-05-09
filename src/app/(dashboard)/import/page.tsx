"use client";

import { useMemo, useState } from "react";

import { AppShell, PageHeader, StatusPill } from "@/components/layout/AppShell";

type ParsedRow = Record<string, string>;

type ImportResult = {
  customersCreated: number;
  customersReused: number;
  installationsCreated: number;
  contractsCreated: number;
  interventionsCreated: number;
  skipped: number;
  errors: string[];
};

const clientColumns = [
  "nom client",
  "raison sociale",
  "client",
  "email",
  "telephone",
  "tel",
  "adresse",
  "ville",
  "code postal",
  "cp",
];

const interventionColumns = [
  "date intervention",
  "date d intervention",
  "date debut",
  "technicien",
  "compte rendu",
  "equipement",
  "materiel",
  "appareil",
];

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function detectSeparator(line: string) {
  const candidates = [";", "\t", ","];
  return candidates
    .map((separator) => ({
      separator,
      count: splitCsvLine(line, separator).length,
    }))
    .sort((a, b) => b.count - a.count)[0].separator;
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

function detectType(rows: ParsedRow[]) {
  const headers = Object.keys(rows[0] ?? {}).map(normalize);
  const interventionScore = headers.filter((header) =>
    interventionColumns.includes(header),
  ).length;
  const clientScore = headers.filter((header) =>
    clientColumns.includes(header),
  ).length;
  return interventionScore > clientScore ? "Interventions" : "Clients";
}

function hasRequiredClient(rows: ParsedRow[]) {
  const headers = Object.keys(rows[0] ?? {}).map(normalize);
  return headers.some((header) =>
    ["nom client", "raison sociale", "client", "entreprise", "societe"].includes(
      header,
    ),
  );
}

export default function PraxedoImportPage() {
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ImportResult | null>(null);

  const detectedType = useMemo(() => detectType(rows), [rows]);
  const columns = Object.keys(rows[0] ?? {});
  const previewRows = rows.slice(0, 6);
  const canImport = rows.length > 0 && hasRequiredClient(rows) && !isImporting;

  async function handleFile(file: File | undefined) {
    if (!file) {
      return;
    }

    setError("");
    setResult(null);
    setFileName(file.name);
    const content = await file.text();
    setRows(parseCsv(content));
  }

  async function importRows() {
    setIsImporting(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/import/praxedo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows }),
      });
      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error ?? "Import impossible.");
        return;
      }

      setResult(payload as ImportResult);
    } catch {
      setError("Le serveur local n'a pas repondu pendant l'import.");
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <AppShell activePath="/import">
      <PageHeader
        action={
          <a
            className="premium-secondary-action rounded-md px-4 py-2 text-sm font-semibold"
            href="/"
          >
            Retour pilotage
          </a>
        }
        description="Deposez un export Praxedo, controlez les colonnes detectees, puis migrez les clients, equipements, contrats et interventions dans Supabase."
        eyebrow="Migration Praxedo"
        title="Import CSV clients et interventions"
      />

      <label className="import-dropzone mt-6 flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-6 py-8 text-center">
        <span className="import-dropzone-mark">CSV</span>
        <span className="text-base font-semibold">
          Selectionner un export Praxedo CSV
        </span>
        <span className="mt-2 text-sm text-zinc-500">
          Separateurs acceptes : point-virgule, virgule ou tabulation, avec
          cellules entre guillemets.
        </span>
        <input
          accept=".csv,.txt"
          className="sr-only"
          onChange={(event) => handleFile(event.target.files?.[0])}
          type="file"
        />
      </label>

      {rows.length > 0 && (
        <div className="mt-5 grid gap-4 lg:grid-cols-[300px_1fr]">
          <aside className="import-control-card rounded-lg border p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Fichier
            </p>
            <p className="mt-2 break-all text-sm font-semibold text-zinc-50">
              {fileName}
            </p>
            <dl className="mt-5 space-y-3 text-sm">
              <div>
                <dt className="text-zinc-500">Type detecte</dt>
                <dd className="font-semibold text-zinc-50">{detectedType}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">Lignes</dt>
                <dd className="font-semibold text-zinc-50">{rows.length}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">Colonnes</dt>
                <dd className="font-semibold text-zinc-50">{columns.length}</dd>
              </div>
            </dl>

            {!hasRequiredClient(rows) && (
              <p className="import-error mt-4 rounded-md border px-3 py-2 text-xs leading-5">
                Ajoutez une colonne client, nom client, raison sociale,
                entreprise ou societe avant migration.
              </p>
            )}

            <button
              className="premium-action mt-5 w-full rounded-md px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:bg-zinc-400"
              disabled={!canImport}
              onClick={importRows}
              type="button"
            >
              {isImporting ? "Migration en cours..." : "Migrer vers Supabase"}
            </button>

            {error && (
              <p className="import-error mt-4 rounded-md border px-3 py-2 text-xs leading-5">
                {error}
              </p>
            )}

            {result && (
              <div className="import-success mt-4 rounded-lg border p-3">
                <p className="text-sm font-semibold text-emerald-200">
                  Import termine
                </p>
                <dl className="mt-3 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <dt className="text-zinc-500">Clients crees</dt>
                    <dd className="font-semibold text-zinc-50">{result.customersCreated}</dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Clients repris</dt>
                    <dd className="font-semibold text-zinc-50">{result.customersReused}</dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Equipements</dt>
                    <dd className="font-semibold text-zinc-50">
                      {result.installationsCreated}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Contrats</dt>
                    <dd className="font-semibold text-zinc-50">{result.contractsCreated}</dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Interventions</dt>
                    <dd className="font-semibold text-zinc-50">
                      {result.interventionsCreated}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Ignorees</dt>
                    <dd className="font-semibold text-zinc-50">{result.skipped}</dd>
                  </div>
                </dl>
                {result.errors.length > 0 && (
                  <ul className="mt-3 space-y-1 text-xs leading-5 text-zinc-600">
                    {result.errors.slice(0, 4).map((message) => (
                      <li key={message}>{message}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </aside>

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
      )}

      {rows.length === 0 && (
        <section className="mt-6 grid gap-4 lg:grid-cols-3">
          {[
            ["Clients", "raison sociale, email, telephone, adresse, ville"],
            ["Equipements", "equipement, marque, modele, numero serie, puissance"],
            ["Contrats", "debut contrat, echeance, prix ttc, tva"],
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
      )}
    </AppShell>
  );
}
