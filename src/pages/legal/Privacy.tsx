import { Link } from "react-router-dom";
import { LegalField, LegalLayout, LegalSection } from "@/components/legal/LegalLayout";
import { LEGAL } from "@/lib/legal";

export default function Privacy() {
  return (
    <LegalLayout title="Politique de confidentialité" path="/confidentialite">
      <LegalSection title="1. Qui est responsable de tes données ?">
        <p>
          Le responsable du traitement est <LegalField value={LEGAL.editorName} />, éditeur de {LEGAL.siteName} (voir les{" "}
          <Link to="/mentions-legales">mentions légales</Link>). Contact pour toute question sur tes données :{" "}
          <LegalField value={LEGAL.contactEmail} />.
        </p>
      </LegalSection>

      <LegalSection title="2. Quelles données collectons-nous ?">
        <ul>
          <li>
            <strong>Compte :</strong> adresse e-mail, prénom, mot de passe (conservé uniquement sous une forme chiffrée
            irréversible), niveau scolaire, matières choisies et préférence d&rsquo;apparence.
          </li>
          <li>
            <strong>Connexion avec Google (facultative) :</strong> adresse e-mail vérifiée, prénom et identifiant Google.
            Nous n&rsquo;accédons ni à tes contacts ni à tes autres données Google.
          </li>
          <li>
            <strong>E-mails de service :</strong> nous t&rsquo;envoyons uniquement des e-mails liés à ton compte
            (confirmation de ton adresse, réinitialisation du mot de passe), jamais de publicité.
          </li>
          <li>
            <strong>Tes contenus :</strong> les cours (fichiers ou photos) que tu importes, les fiches générées et leurs
            modifications.
          </li>
          <li>
            <strong>Données techniques :</strong> adresse IP et informations de connexion, traitées par notre hébergeur
            pour assurer la sécurité et le bon fonctionnement du service (par exemple pour limiter les tentatives de
            connexion abusives).
          </li>
        </ul>
        <p>
          Nous mesurons l&rsquo;audience du site et l&rsquo;efficacité de nos publicités avec le pixel de mesure de
          <strong> Whop</strong> : il enregistre les pages visitées et peut déposer un identifiant sur ton appareil.
        </p>
      </LegalSection>

      <LegalSection title="3. Pourquoi, et sur quelle base légale ?">
        <ul>
          <li>
            <strong>Fournir le service</strong> (créer ton compte, générer, enregistrer et afficher tes fiches) : exécution
            du contrat d&rsquo;utilisation.
          </li>
          <li>
            <strong>Sécuriser le service</strong> (prévention des abus et des intrusions, limitation du nombre de fiches
            par jour) : intérêt légitime.
          </li>
          <li>
            <strong>Connexion avec Google :</strong> ton consentement, en cliquant sur le bouton dédié.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Qui reçoit tes données ?">
        <p>Nous faisons appel à des prestataires techniques, qui agissent uniquement pour notre compte :</p>
        <ul>
          <li>
            <strong>Vercel Inc.</strong> : hébergement de l&rsquo;application et stockage des fichiers importés.
          </li>
          <li>
            <strong>Neon</strong> : base de données (comptes, cours, fiches).
          </li>
          <li>
            <strong>OpenAI</strong> : génération des fiches. Le texte ou les photos de ton cours lui sont transmis pour
            être analysés.
          </li>
          <li>
            <strong>Resend</strong> : envoi des e-mails de service (confirmation d&rsquo;adresse, mot de passe oublié). Ton
            adresse e-mail lui est transmise à cette seule fin.
          </li>
          <li>
            <strong>Whop</strong> : encaissement des abonnements. Le paiement se fait sur sa page sécurisée : nous ne
            voyons ni ne conservons tes données de carte bancaire, seulement le fait que l&rsquo;abonnement est actif.
          </li>
          <li>
            <strong>Google</strong> : uniquement si tu choisis de te connecter avec ton compte Google.
          </li>
        </ul>
        <p>
          Nous ne vendons pas tes données et ne les partageons avec aucun autre tiers, sauf obligation légale.
        </p>
      </LegalSection>

      <LegalSection title="5. Transferts hors de l'Union européenne">
        <p>
          Ces prestataires sont situés aux États-Unis ou y traitent des données. Ces transferts s&rsquo;appuient sur les
          garanties prévues par le RGPD (notamment les clauses contractuelles types de la Commission européenne ou le
          cadre de protection des données UE–États-Unis, selon le prestataire).
        </p>
      </LegalSection>

      <LegalSection title="6. Combien de temps les conservons-nous ?">
        <ul>
          <li>Tes données de compte et tes contenus sont conservés tant que ton compte existe.</li>
          <li>
            Tu peux <strong>supprimer ton compte à tout moment</strong> depuis « Paramètres » : ton compte, tes cours, tes
            photos et tes fiches sont alors effacés.
          </li>
          <li>Les liens d&rsquo;envoi de photos par QR code expirent au bout de 10 minutes.</li>
          <li>Ta session de connexion expire au bout de 30 jours.</li>
          <li>
            Les liens de confirmation d&rsquo;adresse (24 h) et de réinitialisation du mot de passe (1 h) sont à usage
            unique et stockés uniquement sous forme chiffrée.
          </li>
          <li>Les journaux techniques sont conservés par l&rsquo;hébergeur pour une durée limitée.</li>
        </ul>
      </LegalSection>

      <LegalSection title="7. Tes droits">
        <p>
          Tu disposes d&rsquo;un droit d&rsquo;accès, de rectification, d&rsquo;effacement, de limitation, de portabilité
          et d&rsquo;opposition sur tes données. Tu peux modifier tes fiches directement dans l&rsquo;application et
          supprimer ton compte depuis les paramètres. Pour toute autre demande, écris à{" "}
          <LegalField value={LEGAL.contactEmail} />. Si tu estimes que tes droits ne sont pas respectés, tu peux saisir la
          CNIL (<a href="https://www.cnil.fr">cnil.fr</a>).
        </p>
      </LegalSection>

      <LegalSection title="8. Mineurs">
        <p>
          {LEGAL.siteName} s&rsquo;adresse à des élèves. En France, un mineur peut consentir seul au traitement de ses
          données à partir de 15 ans. En dessous, l&rsquo;accord d&rsquo;un titulaire de l&rsquo;autorité parentale est
          nécessaire ; il peut nous contacter à l&rsquo;adresse ci-dessus pour exercer les droits de son enfant ou demander
          la suppression de son compte.
        </p>
      </LegalSection>

      <LegalSection title="9. Cookies et stockage local">
        <p>
          Le pixel de mesure de Whop peut déposer un identifiant de navigation. Ton navigateur conserve aussi, sur ton appareil, un jeton de
          session qui te permet de rester connecté : il est strictement nécessaire au fonctionnement du service et
          disparaît à la déconnexion. Les polices d&rsquo;écriture sont hébergées sur notre site (aucune requête vers un
          service de polices tiers). La fenêtre de connexion Google n&rsquo;est chargée que si tu cliques sur « Continuer
          avec Google ».
        </p>
      </LegalSection>

      <LegalSection title="10. Sécurité">
        <p>
          Les échanges avec le service sont chiffrés (HTTPS), les mots de passe ne sont jamais stockés en clair et
          tes fiches ne sont accessibles qu&rsquo;une fois connecté à ton compte, et les fichiers que tu importes sont stockés à
          des adresses aléatoires non publiées (sans être pour autant protégés par un mot de passe). Aucun système n&rsquo;étant infaillible, nous te conseillons
          de choisir un mot de passe unique et de ne pas importer d&rsquo;informations sensibles inutiles dans tes cours.
        </p>
      </LegalSection>

      <LegalSection title="11. Évolution de cette politique">
        <p>
          Nous pouvons mettre à jour cette politique ; la date de dernière mise à jour figure en haut de la page. Voir
          aussi les <Link to="/cgu">conditions générales d&rsquo;utilisation</Link>.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
