# Demo SaaS ContratPro

Demo HyperFrames de 43 secondes construite a partir de captures reelles du SaaS ContratPro.

## Contenu

- `index.html` : composition principale HyperFrames.
- `DESIGN.md` : direction visuelle premium ContratPro.
- `assets/screenshots/` : captures du cockpit, relances, onboarding, import, contrats, factures et paiements.
- `scripts/capture-screenshots.cjs` : script de capture via Chrome local.

## Storyline

1. Cockpit dirigeant CVC.
2. Architecte IA de croissance pour les relances.
3. Import Excel/CSV vers portefeuille contrats.
4. Onboarding premium.
5. Factures et paiements SEPA.
6. Demo pilote chauffagiste.
7. Appel a programmer une demo.

## Commandes

```powershell
npx.cmd hyperframes lint
npx.cmd hyperframes preview --port 3017
npx.cmd hyperframes render --quality standard --output renders/contratpro-demo.mp4
```

## Note environnement

`lint` passe avec 0 erreur. Les warnings restants concernent la densite volontaire du montage mono-fichier.

Sur cette machine, `validate` et `inspect` peuvent echouer avec `ENOSPC` si HyperFrames tente d'ecrire son navigateur headless. Liberer de l'espace disque puis relancer :

```powershell
npx.cmd hyperframes validate
npx.cmd hyperframes inspect
```
