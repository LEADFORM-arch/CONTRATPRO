"use client";

import { useCallback, useEffect, useState } from "react";

import {
  buildAcceptedCookieChoices,
  buildRejectedCookieChoices,
  COOKIE_BANNER_ID,
  COOKIE_BANNER_VERSION,
  COOKIE_CATEGORIES,
  COOKIE_CONSENT_EXPIRY_MS,
  COOKIE_CONSENT_STORAGE_KEY,
  type ConsentCategory,
  type StoredCookieConsent,
} from "@/lib/cookies-config";

type ConsentChoices = Record<ConsentCategory, boolean>;

export type CookieConsentState = {
  choices: ConsentChoices | null;
  hydrated: boolean;
  showBanner: boolean;
  showModal: boolean;
};

export type CookieConsentControls = CookieConsentState & {
  acceptAll: () => void;
  closeModal: () => void;
  openModal: () => void;
  rejectAll: () => void;
  saveChoices: (choices: ConsentChoices) => void;
};

function readStoredConsent() {
  try {
    const raw = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const stored = JSON.parse(raw) as StoredCookieConsent;
    if (stored.bannerId !== COOKIE_BANNER_ID || stored.version !== COOKIE_BANNER_VERSION) {
      return null;
    }

    const timestamp = new Date(stored.timestamp).getTime();
    if (!Number.isFinite(timestamp) || Date.now() - timestamp > COOKIE_CONSENT_EXPIRY_MS) {
      return null;
    }

    return stored;
  } catch {
    return null;
  }
}

function writeStoredConsent(choices: ConsentChoices) {
  const stored: StoredCookieConsent = {
    bannerId: COOKIE_BANNER_ID,
    choices,
    timestamp: new Date().toISOString(),
    version: COOKIE_BANNER_VERSION,
  };

  window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(stored));
}

function forceRequiredChoices(choices: ConsentChoices) {
  const safeChoices = { ...choices };
  for (const category of COOKIE_CATEGORIES) {
    if (category.required) {
      safeChoices[category.id] = true;
    }
  }
  return safeChoices;
}

export function useCookieConsent(
  onConsentChange?: (choices: ConsentChoices) => void,
): CookieConsentControls {
  const [hydrated, setHydrated] = useState(false);
  const [choices, setChoices] = useState<ConsentChoices | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const stored = readStoredConsent();

    if (stored) {
      setChoices(stored.choices);
      setShowBanner(false);
      onConsentChange?.(stored.choices);
    } else {
      setChoices(null);
      setShowBanner(true);
    }

    setHydrated(true);
  }, [onConsentChange]);

  const persist = useCallback(
    (nextChoices: ConsentChoices) => {
      const safeChoices = forceRequiredChoices(nextChoices);
      writeStoredConsent(safeChoices);
      setChoices(safeChoices);
      setShowBanner(false);
      setShowModal(false);
      onConsentChange?.(safeChoices);
    },
    [onConsentChange],
  );

  return {
    acceptAll: () => persist(buildAcceptedCookieChoices()),
    choices,
    closeModal: () => setShowModal(false),
    hydrated,
    openModal: () => setShowModal(true),
    rejectAll: () => persist(buildRejectedCookieChoices()),
    saveChoices: persist,
    showBanner,
    showModal,
  };
}
