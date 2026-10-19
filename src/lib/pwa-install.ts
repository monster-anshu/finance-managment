// Web-only: tracks whether the site can be installed as a PWA and how.
// Imported only from .web.tsx files.

/** Chromium's install prompt event (not in the DOM typings). */
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

declare global {
  interface Window {
    /** Captured early by the inline script in public/index.html. */
    __pwaInstallPrompt?: BeforeInstallPromptEvent;
  }
  interface Navigator {
    /** iOS Safari: true when launched from the home screen. */
    standalone?: boolean;
  }
}

/**
 * - `installed`: running as the installed app.
 * - `prompt`: the browser can show its install dialog (Chrome, Edge, Android).
 * - `ios`: iOS has no install API; the user must use Share → Add to Home Screen.
 * - `manual`: no install API (e.g. Firefox, Safari on Mac); use the browser menu.
 */
export type PwaInstallStatus = "installed" | "prompt" | "ios" | "manual";

const listeners = new Set<() => void>();
let installedThisSession = false;

function notify() {
  listeners.forEach((listener) => listener());
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    window.__pwaInstallPrompt = event as BeforeInstallPromptEvent;
    notify();
  });
  window.addEventListener("appinstalled", () => {
    installedThisSession = true;
    window.__pwaInstallPrompt = undefined;
    notify();
  });
}

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    navigator.standalone === true
  );
}

function isIos(): boolean {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    // iPadOS reports itself as a Mac.
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

export function getPwaInstallStatus(): PwaInstallStatus {
  if (typeof window === "undefined") return "manual";
  if (installedThisSession || isStandalone()) return "installed";
  if (window.__pwaInstallPrompt) return "prompt";
  if (isIos()) return "ios";
  return "manual";
}

export function subscribePwaInstall(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Shows the browser's install dialog. Resolves true if the user accepted. */
export async function promptPwaInstall(): Promise<boolean> {
  const event = window.__pwaInstallPrompt;
  if (!event) return false;
  // The event can only be used once.
  window.__pwaInstallPrompt = undefined;
  await event.prompt();
  const { outcome } = await event.userChoice;
  notify();
  return outcome === "accepted";
}
