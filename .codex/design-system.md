# 🎨 Design System — CONTRATPRO

> ⚠️ RÈGLE ABSOLUE : Codex NE DOIT JAMAIS inventer de styles.
> Il DOIT utiliser UNIQUEMENT les tokens, composants et patterns définis ici.
> Si un élément n'existe pas dans ce fichier, demande-moi avant de le créer.

---

## 1. TOKENS DE DESIGN (Variables Tailwind)

### Couleurs — Palette CONTRATPRO

```css
/* globals.css ou tailwind.config.ts */
:root {
  /* Primary — Bleu professionnel (confiance, fiabilité) */
  --primary-50:  #eff6ff;
  --primary-100: #dbeafe;
  --primary-200: #bfdbfe;
  --primary-300: #93c5fd;
  --primary-400: #60a5fa;
  --primary-500: #3b82f6;  /* ← Couleur principale CONTRATPRO */
  --primary-600: #2563eb;
  --primary-700: #1d4ed8;
  --primary-800: #1e40af;
  --primary-900: #1e3a8a;

  /* Secondary — Vert (succès, validation, actif) */
  --secondary-50:  #f0fdf4;
  --secondary-100: #dcfce7;
  --secondary-200: #bbf7d0;
  --secondary-300: #86efac;
  --secondary-400: #4ade80;
  --secondary-500: #22c55e;
  --secondary-600: #16a34a;
  --secondary-700: #15803d;

  /* Accent — Orange (alertes, relances, attention) */
  --accent-50:  #fff7ed;
  --accent-100: #ffedd5;
  --accent-200: #fed7aa;
  --accent-300: #fdba74;
  --accent-400: #fb923c;
  --accent-500: #f97316;
  --accent-600: #ea580c;

  /* Neutral — Gris professionnels */
  --neutral-50:  #fafafa;
  --neutral-100: #f5f5f5;
  --neutral-200: #e5e5e5;
  --neutral-300: #d4d4d4;
  --neutral-400: #a3a3a3;
  --neutral-500: #737373;
  --neutral-600: #525252;
  --neutral-700: #404040;
  --neutral-800: #262626;
  --neutral-900: #171717;

  /* Semantic — États métier */
  --success: #22c55e;   /* Contrat actif, paiement réussi */
  --warning: #f59e0b;   /* Relance à venir, échéance proche */
  --error:   #ef4444;   /* Contrat expiré, paiement échoué */
  --info:    #3b82f6;   /* Information, notification */

  /* Backgrounds */
  --bg-primary:   #ffffff;
  --bg-secondary: #f8fafc;  /* Fond dashboard */
  --bg-tertiary:  #f1f5f9;  /* Cards secondaires */
  --bg-dark:      #0f172a;  /* Header admin, sidebar foncé */
}
```

### Typographie — Échelle verrouillée

| Token | Tailwind | Usage CONTRATPRO |
|-------|----------|------------------|
| `text-xs` | 12px | Badges statut, timestamps |
| `text-sm` | 14px | Body, descriptions, tableaux |
| `text-base` | 16px | Body principal, formulaires |
| `text-lg` | 18px | Titres de section, cards |
| `text-xl` | 20px | Titres de page |
| `text-2xl` | 24px | Dashboard headers |
| `text-3xl` | 30px | Page héros, landing |
| `text-4xl` | 36px | Landing page principale |

**Règles typographiques :**
- Titres : `font-semibold` (600)
- Body : `font-normal` (400)
- Labels/métriques : `font-medium` (500)
- **JAMAIS** plus de 3 tailles de police par page
- **JAMAIS** de `font-light` (300) sur du texte < 16px

### Espacements — Échelle verrouillée

| Token | Valeur | Usage CONTRATPRO |
|-------|--------|------------------|
| `space-1` | 4px | Micro-ajustements |
| `space-2` | 8px | Gap entre éléments liés |
| `space-3` | 12px | Padding interne petit |
| `space-4` | 16px | Padding standard (inputs, boutons) |
| `space-6` | 24px | Gap entre sections |
| `space-8` | 32px | Padding sections dashboard |
| `space-12` | 48px | Gap entre blocs majeurs |
| `space-16` | 64px | Padding page |

**Règle d'or :** Progression 1.5x (4, 8, 12, 16, 24, 32, 48, 64).

### Ombres — Verrouillées

