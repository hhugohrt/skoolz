// Informations légales de l'éditeur du site. À COMPLÉTER avant l'ouverture au public :
// elles s'affichent dans les mentions légales, les CGU et la politique de confidentialité.
// Tant qu'un champ est vide, il apparaît en rouge « À compléter » sur la page et les pages
// légales restent en noindex.
export const LEGAL = {
  siteName: "Skoolz",
  siteUrl: "https://www.skoolz.club",

  // Éditeur du site (personne physique ou société)
  editorName: "", // ex : « Hugo Dupont » ou « Skoolz SAS »
  editorStatus: "", // ex : « Entrepreneur individuel », « SAS au capital de 1 000 € »
  editorAddress: "", // adresse postale complète
  editorRegistration: "", // ex : « SIRET 123 456 789 00012 » (laisser « Non applicable » pour un particulier)
  publicationDirector: "", // nom du directeur de la publication

  // Adresse à laquelle les utilisateurs peuvent vous écrire (droits RGPD, questions, signalements)
  contactEmail: "",

  lastUpdated: "19 septembre 2026",
} as const;

export function isLegalComplete(): boolean {
  return [
    LEGAL.editorName,
    LEGAL.editorStatus,
    LEGAL.editorAddress,
    LEGAL.editorRegistration,
    LEGAL.publicationDirector,
    LEGAL.contactEmail,
  ].every((value) => value.trim().length > 0);
}
