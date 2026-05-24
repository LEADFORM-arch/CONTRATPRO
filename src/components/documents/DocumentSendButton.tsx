"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const DOCUMENT_SEND_TIMEOUT_MS = 30_000;

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

    const controller = new AbortController();
    const timeout = window.setTimeout(
      () => controller.abort(),
      DOCUMENT_SEND_TIMEOUT_MS,
    );

    let response: Response;
    let payload: { error?: string } | null = null;
    try {
      response = await fetch(endpoint, {
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
          ? "Envoi trop long. Le PDF reste disponible, verifiez Resend plus tard."
          : "Envoi impossible. Le PDF reste disponible.",
      );
      return;
    } finally {
      window.clearTimeout(timeout);
    }

    if (!response.ok) {
      setState("error");
      setMessage(payload?.error ?? "Envoi impossible. Le PDF reste disponible.");
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
