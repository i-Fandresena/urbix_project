# Hamarino by Urbix

**Chaque image mérite ses sources.** Hamarino est un espace de travail destiné aux journalistes qui reçoivent une image à contexte incertain. L’application sépare ce qui est visible, ce que des sources accessibles étayent et ce qui reste à vérifier. Elle accompagne la vérification éditoriale sans rendre de verdict automatique.


Le projet s’appuie sur le besoin « authentification des images » du dossier de préparation IFM. Le PDF local décrit un standard général de hackathon de 42 Antananarivo ; ce n’est pas le règlement particulier de l’IFM. Voir [le mémo du concours](MEMO_CONTEXTE_HACKATHON.md), [la spécification produit](PRODUCT_SPEC.md), [la charte de marque](BRAND_GUIDELINES.md) et les [consignes Claude Code](CLAUDE.md).

La vidéo et le PDF sources restent dans le dossier de travail et sont exclus du dépôt ; la synthèse de contexte et la transcription de travail sont versionnées ici.

## Démonstration MVP

- Déposer une image JPEG, PNG ou WebP (8 Mo max).
- Ajouter une affirmation à examiner et le contexte déjà connu.
- Confirmer le transfert de l’image à Gemini.
- Recevoir des observations visuelles, des résultats de recoupement, des liens retournés par Google Search, les limites et des pistes de vérification.
- Copier une note courte pour le travail éditorial.
- Ouvrir **Voir un exemple** pour parcourir une simulation sans clé. Elle est marquée comme exercice, ne lance aucune recherche et ne présente aucune source réelle.

L’analyse d’image ne prouve pas le lieu, la date, l’auteur ou une manipulation. L’absence de sources citées force le statut « À vérifier » et une confiance insuffisante. Le journaliste doit consulter les sources et décider.

## Lancer en local

Prérequis : Node.js 22 ou plus récent et npm. L’application se trouve dans `web/`.

```powershell
cd web
npm install
Copy-Item .env.example .env.local
# Ouvrir web/.env.local et remplacer la valeur vide par une clé neuve
npm run dev
```

Ouvrir http://localhost:3000. Sans `GEMINI_API_KEY`, l’interface et l’exemple simulé restent consultables, mais l’analyse réelle affiche une erreur de configuration.

### Clé Gemini

La route utilise `GEMINI_API_KEY` seulement côté serveur. Créez une clé **neuve** dans Google AI Studio — les clés créées actuellement sont des clés d’autorisation (auth keys) liées à un compte de service — puis ajoutez-la uniquement à `web/.env.local` (ce fichier est ignoré par Git). Ne collez aucune clé dans le chat, le code ou un commit. Une clé précédemment partagée dans une conversation doit être révoquée/rotée avant la démo.

```env
GEMINI_API_KEY=remplacer_par_une_cle_neuve
```

Consulter la documentation officielle Google sur [la gestion des clés Gemini](https://ai.google.dev/gemini-api/docs/api-key), [l’Interactions API](https://ai.google.dev/gemini-api/docs/interactions-overview) et [l’ancrage des réponses avec Google Search](https://ai.google.dev/gemini-api/docs/google-search.md). Les requêtes de recherche et les limites de l’API peuvent avoir un coût/quotas dépendants du compte.

## Architecture

- `web/src/app/page.tsx` — interface de travail et formulaire.
- `web/src/app/api/analyze/route.ts` — validation, normalisation en mémoire et appel Gemini côté serveur.
- `PRODUCT_SPEC.md` — état du MVP, choix produit, règles éditoriales et limites connues.
- `BRAND_GUIDELINES.md` — identité visuelle et principes UI.
- `CLAUDE.md` — handoff à Claude Code pour la sécurité et Framer Motion.

Stack : Next.js App Router, React, TypeScript, Geist Sans/Serif, Lucide, `@google/genai`, Google Search grounding et Sharp.

Commandes depuis `web/` :

```powershell
npm run dev
npm run build
npm run lint
```

## Confidentialité et limites

- Le consentement annonce explicitement que le fichier est transmis à Gemini.
- Hamarino ne sauvegarde ni l’image ni son historique ; la réception et le traitement se font en mémoire côté serveur. Le fournisseur d’IA applique ses propres conditions de traitement.
- Le réencodage retire les métadonnées EXIF. Le produit n’est donc pas un outil de conservation des originaux ni une chaîne de preuve forensique.
- Un outil de recherche web peut trouver des sources récentes, mais cela ne signifie pas qu’il a retrouvé la première publication d’une image.
- Pas de recherche inversée d’image, d’analyse médico-légale, de traitement vidéo, de mode hors-ligne, d’annuaire de contacts ni de couverture multilingue dans ce MVP.
- Pas encore de comptes, de contrôle d’accès ou de limite de requêtes distribuée. Pour une ouverture publique, ajouter une protection contre l’abus au niveau de la plateforme/hébergeur, revoir quotas et coûts Gemini et vérifier les règles de confidentialité applicables.
- Le produit est en français. Les formulations malgaches et anglaises doivent être relues par des locuteurs natifs avant publication.

Pour la feuille de route et un récit de démo, consulter [PRODUCT_SPEC.md](PRODUCT_SPEC.md).

