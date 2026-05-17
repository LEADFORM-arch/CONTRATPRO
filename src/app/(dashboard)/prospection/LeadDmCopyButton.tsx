"use client";

import { useState } from "react";

export function LeadDmCopyButton({ script }: { script: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(script);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button className="lead-dm-copy-button" onClick={handleCopy} type="button">
      {copied ? "DM copie" : "Copier DM"}
    </button>
  );
}
