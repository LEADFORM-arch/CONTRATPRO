"use client";

import { useState } from "react";

export function PilotBriefCopyButton({ brief }: { brief: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(brief);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button className="pilot-brief-copy-button" onClick={handleCopy} type="button">
      {copied ? "Fiche copiee" : "Copier fiche"}
    </button>
  );
}
