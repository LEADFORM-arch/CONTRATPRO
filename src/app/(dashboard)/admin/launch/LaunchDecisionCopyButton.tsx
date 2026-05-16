"use client";

import { useState } from "react";

type LaunchDecisionCopyButtonProps = {
  note: string;
};

export function LaunchDecisionCopyButton({ note }: LaunchDecisionCopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function copyDecision() {
    try {
      await navigator.clipboard.writeText(note);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button className="launch-decision-copy" onClick={copyDecision} type="button">
      {copied ? "Copie" : "Copier la decision"}
    </button>
  );
}