```css
--shadow-sm:  0 1px 2px 0 rgb(0 0 0 / 0.05);   /* Cards statiques */
--shadow-md:  0 4px 6px -1px rgb(0 0 0 / 0.1);  /* Cards interactives */
--shadow-lg:  0 10px 15px -3px rgb(0 0 0 / 0.1); /* Modales, dropdowns */
--shadow-xl:  0 20px 25px -5px rgb(0 0 0 / 0.1); /* Modales importantes */
```

**Règles :**
- Cards dashboard : `shadow-sm`
- Cards avec actions : `shadow-md`
- Modales/dropdowns : `shadow-lg`
- **JAMAIS** de `shadow-xl` sur des éléments statiques

### Bordures — Verrouillées

| Token | Valeur | Usage |
|-------|--------|-------|
| `border` | 1px solid neutral-200 | Bordures standard |
| `border-input` | 1px solid neutral-300 | Inputs, selects |
| `border-focus` | 2px solid primary-500 | Focus states |
| `border-error` | 1px solid error | Input en erreur |

**Rayons :**
- `rounded-sm` (2px) : Tags, badges statut
- `rounded-md` (6px) : Boutons, inputs, petites cards
- `rounded-lg` (8px) : Cards, modales, tableaux
- `rounded-xl` (12px) : Grandes cards, conteneurs
- `rounded-full` : Avatars, badges pill

---

## 2. COMPOSANTS UI VERROUILLÉS — CONTRATPRO

> ⚠️ Codex DOIT utiliser ces composants. Il ne DOIT PAS créer de nouveaux styles.

### Bouton — Variantes autorisées

```typescript
// components/ui/button.tsx (shadcn/ui)
// Variantes à utiliser UNIQUEMENT :

<Button variant="default">      → Action principale (fond primary-600)
<Button variant="secondary">    → Action secondaire (fond neutral-100)
<Button variant="outline">      → Action tertiaire (bordure)
<Button variant="ghost">       → Action discrète (tableaux, listes)
<Button variant="destructive"> → Action dangereuse (suppression, annulation)

// Tailles :
<Button size="sm">     → 32px hauteur, text-sm, px-3
<Button size="default"> → 40px hauteur, text-sm, px-4
<Button size="lg">     → 48px hauteur, text-base, px-6
<Button size="icon">   → 40px x 40px, icône seule
```

**Règles d'usage CONTRATPRO :**
- **1 seul** `variant="default"` par page/section
- `destructive` UNIQUEMENT pour : suppression contrat, annulation paiement
- `ghost` pour les actions dans les tableaux (éditer, voir, PDF)
- Bouton "Créer" toujours `variant="default"` + icône `Plus`
- Bouton "Annuler" toujours `variant="outline"`

### Badge Statut — Patterns CONTRATPRO

```typescript
// ✅ Badges statut métier OBLIGATOIRES

// Contrat actif
<Badge className="bg-green-100 text-green-700 hover:bg-green-100">
  Actif
</Badge>

// Contrat à renouveler (< 45 jours)
<Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">
  À renouveler
</Badge>

// Contrat expiré
<Badge className="bg-red-100 text-red-700 hover:bg-red-100">
  Expiré
</Badge>

// Paiement réussi
<Badge className="bg-green-100 text-green-700 hover:bg-green-100">
  Payé
</Badge>

// Paiement en attente
<Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
  En attente
</Badge>

// Paiement échoué
<Badge className="bg-red-100 text-red-700 hover:bg-red-100">
  Échoué
</Badge>

// Attestation valide
<Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
  Valide
</Badge>

// Attestation à faire
<Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">
  À programmer
</Badge>
```

### Input — Pattern obligatoire CONTRATPRO

```typescript
// ❌ INTERDIT — Input nu
<Input placeholder="Email" />

// ✅ OBLIGATOIRE — Label + Input + Description + Error
<div className="space-y-2">
  <Label htmlFor="email" className="text-sm font-medium">
    Email <span className="text-error">*</span>
  </Label>
  <Input 
    id="email"
    placeholder="contact@entreprise.fr"
    className="h-10"
  />
  <p className="text-xs text-neutral-500">
    Email utilisé pour les relances et les attestations.
  </p>
  <p className="text-xs text-error">
    {/* Affiché uniquement en cas d'erreur */}
  </p>
</div>
```

### Card — Pattern obligatoire CONTRATPRO

