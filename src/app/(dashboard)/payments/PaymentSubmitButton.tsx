"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

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

    const response = await fetch(`/api/payments/${paymentId}/submit`, {
      method: "POST",
    });
    const payload = (await response.json().catch(() => null)) as
      | { error?: string }
      | null;

    if (!response.ok) {
      setState("error");
      setMessage(payload?.error ?? "Soumission impossible.");
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
