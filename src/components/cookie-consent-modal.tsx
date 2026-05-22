"use client";

import { useEffect, useRef, useState } from "react";

import {
  buildDefaultCookieChoices,
  COOKIE_CATEGORIES,
  type ConsentCategory,
} from "@/lib/cookies-config";

type ConsentChoices = Record<ConsentCategory, boolean>;

type CookieConsentModalProps = {
  currentChoices: ConsentChoices | null;
  onAcceptAll: () => void;
  onClose: () => void;
  onRejectAll: () => void;
  onSave: (choices: ConsentChoices) => void;
};

export function CookieConsentModal({
  currentChoices,
  onAcceptAll,
  onClose,
  onRejectAll,
  onSave,
}: CookieConsentModalProps) {
  const [localChoices, setLocalChoices] = useState<ConsentChoices>(
    currentChoices ?? buildDefaultCookieChoices(),
  );
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab" || !modalRef.current) {
        return;
      }

      const focusable = modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  function toggleCategory(categoryId: ConsentCategory) {
    const category = COOKIE_CATEGORIES.find((item) => item.id === categoryId);
    if (category?.required) {
      return;
    }

    setLocalChoices((current) => ({
      ...current,
      [categoryId]: !current[categoryId],
    }));
  }

  return (
    <div
      aria-labelledby="cookie-consent-title"
      aria-modal="true"
      className="cookie-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
    >
      <div className="cookie-modal-panel" ref={modalRef}>
        <div className="cookie-modal-header">
          <div>
            <p>Confidentialite</p>
            <h2 id="cookie-consent-title">Gerer mes cookies</h2>
          </div>
          <button
            aria-label="Fermer la gestion des cookies"
            className="cookie-icon-button"
            onClick={onClose}
            ref={closeButtonRef}
            type="button"
          >
            x
          </button>
        </div>

        <div className="cookie-category-list">
          {COOKIE_CATEGORIES.map((category) => {
            const active = localChoices[category.id];
            return (
              <section className="cookie-category-card" key={category.id}>
                <div>
                  <div className="cookie-category-heading">
                    <h3>{category.label}</h3>
                    {category.required ? <span>Obligatoire</span> : null}
                  </div>
                  <p>{category.description}</p>
                  {category.cookies.length ? (
                    <details className="cookie-trace-list">
                      <summary>Voir les traceurs ({category.cookies.length})</summary>
                      <div>
                        {category.cookies.map((cookie) => (
                          <article key={cookie.name}>
                            <strong>{cookie.name}</strong>
                            <span>
                              {cookie.purpose} - {cookie.duration}
                            </span>
                          </article>
                        ))}
                      </div>
                    </details>
                  ) : null}
                </div>
                <button
                  aria-checked={active}
                  aria-label={`${active ? "Desactiver" : "Activer"} ${category.label}`}
                  className="cookie-switch"
                  data-active={active}
                  disabled={category.required}
                  onClick={() => toggleCategory(category.id)}
                  role="switch"
                  type="button"
                >
                  <span />
                </button>
              </section>
            );
          })}
        </div>

        <div className="cookie-modal-actions">
          <button className="cookie-choice-button" onClick={onRejectAll} type="button">
            Tout refuser
          </button>
          <button
            className="cookie-choice-button cookie-choice-button-primary"
            onClick={() => onSave(localChoices)}
            type="button"
          >
            Enregistrer
          </button>
          <button className="cookie-choice-button" onClick={onAcceptAll} type="button">
            Tout accepter
          </button>
        </div>
      </div>
    </div>
  );
}
