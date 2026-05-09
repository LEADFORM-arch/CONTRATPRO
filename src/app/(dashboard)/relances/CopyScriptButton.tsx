"use client";

import { useState } from "react";

export function CopyScriptButton({ script }: { script: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(script);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button
      className="premium-secondary-action rounded-md px-3 py-2 text-sm font-semibold"
      onClick={handleCopy}
      type="button"
    >
      {copied ? "Copie" : "Copier script"}
    </button>
  );
}
