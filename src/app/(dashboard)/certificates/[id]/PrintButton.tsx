"use client";

export function PrintButton() {
  return (
    <button
      className="premium-action rounded-md px-4 py-2 text-sm font-semibold print:hidden"
      onClick={() => window.print()}
      type="button"
    >
      Imprimer PDF
    </button>
  );
}
