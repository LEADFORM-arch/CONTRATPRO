"use client";

import { useState } from "react";

type PilotDecisionCopyButtonProps = {
  note: string;
};

export function PilotDecisionCopyButton({ note }: PilotDecisionCopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function copyNote() {
    try {
      await navigator.clipboard.writeText(note);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button className="pilot-decision-copy" onClick={copyNote} type="button">
      {copied ? "Copie" : "Copier la note"}
    </button>
  );
}
