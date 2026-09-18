import { Link } from "react-router-dom";
import { LegalField, LegalLayout, LegalSection } from "@/components/legal/LegalLayout";
import { LEGAL } from "@/lib/legal";

export default function Terms() {
  return (
    <LegalLayout title="Conditions générales d'utilisation" path="/cgu">
      <LegalSection title="1. Objet">
        <p>
          Les présentes conditions encadrent l&rsquo;utilisation du service {LEGAL.siteName}, accessible à l&rsquo;adresse{" "}
          {LEGAL.siteUrl}, édité par <LegalField value={LEGAL.editorName} /> (voir les{" "}
          <Link to="/mentions-legales">mentions légales</Link>). {LEGAL.siteName} permet d&rsquo;importer un cours
          (fichier ou photos) et d&rsquo;en obtenir une fiche de révision générée par intelligence artificielle, de la
          modifier, de la mettre en page et de l&rsquo;imprimer.
        </p>
        <p>En créant un compte ou en utilisant le service, tu acceptes ces conditions.</p>
      </LegalSection>

      <LegalSection title="2. Compte et âge minimum">
        <p>
          Tu peux créer un compte avec une adresse e-mail et un mot de passe, ou avec ton compte Google. Tu t&rsquo;engages
          à fournir des informations exactes et à garder ton mot de passe confidentiel : tu es responsable de l&rsquo;usage
          qui est fait de ton compte.
        </p>
        <p>
          Le service est destiné aux personnes de <strong>15 ans ou plus</strong>. Si tu as moins de 15 ans, tu ne peux
          l&rsquo;utiliser qu&rsquo;avec l&rsquo;accord d&rsquo;un titulaire de l&rsquo;autorité parentale, qui doit
          pouvoir nous contacter à l&rsquo;adresse indiquée plus bas.
        </p>
      </LegalSection>

      <LegalSection title="3. Ce que fait le service, et ses limites">
        <p>
          Les fiches sont produites automatiquement à partir du cours que tu importes. Malgré les vérifications mises en
          place, <strong>une fiche peut contenir des erreurs, des oublis ou des approximations</strong>, notamment pour
          des cours manuscrits ou de mauvaise qualité. Tu dois toujours la relire et la comparer à ton cours avant de
          t&rsquo;en servir pour réviser. {LEGAL.siteName} ne garantit ni l&rsquo;exactitude ni l&rsquo;exhaustivité des
          fiches et ne peut être tenu responsable de leurs résultats scolaires.
        </p>
        <p>
          Le service est fourni « en l&rsquo;état ». Nous pouvons le modifier, le limiter (par exemple un nombre maximal
          de fiches par jour) ou l&rsquo;interrompre temporairement pour des raisons techniques ou de maintenance.
        </p>
      </LegalSection>

      <LegalSection title="4. Tes contenus">
        <p>
          Tu restes propriétaire des cours, photos et fiches que tu importes ou crées. Tu nous accordes uniquement le
          droit de les stocker et de les traiter (y compris en les transmettant à notre prestataire d&rsquo;intelligence
          artificielle) pour te fournir le service. Nous ne les utilisons pas à d&rsquo;autres fins.
        </p>
        <p>Tu garantis avoir le droit d&rsquo;importer les contenus que tu déposes. Il est interdit d&rsquo;importer :</p>
        <ul>
          <li>des contenus illicites, violents, haineux ou portant atteinte à la vie privée d&rsquo;autrui ;</li>
          <li>
            des contenus que tu n&rsquo;as pas le droit de reproduire (par exemple des œuvres protégées diffusées sans
            autorisation) ;
          </li>
          <li>des documents d&rsquo;examen ou de concours en cours d&rsquo;épreuve.</li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Utilisation acceptable">
        <p>
          Tu t&rsquo;engages à ne pas perturber le service (tentatives d&rsquo;intrusion, envoi massif de requêtes,
          contournement des limites), à ne pas l&rsquo;utiliser pour nuire à autrui, ni à revendre l&rsquo;accès à ton
          compte. En cas de manquement, nous pouvons suspendre ou supprimer ton compte.
        </p>
      </LegalSection>

      <LegalSection title="6. Propriété intellectuelle">
        <p>
          Le site, son design, son code, son logo et sa mascotte sont protégés. Aucune partie ne peut être copiée ou
          réutilisée sans autorisation. Les fiches que tu génères pour ton usage personnel t&rsquo;appartiennent, dans la
          limite des droits que tu détiens sur le cours d&rsquo;origine.
        </p>
      </LegalSection>

      <LegalSection title="7. Données personnelles">
        <p>
          Le traitement de tes données est décrit dans la <Link to="/confidentialite">politique de confidentialité</Link>.
          Tu peux à tout moment supprimer ton compte et toutes tes données depuis la page « Paramètres » de
          l&rsquo;application.
        </p>
      </LegalSection>

      <LegalSection title="8. Responsabilité">
        <p>
          Dans la limite permise par la loi, notre responsabilité ne peut être engagée pour les dommages indirects, la
          perte de données due à un cas de force majeure ou à un incident chez nos prestataires techniques, ni pour un
          usage du service contraire aux présentes conditions. Ces limites ne s&rsquo;appliquent pas aux droits que la loi
          te reconnaît impérativement.
        </p>
      </LegalSection>

      <LegalSection title="9. Résiliation">
        <p>
          Tu peux supprimer ton compte à tout moment depuis les paramètres. Nous pouvons suspendre ou supprimer un compte
          en cas de non-respect de ces conditions ou d&rsquo;inactivité prolongée, après t&rsquo;en avoir informé lorsque
          c&rsquo;est possible.
        </p>
      </LegalSection>

      <LegalSection title="10. Modification des conditions">
        <p>
          Nous pouvons mettre à jour ces conditions ; la date de dernière mise à jour figure en haut de cette page. En cas
          de changement important, nous t&rsquo;en informerons dans l&rsquo;application. Continuer à utiliser le service
          après une mise à jour vaut acceptation.
        </p>
      </LegalSection>

      <LegalSection title="11. Droit applicable et contact">
        <p>
          Ces conditions sont soumises au droit français. Pour toute question ou réclamation, écris-nous à{" "}
          <LegalField value={LEGAL.contactEmail} />. En cas de litige, une solution amiable sera recherchée avant toute
          action en justice.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
