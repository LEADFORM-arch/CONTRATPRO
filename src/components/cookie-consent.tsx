"use client";

import { useCallback, useEffect } from "react";

import { CookieConsentModal } from "@/components/cookie-consent-modal";
import { useCookieConsent } from "@/hooks/use-cookie-consent";
import type { ConsentCategory } from "@/lib/cookies-config";

type ConsentChoices = Record<ConsentCategory, boolean>;

type CookieConsentProps = {
  onConsentChange?: (choices: ConsentChoices) => void;
};

export const COOKIE_MODAL_EVENT = "contratpro:open-cookie-modal";

export function CookieConsent({ onConsentChange }: CookieConsentProps) {
  const {
    acceptAll,
    choices,
    closeModal,
    hydrated,
    openModal,
    rejectAll,
    saveChoices,
    showBanner,
    showModal,
  } = useCookieConsent(onConsentChange);

  useEffect(() => {
    function handleOpenCookieModal() {
      openModal();
    }

    window.addEventListener(COOKIE_MODAL_EVENT, handleOpenCookieModal);
    return () => window.removeEventListener(COOKIE_MODAL_EVENT, handleOpenCookieModal);
  }, [openModal]);

  if (!hydrated) {
    return null;
  }

  return (
    <>
      {showBanner ? (
        <section
          aria-label="Gestion des cookies"
          aria-live="polite"
          className="cookie-consent-banner"
          data-od-id="cookie-consent-banner"
        >
          <div className="cookie-consent-copy">
            <p>Cookies ContratPro</p>
            <h2>Choisir les traceurs avant toute mesure d'audience.</h2>
            <span>
              Les cookies essentiels securisent la session. Les statistiques et
              le marketing restent desactives tant que vous ne donnez pas votre
              accord. Vous pouvez modifier votre choix a tout moment.
            </span>
            <a href="/cookies">Lire la politique cookies</a>
          </div>
          <div className="cookie-consent-actions">
            <button className="cookie-consent-equal-button" onClick={rejectAll} type="button">
              Tout refuser
            </button>
            <button className="cookie-consent-equal-button" onClick={acceptAll} type="button">
              Tout accepter
            </button>
            <button className="cookie-consent-secondary-button" onClick={openModal} type="button">
              Personnaliser
            </button>
          </div>
        </section>
      ) : null}

      {showModal ? (
        <CookieConsentModal
          currentChoices={choices}
          onAcceptAll={acceptAll}
          onClose={closeModal}
          onRejectAll={rejectAll}
          onSave={saveChoices}
        />
      ) : null}
    </>
  );
}

export function useCookieConsentModal() {
  const open = useCallback(() => {
    window.dispatchEvent(new CustomEvent(COOKIE_MODAL_EVENT));
  }, []);

  return { open };
}
