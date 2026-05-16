"use client";

import { useState } from "react";

type ProspectionCopyButtonProps = {
  label?: string;
  text: string;
};

export function ProspectionCopyButton({
  label = "Copier",
  text,
}: ProspectionCopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function copyText() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button className="prospection-copy-button" onClick={copyText} type="button">
      {copied ? "Copie" : label}
    </button>
  );
}
