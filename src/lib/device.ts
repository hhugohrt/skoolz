// Smartphone (pas tablette ni ordinateur) : sert à n'afficher le tuto « écran d'accueil » que sur téléphone.
export function isPhone(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPhone|iPod|Android.+Mobile/i.test(navigator.userAgent);
}

export function isIos(): boolean {
  return typeof navigator !== "undefined" && /iPhone|iPod|iPad/i.test(navigator.userAgent);
}

// Déjà lancée depuis l'écran d'accueil : inutile d'expliquer comment l'installer.
export function isInstalledApp(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function shouldShowInstallTutorial(): boolean {
  return isPhone() && !isInstalledApp();
}
