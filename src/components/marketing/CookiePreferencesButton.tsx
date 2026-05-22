"use client";

import { useCookieConsentModal } from "@/components/cookie-consent";

export function CookiePreferencesButton() {
  const { open } = useCookieConsentModal();

  return (
    <button className="public-footer-cookie-button" onClick={open} type="button">
      Gerer mes cookies
    </button>
  );
}
