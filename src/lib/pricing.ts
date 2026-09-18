// Offres affichées à l'élève et au parent. Les prix sont à ajuster ici ; le paiement lui-même est branché côté API.
export interface Plan {
  id: "monthly" | "yearly";
  name: string;
  price: string;
  period: string;
  note: string;
  badge?: string;
}

export const PLANS: Plan[] = [
  { id: "yearly", name: "Annuel", price: "29,99 €", period: "/ an", note: "soit 2,50 € par mois", badge: "-50 %" },
  { id: "monthly", name: "Mensuel", price: "4,99 €", period: "/ mois", note: "Sans engagement" },
];

export const PREMIUM_FEATURES = [
  "Toutes tes fiches débloquées, sans limite de lecture",
  "Fiche colorée, compactée, carte mentale et schéma, prêtes à imprimer en A4",
  "Modification de tes fiches, quiz et flashcards",
  "Génération de nouvelles fiches chaque jour",
];
