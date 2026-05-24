"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const PAYMENT_SUBMIT_TIMEOUT_MS = 35_000;

export function PaymentSubmitButton({
  disabled,
  paymentId,
}: {
  disabled: boolean;
  paymentId: string;
}) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submitPayment() {
    setState("loading");
    setMessage("");

    const controller = new AbortController();
    const timeout = window.setTimeout(
      () => controller.abort(),
      PAYMENT_SUBMIT_TIMEOUT_MS,
    );

    let response: Response;
    let payload: { error?: string } | null = null;
    try {
      response = await fetch(`/api/payments/${paymentId}/submit`, {
        method: "POST",
        signal: controller.signal,
      });
      payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;
    } catch (error) {
      setState("error");
      setMessage(
        error instanceof DOMException && error.name === "AbortError"
          ? "GoCardless sandbox ne repond pas assez vite. Le paiement reste programme."
          : "Soumission impossible. Le paiement reste programme.",
      );
      return;
    } finally {
      window.clearTimeout(timeout);
    }

    if (!response.ok) {
      setState("error");
      setMessage(payload?.error ?? "Soumission impossible. Le paiement reste programme.");
      return;
    }

    setState("idle");
    router.refresh();
  }

  return (
    <div>
      <button
        className="payment-provider-button rounded-md border px-2 py-1 text-xs font-semibold"
        disabled={disabled || state === "loading"}
        onClick={submitPayment}
        type="button"
      >
        {state === "loading" ? "Soumission..." : "Soumettre SEPA"}
      </button>
      {message ? <p className="mt-2 max-w-44 text-xs text-rose-300">{message}</p> : null}
    </div>
  );
}
