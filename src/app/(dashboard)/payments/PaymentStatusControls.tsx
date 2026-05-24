"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type PaymentStatusControlsProps = {
  currentStatus: string;
  paymentId: string;
};

const actions = [
  { label: "Confirme", status: "CONFIRMED" },
  { label: "Verse", status: "PAID_OUT" },
  { label: "Echec", status: "FAILED" },
];
const PAYMENT_STATUS_TIMEOUT_MS = 20_000;

export function PaymentStatusControls({
  currentStatus,
  paymentId,
}: PaymentStatusControlsProps) {
  const router = useRouter();
  const [loadingStatus, setLoadingStatus] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  async function updateStatus(status: string) {
    setLoadingStatus(status);
    setMessage("");

    const controller = new AbortController();
    const timeout = window.setTimeout(
      () => controller.abort(),
      PAYMENT_STATUS_TIMEOUT_MS,
    );

    let response: Response;
    try {
      response = await fetch(`/api/payments/${paymentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          failureReason: status === "FAILED" ? "A relancer manuellement" : "",
          status,
        }),
        signal: controller.signal,
      });
    } catch (error) {
      setLoadingStatus(null);
      setMessage(
        error instanceof DOMException && error.name === "AbortError"
          ? "Mise a jour trop longue. Le statut actuel reste visible."
          : "Mise a jour impossible.",
      );
      return;
    } finally {
      window.clearTimeout(timeout);
    }

    setLoadingStatus(null);

    if (response.ok) {
      router.refresh();
    } else {
      setMessage("Mise a jour impossible.");
    }
  }

  return (
    <div>
      <div className="payment-status-controls flex flex-wrap gap-2">
        {actions.map((action) => {
          const selected = currentStatus === action.status;
          return (
            <button
              className="payment-status-button rounded-md border px-2 py-1 text-xs font-semibold"
              data-selected={selected}
              data-status={action.status}
              disabled={Boolean(loadingStatus) || selected}
              key={action.status}
              onClick={() => updateStatus(action.status)}
              type="button"
            >
              {loadingStatus === action.status ? "..." : action.label}
            </button>
          );
        })}
      </div>
      {message ? <p className="mt-2 max-w-44 text-xs text-rose-300">{message}</p> : null}
    </div>
  );
}
