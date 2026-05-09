"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DocumentSendButton({
  endpoint,
  label,
}: {
  endpoint: string;
  label: string;
}) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "loading" | "error" | "sent">(
    "idle",
  );
  const [message, setMessage] = useState("");

  async function sendDocument() {
    setState("loading");
    setMessage("");

    const response = await fetch(endpoint, { method: "POST" });
    const payload = (await response.json().catch(() => null)) as
      | { error?: string }
      | null;

    if (!response.ok) {
      setState("error");
      setMessage(payload?.error ?? "Envoi impossible.");
      return;
    }

    setState("sent");
    setMessage("Envoye et journalise.");
    router.refresh();
  }

  return (
    <div className="document-send-action">
      <button
        className="premium-action rounded-md px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
        disabled={state === "loading"}
        onClick={sendDocument}
        type="button"
      >
        {state === "loading" ? "Envoi..." : state === "sent" ? "Envoye" : label}
      </button>
      {message ? (
        <p
          className={`mt-2 text-xs leading-5 ${
            state === "error" ? "text-rose-300" : "text-emerald-300"
          }`}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
