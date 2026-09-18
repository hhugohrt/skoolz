import { Link } from "react-router-dom";
import { LegalField, LegalLayout, LegalSection } from "@/components/legal/LegalLayout";
import { LEGAL } from "@/lib/legal";

export default function LegalNotice() {
  return (
    <LegalLayout title="Mentions légales" path="/mentions-legales">
      <LegalSection title="Éditeur du site">
        <ul>
          <li>
            <strong>Nom / raison sociale :</strong> <LegalField value={LEGAL.editorName} />
          </li>
          <li>
            <strong>Statut :</strong> <LegalField value={LEGAL.editorStatus} />
          </li>
          <li>
            <strong>Adresse :</strong> <LegalField value={LEGAL.editorAddress} />
          </li>
          <li>
            <strong>Immatriculation :</strong> <LegalField value={LEGAL.editorRegistration} />
          </li>
          <li>
            <strong>Directeur de la publication :</strong> <LegalField value={LEGAL.publicationDirector} />
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="Contact" id="contact">
        <p>
          Pour toute question, demande ou signalement : <LegalField value={LEGAL.contactEmail} />.
        </p>
      </LegalSection>

      <LegalSection title="Hébergement">
        <p>
          Le site et son API sont hébergés par <strong>Vercel Inc.</strong> (États-Unis) — vercel.com. La base de données
          est hébergée par <strong>Neon</strong> (neon.tech). Le nom de domaine est enregistré chez <strong>OVH</strong>.
        </p>
      </LegalSection>

      <LegalSection title="Propriété intellectuelle">
        <p>
          L&rsquo;ensemble des éléments du site ({LEGAL.siteName}, logo, mascotte, design, textes, code) est protégé par le
          droit de la propriété intellectuelle. Toute reproduction ou réutilisation non autorisée est interdite.
        </p>
      </LegalSection>

      <LegalSection title="Données personnelles et conditions d'utilisation">
        <p>
          Consulte la <Link to="/confidentialite">politique de confidentialité</Link> et les{" "}
          <Link to="/cgu">conditions générales d&rsquo;utilisation</Link>.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
