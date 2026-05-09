import { PublicSection, PublicShell } from "@/components/marketing/PublicShell";

export default function LegalPage() {
  return (
    <PublicShell>
      <PublicSection
        description="Informations a completer avant publication commerciale. Cette page fournit une base propre pour le lancement."
        title="Mentions legales"
      >
        <div className="public-legal-panel">
          <h1>Editeur</h1>
          <p>
            ContratPro est edite par la societe exploitante a renseigner avant
            mise en production : denomination sociale, forme juridique, capital,
            SIRET, RCS, adresse du siege et email de contact.
          </p>

          <h2>Hebergement</h2>
          <p>
            Application hebergee sur Vercel. Donnees applicatives stockees dans
            Supabase. Les informations exactes d'hebergement doivent etre
            confirmees avec les comptes de production utilises.
          </p>

          <h2>Contact</h2>
          <p>
            Contact fondateur : esport.hub.pro@proton.me. Une adresse de support
            dediee pourra etre ajoutee avant lancement public.
          </p>
        </div>
      </PublicSection>
    </PublicShell>
  );
}