```typescript
// ✅ Pattern Card standard CONTRATPRO
<Card className="shadow-sm border border-neutral-200">
  <CardHeader className="pb-4">
    <div className="flex items-center justify-between">
      <CardTitle className="text-lg font-semibold">Titre</CardTitle>
      <Badge>Statut</Badge>
    </div>
    <CardDescription className="text-sm text-neutral-500">
      Description concise du contenu
    </CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    {/* Contenu métier */}
  </CardContent>
  <CardFooter className="flex justify-end gap-2 pt-4 border-t border-neutral-100">
    <Button variant="outline">Annuler</Button>
    <Button>Confirmer</Button>
  </CardFooter>
</Card>
```

### Tableau — Pattern obligatoire CONTRATPRO

```typescript
// ✅ Pattern Tableau standard
<div className="rounded-lg border border-neutral-200 overflow-hidden">
  <Table>
    <TableHeader>
      <TableRow className="bg-neutral-50">
        <TableHead className="font-semibold text-neutral-700">Client</TableHead>
        <TableHead className="font-semibold text-neutral-700">Contrat</TableHead>
        <TableHead className="font-semibold text-neutral-700">Statut</TableHead>
        <TableHead className="font-semibold text-neutral-700 text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {items.map((item) => (
        <TableRow key={item.id} className="hover:bg-neutral-50">
          <TableCell className="font-medium">{item.clientName}</TableCell>
          <TableCell className="text-neutral-500">{item.contractRef}</TableCell>
          <TableCell>
            <Badge className={getStatusColor(item.status)}>
              {item.statusLabel}
            </Badge>
          </TableCell>
          <TableCell className="text-right">
            <Button variant="ghost" size="sm">
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <FileText className="h-4 w-4" />
            </Button>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</div>
```

---

## 3. LAYOUTS & PATTERNS DOCUMENTÉS — CONTRATPRO

### Page Dashboard — Structure obligatoire

```
┌─────────────────────────────────────────┐
│  HEADER (h-16, white, border-b)         │
│  Logo    Recherche    Notifications  User │
├──────────┬──────────────────────────────┤
│          │                              │
│ SIDEBAR  │      MAIN CONTENT            │
│ (w-64,   │      (p-6, space-y-6)        │
│  bg-     │                              │
│  neutral-│  ┌──────────────────────────┐ │
│  50)     │  │  Stats Row (grid-cols-4) │ │
│          │  │  4 cards métier          │ │
│          │  └──────────────────────────┘ │
│          │                              │
│          │  ┌──────────────────────────┐ │
│          │  │  Tableau clients/contrats  │ │
│          │  │  (rounded-lg, shadow-sm)   │ │
│          │  └──────────────────────────┘ │
│          │                              │
│          │  ┌──────────────────────────┐ │
│          │  │  Actions rapides           │ │
│          │  │  (grid-cols-3, gap-4)      │ │
│          │  └──────────────────────────┘ │
│          │                              │
└──────────┴──────────────────────────────┘
```

```typescript
// ✅ Code Dashboard Layout
export default function DashboardLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-neutral-50">
      <aside className="w-64 border-r border-neutral-200 bg-neutral-50">
        {/* Sidebar navigation */}
        <Sidebar />
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-neutral-200 bg-white px-6 flex items-center justify-between">
          <Header />
        </header>
        <main className="flex-1 overflow-auto p-6 space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
```

### Stats Cards — Pattern CONTRATPRO

```typescript
// ✅ Pattern Stats Cards (4 métriques clés)
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <Card className="shadow-sm">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-neutral-500">Contrats actifs</p>
          <p className="text-2xl font-bold">{stats.activeContracts}</p>
        </div>
        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
          <FileText className="h-5 w-5 text-primary-600" />
        </div>
      </div>
    </CardContent>
  </Card>

  <Card className="shadow-sm">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-neutral-500">À renouveler</p>
          <p className="text-2xl font-bold text-orange-600">{stats.renewalsDue}</p>
        </div>
        <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
        </div>
      </div>
    </CardContent>
  </Card>

  <Card className="shadow-sm">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-neutral-500">CA annuel</p>
          <p className="text-2xl font-bold">{formatCurrency(stats.annualRevenue)}</p>
        </div>
        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
          <Euro className="h-5 w-5 text-green-600" />
        </div>
      </div>
    </CardContent>
  </Card>

  <Card className="shadow-sm">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-neutral-500">Interventions ce mois</p>
          <p className="text-2xl font-bold">{stats.monthlyInterventions}</p>
        </div>
        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
          <Wrench className="h-5 w-5 text-blue-600" />
        </div>
      </div>
    </CardContent>
  </Card>
</div>
```

### Formulaire — Structure obligatoire CONTRATPRO

