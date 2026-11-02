# Graph Report - Hackathon_Besoins  (2026-11-02)

## Corpus Check
- 15 files · ~8,264 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 7 file(s) not represented in the graph (top: (none) 4, .example 1, .ico 1)

## Summary
- 162 nodes · 200 edges · 11 communities (10 shown, 1 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 9 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `32ea5b1f`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Journalistes malgaches
- package.json
- compilerOptions
- README.md
- route.ts
- page.tsx
- Direction artistique — Hamarino by Urbix
- Produit — Hamarino by Urbix
- dependencies
- scripts

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `Home()` - 10 edges
3. `Produit — Hamarino by Urbix` - 10 edges
4. `Journalistes malgaches` - 10 edges
5. `Direction artistique — Hamarino by Urbix` - 7 edges
6. `scripts` - 6 edges
7. `parseModelAnalysis()` - 6 edges
8. `Veille, langues, accès hors ligne, annuaire, statistiques et angles comme extensions` - 6 edges
9. `next` - 5 edges
10. `Hamarino by Urbix` - 5 edges

## Surprising Connections (you probably didn't know these)
- `Veille, langues, accès hors ligne, annuaire, statistiques et angles comme extensions` --conceptually_related_to--> `Accès hors ligne ou par satellite`  [INFERRED]
  MEMO_CONTEXTE_HACKATHON.md → analysis/transcripts/Hackathon_Besoins.txt
- `Veille, langues, accès hors ligne, annuaire, statistiques et angles comme extensions` --conceptually_related_to--> `Annuaire actualisé des contacts publics et privés`  [INFERRED]
  MEMO_CONTEXTE_HACKATHON.md → analysis/transcripts/Hackathon_Besoins.txt
- `MVP centré sur une image avec sources et limites` --implements--> `Authentification des photos et vidéos`  [INFERRED]
  MEMO_CONTEXTE_HACKATHON.md → analysis/transcripts/Hackathon_Besoins.txt
- `Veille, langues, accès hors ligne, annuaire, statistiques et angles comme extensions` --conceptually_related_to--> `Langues malgache, français et anglais`  [INFERRED]
  MEMO_CONTEXTE_HACKATHON.md → analysis/transcripts/Hackathon_Besoins.txt
- `Veille, langues, accès hors ligne, annuaire, statistiques et angles comme extensions` --conceptually_related_to--> `Statistiques récentes`  [INFERRED]
  MEMO_CONTEXTE_HACKATHON.md → analysis/transcripts/Hackathon_Besoins.txt

## Import Cycles
- None detected.

## Communities (11 total, 1 thin omitted)

### Community 0 - "Journalistes malgaches"
Cohesion: 0.12
Nodes (15): Accès hors ligne ou par satellite, Annuaire actualisé des contacts publics et privés, Authentification des photos et vidéos, Circulation rapide de l’information, Journalistes malgaches, Langues malgache, français et anglais, Besoin 2 : authentification des images, Niveau de confiance fondé sur des éléments vérifiés (+7 more)

### Community 1 - "package.json"
Cohesion: 0.12
Nodes (21): eslint, eslint-config-next, tailwindcss, @tailwindcss/turbopack, @types/node, @types/react, @types/react-dom, typescript (+13 more)

### Community 2 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 4 - "README.md"
Cohesion: 0.13
Nodes (13): 1. Revue sécurité d’abord, 2. Ajouter les mouvements Framer Motion, 3. Améliorer les défauts réellement observés, Contexte Claude Code — Hamarino by Urbix, Sortie attendue, Votre mission, Architecture, Clé Gemini (+5 more)

### Community 5 - "route.ts"
Cohesion: 0.16
Nodes (17): @google/genai, @google/genai@^2.32.0, cleanStrings(), Confidence, ContextStatus, getGroundedSources(), isConfidence(), isContextStatus() (+9 more)

### Community 6 - "page.tsx"
Cohesion: 0.18
Nodes (13): react, react@19.3.0, Analysis, BrandMark(), confidenceLabel(), demoAnalysis, Home(), acceptFile() (+5 more)

### Community 7 - "Direction artistique — Hamarino by Urbix"
Cohesion: 0.18
Nodes (10): Couleurs, Direction artistique — Hamarino by Urbix, Idée de marque, Langues, Principes d’interface, Signe, Système visuel, Typographie (+2 more)

### Community 8 - "Produit — Hamarino by Urbix"
Cohesion: 0.20
Nodes (10): 1. Problème et public, 2. Parcours MVP, 3. États et règles éditoriales, 4. Architecture actuelle, 5. Sécurité et confidentialité du MVP, 6. Hors périmètre aujourd’hui, 7. Évolutions qui créent de la valeur, 8. Récit de démonstration (2 minutes) (+2 more)

### Community 9 - "dependencies"
Cohesion: 0.11
Nodes (14): geist, lucide-react, next, react-dom, sharp, nextConfig, dependencies, geist@^1.9.0 (+6 more)

### Community 10 - "scripts"
Cohesion: 0.33
Nodes (6): scripts, build, dev, icons:build, lint, start

## Knowledge Gaps
- **4 isolated node(s):** `Circulation rapide de l’information`, `Besoin 2 : authentification des images`, `Nom proposé : Madagascar Check`, `Transcription automatique Whisper base, français détecté`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 79 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `sharp` connect `dependencies` to `package.json`, `route.ts`?**
  _High betweenness centrality (0.059) - this node is a cross-community bridge._
- **What connects `Circulation rapide de l’information`, `Besoin 2 : authentification des images`, `Nom proposé : Madagascar Check` to the rest of the system?**
  _4 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Journalistes malgaches` be split into smaller, more focused modules?**
  _Cohesion score 0.12380952380952381 - nodes in this community are weakly interconnected._
- **Why does `next` connect `dependencies` to `package.json`, `page.tsx`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.1225296442687747 - nodes in this community are weakly interconnected._
- **Why does `@google/genai` connect `route.ts` to `package.json`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._