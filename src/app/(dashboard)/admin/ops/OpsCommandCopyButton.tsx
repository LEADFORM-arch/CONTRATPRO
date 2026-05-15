"use client";

import { useState } from "react";

type OpsCommandCopyButtonProps = {
  command: string;
};

export function OpsCommandCopyButton({ command }: OpsCommandCopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function copyCommand() {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      aria-label={`Copier la commande ${command}`}
      className="ops-copy-command-button"
      onClick={copyCommand}
      type="button"
    >
      {copied ? "Copie" : "Copier"}
    </button>
  );
}