```typescript
// ✅ Pattern Formulaire CONTRATPRO
<form className="space-y-6 max-w-2xl">
  {/* Section 1 : Identité */}
  <div className="space-y-4">
    <h3 className="text-lg font-semibold">Informations client</h3>
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label>Raison sociale <span className="text-error">*</span></Label>
        <Input placeholder="SARL Martin Chauffage" />
      </div>
      <div className="space-y-2">
        <Label>SIRET</Label>
        <Input placeholder="123 456 789 00012" />
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label>Email <span className="text-error">*</span></Label>
        <Input type="email" placeholder="contact@martin-chauffage.fr" />
      </div>
      <div className="space-y-2">
        <Label>Téléphone <span className="text-error">*</span></Label>
        <Input placeholder="01 23 45 67 89" />
      </div>
    </div>
  </div>

  {/* Section 2 : Adresse */}
  <div className="space-y-4">
    <h3 className="text-lg font-semibold">Adresse</h3>
    <div className="space-y-2">
      <Label>Adresse</Label>
      <Input placeholder="12 rue de la Paix" />
    </div>
    <div className="grid grid-cols-3 gap-4">
      <div className="space-y-2">
        <Label>Code postal</Label>
        <Input placeholder="75001" />
      </div>
      <div className="col-span-2 space-y-2">
        <Label>Ville</Label>
        <Input placeholder="Paris" />
      </div>
    </div>
  </div>

  {/* Actions */}
  <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200">
    <Button variant="outline" type="button">Annuler</Button>
    <Button type="submit">Enregistrer le client</Button>
  </div>
</form>
```

### Empty State — Pattern CONTRATPRO

```typescript
// ✅ Pattern Empty State
<div className="flex flex-col items-center justify-center py-16 text-center">
  <div className="h-12 w-12 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
    <Inbox className="h-6 w-6 text-neutral-400" />
  </div>
  <h3 className="text-lg font-semibold text-neutral-900">Aucun contrat</h3>
  <p className="text-sm text-neutral-500 mt-1 max-w-sm">
    Commencez par créer votre premier contrat de maintenance CVC en cliquant sur le bouton ci-dessous.
  </p>
  <Button className="mt-6">
    <Plus className="h-4 w-4 mr-2" />
    Créer un contrat
  </Button>
</div>
```

### Loading State — Pattern CONTRATPRO

```typescript
// ✅ Pattern Loading
<div className="flex items-center justify-center py-16">
  <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
  <span className="ml-3 text-sm text-neutral-500">Chargement des contrats...</span>
</div>

// Ou pour un tableau :
<div className="space-y-3">
  {Array.from({ length: 5 }).map((_, i) => (
    <Skeleton key={i} className="h-12 w-full" />
  ))}
</div>
```

### Bloc "Architecte IA" — Pattern CONTRATPRO (spécifique)

```typescript
// ✅ Pattern Bloc "Architecte IA" (utilisé dans /admin, /settings/billing, /onboarding)
<Card className="border-l-4 border-l-primary-500 shadow-md">
  <CardHeader>
    <div className="flex items-center gap-2">
      <Brain className="h-5 w-5 text-primary-600" />
      <CardTitle className="text-base">Architecte IA — [Titre]</CardTitle>
    </div>
  </CardHeader>
  <CardContent className="space-y-4">
    {/* Score ou métrique */}
    <div className="flex items-center gap-4">
      <div className="text-3xl font-bold">{score}</div>
      <div className="text-sm text-neutral-500">{scoreLabel}</div>
    </div>

    {/* Recommandation */}
    <div className="bg-neutral-50 p-4 rounded-lg">
      <p className="text-sm font-medium">Recommandation</p>
      <p className="text-sm text-neutral-600 mt-1">{recommendation}</p>
    </div>

    {/* Actions */}
    <div className="flex gap-2">
      <Button size="sm" variant="default">
        <Check className="h-4 w-4 mr-1" />
        Valider
      </Button>
      <Button size="sm" variant="outline">
        <Copy className="h-4 w-4 mr-1" />
        Copier
      </Button>
      <Button size="sm" variant="ghost">
        <History className="h-4 w-4 mr-1" />
        Journaliser
      </Button>
    </div>
  </CardContent>
</Card>
```

---

## 4. RÈGLES DE DESIGN ABSOLUES — CONTRATPRO

