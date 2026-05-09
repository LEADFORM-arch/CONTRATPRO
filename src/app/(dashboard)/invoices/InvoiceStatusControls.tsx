"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const actions = [
  ["SENT", "Envoyee"],
  ["PAID", "Payee"],
  ["OVERDUE", "Retard"],
] as const;

export function InvoiceStatusControls({
  currentStatus,
  invoiceId,
}: {
  currentStatus: string;
  invoiceId: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);

  async function updateStatus(status: string) {
    setPending(status);
    await fetch(`/api/invoices/${invoiceId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setPending(null);
    router.refresh();
  }

  return (
    <div className="invoice-status-controls flex flex-wrap gap-2">
      {actions.map(([status, label]) => (
        <button
          className="invoice-status-button rounded-md border px-2 py-1 text-xs font-semibold"
          data-selected={currentStatus === status}
          data-status={status}
          disabled={pending !== null || currentStatus === status}
          key={status}
          onClick={() => updateStatus(status)}
          type="button"
        >
          {pending === status ? "..." : label}
        </button>
      ))}
    </div>
  );
}
