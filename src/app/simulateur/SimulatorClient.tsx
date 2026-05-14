"use client";

import { useMemo, useState } from "react";

import { PublicShell } from "@/components/marketing/PublicShell";

type SimulationResult = {
  annualCost: number;
  breakEvenMonths: number;
  forgottenContracts: number;
  lostRevenue: number;
  recoveredRevenue: number;
  roiNet: number;
  roiPercent: number;
};

const formatter = new Intl.NumberFormat("fr-FR", {
  currency: "EUR",
  maximumFractionDigits: 0,
  style: "currency",
});

function euro(value: number) {
  return formatter.format(value);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function calculateSimulation({
  contractCount,
  forgottenRate,
  planMonthlyPrice,
  renewalRate,
  yearlyContractPrice,
}: {
  contractCount: number;
  forgottenRate: number;
  planMonthlyPrice: number;
  renewalRate: number;
  yearlyContractPrice: number;
}): SimulationResult {
  const renewableContracts = Math.round(contractCount * (renewalRate / 100));
  const forgottenContracts = Math.round(renewableContracts * (forgottenRate / 100));
  const lostRevenue = forgottenContracts * yearlyContractPrice;
  const recoveredRevenue = Math.round(lostRevenue * 0.7);
  const annualCost = planMonthlyPrice * 12;
  const roiNet = recoveredRevenue - annualCost;
  const roiPercent = annualCost > 0 ? Math.round((roiNet / annualCost) * 100) : 0;
  const monthlyRecovered = recoveredRevenue / 12;
  const breakEvenMonths =
    monthlyRecovered > 0 ? clamp(Math.ceil(annualCost / monthlyRecovered), 1, 99) : 99;

  return {
    annualCost,
    breakEvenMonths,
    forgottenContracts,
    lostRevenue,
    recoveredRevenue,
    roiNet,
    roiPercent,
  };
}

async function trackSimulation(payload: {
  contractCount: number;
  forgottenRate: number;
  planMonthlyPrice: number;
  renewalRate: number;
  result: SimulationResult;
  yearlyContractPrice: number;
}) {
  try {
    await fetch("/api/simulateur/track", {
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
  } catch {
    // The simulator must stay useful even if analytics is unavailable.
  }
}

export default function SimulatorPage() {
  const [contractCount, setContractCount] = useState(120);
  const [renewalRate, setRenewalRate] = useState(76);
  const [yearlyContractPrice, setYearlyContractPrice] = useState(180);
  const [forgottenRate, setForgottenRate] = useState(14);
  const [planMonthlyPrice, setPlanMonthlyPrice] = useState(99);
  const [hasCalculated, setHasCalculated] = useState(false);
  const [trackingState, setTrackingState] = useState<"idle" | "saved">("idle");

  const result = useMemo(
    () =>
      calculateSimulation({
        contractCount,
        forgottenRate,
        planMonthlyPrice,
        renewalRate,
        yearlyContractPrice,
      }),
    [contractCount, forgottenRate, planMonthlyPrice, renewalRate, yearlyContractPrice],
  );

  async function calculate() {
    setHasCalculated(true);
    setTrackingState("idle");
    await trackSimulation({
      contractCount,
      forgottenRate,
      planMonthlyPrice,
      renewalRate,
      result,
      yearlyContractPrice,
    });
    setTrackingState("saved");
  }

  return (
    <PublicShell>
      <section className="simulator-hero mx-auto grid max-w-6xl gap-8 px-5 pb-8 pt-8 sm:px-8 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-end">
        <div>
          <p className="text-sm font-semibold text-emerald-300">Simulateur ROI</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-normal text-zinc-50 sm:text-5xl">
            Combien vous coutent vos contrats d'entretien oublies ?
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-400">
            En 30 secondes, estimez le revenu annuel perdu faute de relances et le
            montant recuperable avec un cockpit contrats, attestations et SEPA.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a className="premium-action rounded-md text-sm font-semibold" href="#calculer">
              Calculer ma perte
            </a>
            <a className="premium-secondary-action rounded-md px-4 py-2 text-sm font-semibold" href="/pricing">
              Voir les offres
            </a>
          </div>
        </div>

        <aside className="simulator-proof-card">
          <span>Promesse commerciale</span>
          <strong>1 contrat recupere peut payer plusieurs mois de ContratPro.</strong>
          <p>
            Le prix devient acceptable quand le chauffagiste voit le cash oublie,
            pas quand on lui liste des fonctions.
          </p>
        </aside>
      </section>

      <section
        className="simulator-workbench mx-auto grid max-w-6xl gap-5 px-5 py-8 sm:px-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]"
        id="calculer"
      >
        <div className="simulator-panel">
          <div className="simulator-panel-header">
            <p>Votre portefeuille actuel</p>
            <h2>Reglez les curseurs</h2>
          </div>

          <div className="simulator-controls">
            <SliderControl
              label="Contrats d'entretien actifs"
              max={500}
              min={20}
              suffix=" contrats"
              value={contractCount}
              onChange={setContractCount}
            />
            <SliderControl
              label="Taux de renouvellement actuel"
              max={95}
              min={40}
              suffix="%"
              value={renewalRate}
              onChange={setRenewalRate}
            />
            <SliderControl
              label="Prix moyen par contrat annuel"
              max={420}
              min={80}
              step={10}
              suffix=" EUR"
              value={yearlyContractPrice}
              onChange={setYearlyContractPrice}
            />
            <SliderControl
              alert
              helper="Hypothese prudente : une partie des non-renouvellements vient d'un manque de suivi, pas d'un refus client."
              label="Contrats oublies ou relances trop tard"
              max={35}
              min={5}
              suffix="%"
              value={forgottenRate}
              onChange={setForgottenRate}
            />
            <div className="simulator-plan-select">
              <label htmlFor="planMonthlyPrice">Plan ContratPro teste</label>
              <select
                id="planMonthlyPrice"
                onChange={(event) => setPlanMonthlyPrice(Number(event.target.value))}
                value={planMonthlyPrice}
              >
                <option value={49}>Starter - 49 EUR/mois</option>
                <option value={99}>Pro - 99 EUR/mois</option>
                <option value={199}>Business - 199 EUR/mois</option>
              </select>
            </div>

            <button className="premium-action rounded-md text-sm font-semibold" onClick={calculate} type="button">
              Calculer ma perte
            </button>
          </div>
        </div>

        <div className="simulator-results" aria-live="polite">
          <div className="simulator-result-card simulator-result-card-loss">
            <span>Revenu annuel a risque</span>
            <strong>{euro(result.lostRevenue)}</strong>
            <p>
              {result.forgottenContracts} contrats potentiellement oublies sur {contractCount}.
            </p>
          </div>

          <div className="simulator-result-card simulator-result-card-recovery">
            <span>Revenu recuperable estime</span>
            <strong>{euro(result.recoveredRevenue)}</strong>
            <p>Hypothese : 70% des contrats oublies peuvent etre sauves avec relances structurees.</p>
          </div>

          <div className="simulator-result-card simulator-result-card-roi">
            <span>ROI net apres ContratPro</span>
            <strong>{result.roiNet >= 0 ? "+" : ""}{euro(result.roiNet)}</strong>
            <p>
              Cout annuel : {euro(result.annualCost)}. Rentabilite estimee :
              {" "}
              {result.breakEvenMonths >= 99 ? "non atteinte" : `${result.breakEvenMonths} mois`}.
            </p>
          </div>

          <div className="simulator-next-step">
            <div>
              <span>{hasCalculated ? "Resultat pret" : "Action suivante"}</span>
              <strong>
                {hasCalculated
                  ? `ROI estime : ${result.roiPercent >= 0 ? "+" : ""}${result.roiPercent}%`
                  : "Calculez, puis montrez le resultat en demo."}
              </strong>
              <p>
                {trackingState === "saved"
                  ? "Simulation journalisee anonymement pour mesurer les hypotheses marche."
                  : "Aucune donnee personnelle n'est demandee dans ce simulateur."}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a className="premium-action rounded-md text-sm font-semibold" href="/demo">
                Programmer une demo
              </a>
              <a className="premium-secondary-action rounded-md px-4 py-2 text-sm font-semibold" href="/pricing">
                Comparer les offres
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <div className="simulator-proof-grid">
          <article>
            <span>01</span>
            <strong>Le probleme devient chiffre</strong>
            <p>Le prospect voit une perte annuelle concrete, pas une promesse logicielle abstraite.</p>
          </article>
          <article>
            <span>02</span>
            <strong>Le prix devient rationnel</strong>
            <p>Starter, Pro et Business se comparent au revenu recupere, pas aux outils generalistes.</p>
          </article>
          <article>
            <span>03</span>
            <strong>La demo demarre mieux</strong>
            <p>Le fondateur arrive avec une hypothese ROI personnalisee pour chaque chauffagiste.</p>
          </article>
        </div>
      </section>
    </PublicShell>
  );
}

function SliderControl({
  alert = false,
  helper,
  label,
  max,
  min,
  onChange,
  step = 1,
  suffix,
  value,
}: {
  alert?: boolean;
  helper?: string;
  label: string;
  max: number;
  min: number;
  onChange: (value: number) => void;
  step?: number;
  suffix: string;
  value: number;
}) {
  return (
    <div className="simulator-slider" data-alert={alert}>
      <div className="simulator-slider-top">
        <label>{label}</label>
        <strong>
          {value}
          {suffix}
        </strong>
      </div>
      <input
        max={max}
        min={min}
        onChange={(event) => onChange(Number(event.target.value))}
        step={step}
        type="range"
        value={value}
      />
      <div className="simulator-slider-scale">
        <span>
          {min}
          {suffix}
        </span>
        <span>
          {max}
          {suffix}
        </span>
      </div>
      {helper ? <p>{helper}</p> : null}
    </div>
  );
}