| # | Règle | Explication |
|---|-------|-------------|
| 1 | **JAMAIS de couleurs hardcodées** | Utiliser UNIQUEMENT les tokens CSS |
| 2 | **JAMAIS de `style={{}}`** | Tout passe par Tailwind |
| 3 | **JAMAIS de px/arbitrary values** | Utiliser les tokens d'espacement |
| 4 | **Max 3 couleurs par composant** | Primary + Neutral + Semantic |
| 5 | **Contrastes minimum AA** | Text sur fond : ratio 4.5:1 minimum |
| 6 | **Hover states obligatoires** | Tout élément cliquable doit avoir un hover |
| 7 | **Focus states obligatoires** | Tout input/bouton doit avoir un focus visible |
| 8 | **Transitions douces** | `transition-colors duration-200` sur les interactifs |
| 9 | **Mobile first** | PWA terrain obligatoire, desktop dashboard |
| 10 | **Consistance** | Si un pattern existe déjà, le réutiliser |
| 11 | **Badges statut** | Utiliser UNIQUEMENT les couleurs définies (vert/orange/rouge/gris/bleu) |
| 12 | **Icônes** | Utiliser Lucide React UNIQUEMENT |
| 13 | **Cards métier** | Toujours avec header (titre + badge statut) + content + footer actions |

---

## 5. RÉFÉRENCES VISUELLES — CONTRATPRO

> Quand Codex doit créer un nouvel écran, donne-lui une référence :

### Références de design à imiter

| Référence | URL | Ce qu'on imite pour CONTRATPRO |
|-----------|-----|-------------------------------|
| Vercel Dashboard | vercel.com/dashboard | Layout sidebar + header, stats cards |
| Stripe Dashboard | stripe.com | Tableaux de données, badges statut |
| Linear | linear.app | Clean, minimaliste, espacements généreux |
| Notion | notion.so | Sidebar navigation, hiérarchie |
| Tailwind UI | tailwindui.com | Composants prêts à l'emploi |

### Comment demander un écran à Codex

```markdown
## Demande de création d'écran CONTRATPRO

**Écran :** [Nom de la page]
**Référence visuelle :** [URL ou description]
**Objectif :** [Ce que le chauffagiste doit faire]

### Structure attendue
- Header avec [éléments]
- Sidebar avec [éléments de navigation CVC]
- Main content :
  - Section 1 : [description métier]
  - Section 2 : [description métier]

### Composants à utiliser (depuis le design system)
- Card (shadow-sm) avec badge statut
- Button (variant default + outline)
- Table (avec hover rows + badges statut)
- Input (avec label + error)
- Stats Cards (4 métriques)

### Données
[Schéma des données CONTRATPRO à afficher]

### Règles de design
- Respecter strictement design-system.md
- Mobile first (PWA terrain)
- Max 3 couleurs
- Badges statut avec les couleurs CONTRATPRO
- Espacements selon les tokens
- Bloc "Architecte IA" si page admin
```

---

## 6. CHECKLIST DESIGN AVANT COMMIT — CONTRATPRO

Avant de valider un composant UI, vérifier :

```
□ Les couleurs viennent des tokens (pas de hardcode)
□ Les espacements suivent l'échelle (4, 8, 12, 16, 24, 32, 48, 64)
□ Les typographies suivent l'échelle (xs, sm, base, lg, xl, 2xl, 3xl)
□ Les ombres sont dans la liste autorisée
□ Les bordures utilisent les tokens
□ Les hover/focus states sont présents
□ Le contraste text/fond est suffisant
□ Le composant est responsive (mobile first)
□ Aucun `style={{}}` ou valeur arbitraire Tailwind
□ Les badges statut utilisent les couleurs CONTRATPRO
□ Les icônes viennent de Lucide React
□ Le bloc "Architecte IA" respecte le pattern (si applicable)
□ Les stats cards ont l'icône dans un cercle coloré
```

---

## 🎯 RÉSUMÉ POUR CODEX — CONTRATPRO

> **Codex, tu ne designers PAS. Tu ASSEMBLES selon le système CONTRATPRO.**

1. **Tokens** → Tu utilises les variables (bleu primary, vert succès, orange alerte)
2. **Composants** → Tu réutilises shadcn/ui, tu ne crées pas de nouveaux styles
3. **Patterns** → Tu copies les layouts documentés (dashboard, formulaire, empty state, bloc IA)
4. **Badges statut** → Tu utilises UNIQUEMENT les couleurs définies (vert/orange/rouge/gris/bleu)
5. **Références** → Quand tu doutes, tu demandes une URL de référence
