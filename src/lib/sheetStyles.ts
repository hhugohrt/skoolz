import { FileText, Network, Palette, Rows3, Workflow, type LucideIcon } from "lucide-react";

export type Orientation = "portrait" | "landscape";

// Rendus imprimables A4, tous dessinés par l'app à partir des sections de la fiche.
export type SheetStyle = "colorful" | "compact" | "mindmap" | "diagram";

// Ce que l'élève choisit à la génération, et ce qui s'affiche sur la fiche.
export type SheetView = "text" | SheetStyle;

export interface SheetLayout {
  view: SheetView;
  orientation: Orientation;
}

export const DEFAULT_LAYOUT: SheetLayout = { view: "text", orientation: "portrait" };

export interface StyleOption {
  value: SheetView;
  label: string;
  hint: string;
  icon: LucideIcon;
  // Orientation conseillée quand l'élève choisit ce style.
  orientation: Orientation;
}

export const STYLE_OPTIONS: StyleOption[] = [
  { value: "text", label: "Fiche texte", hint: "Simple à relire et modifiable", icon: FileText, orientation: "portrait" },
  { value: "colorful", label: "Fiche colorée", hint: "Blocs colorés, prête à imprimer", icon: Palette, orientation: "portrait" },
  { value: "compact", label: "Fiche compactée", hint: "Un maximum sur une page", icon: Rows3, orientation: "portrait" },
  { value: "mindmap", label: "Carte mentale", hint: "Résumé visuel en étoile", icon: Network, orientation: "landscape" },
  { value: "diagram", label: "Schéma", hint: "Étapes reliées par des flèches", icon: Workflow, orientation: "landscape" },
];

export function isPrintableStyle(view: SheetView): view is SheetStyle {
  return view !== "text";
}
