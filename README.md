# Hamarino by Urbix

**Chaque image mérite ses sources.** Hamarino est un espace de travail destiné aux journalistes qui reçoivent une image à contexte incertain. L’application sépare ce qui est visible, ce que des sources accessibles étayent et ce qui reste à vérifier. Elle accompagne la vérification éditoriale sans rendre de verdict automatique.


Le projet s’appuie sur le besoin « authentification des images » du dossier de préparation IFM. Le PDF local décrit un standard général de hackathon de 42 Antananarivo ; ce n’est pas le règlement particulier de l’IFM. Voir [le mémo du concours](MEMO_CONTEXTE_HACKATHON.md), [la spécification produit](PRODUCT_SPEC.md), [la charte de marque](BRAND_GUIDELINES.md) et les [consignes Claude Code](CLAUDE.md).

La vidéo et le PDF sources restent dans le dossier de travail et sont exclus du dépôt ; la synthèse de contexte et la transcription de travail sont versionnées ici.

## Démonstration MVP

- Parcourir la landing publique à `/`, puis créer un compte ou se connecter à `/connexion`.
- Ouvrir l’espace authentifié `/verification`.
- Déposer une image JPEG, PNG ou WebP (8 Mo max).
- Ajouter une affirmation à examiner et le contexte déjà connu.
- Confirmer le transfert de l’image à Gemini.
- Recevoir des observations visuelles, des résultats de recoupement, des liens retournés par Google Search, les limites et des pistes de vérification.
- Copier une note courte pour le travail éditorial.
- Ouvrir **Voir un exemple** pour parcourir une simulation sans clé. Elle est marquée comme exercice, ne lance aucune recherche et ne présente aucune source réelle.

L’analyse d’image ne prouve pas le lieu, la date, l’auteur ou une manipulation. L’absence de sources citées force le statut « À vérifier » et une confiance insuffisante. Le journaliste doit consulter les sources et décider.

La landing et l’espace sont adaptés au mobile. L’APK Android n’est pas encore publié : il faut d’abord choisir une URL publique pour le serveur, afin que l’application mobile puisse se connecter à Supabase et à l’API Gemini. Le bouton Android reste volontairement désactivé jusque-là.

## Lancer en local

Prérequis : Node.js 22 ou plus récent et npm. L’application se trouve dans `web/`.

```powershell
cd web
npm install
Copy-Item .env.example .env.local
# Renseigner les variables Supabase Free et la clé Gemini neuve dans .env.local
npm run dev
```

Ouvrir http://localhost:3000. Sans variables Supabase, la landing et la prévisualisation de l’espace sur http://localhost:3000/verification restent consultables en mode développement, mais la création de compte et l’analyse réelle ne sont pas disponibles.

### Clé Gemini

La route utilise `GEMINI_API_KEY` seulement côté serveur. Créez une clé **neuve** dans un projet Google AI Studio dont la colonne **Billing Tier** indique **Free**, puis ajoutez-la uniquement à `web/.env.local` (ce fichier est ignoré par Git). Ne reliez aucun compte de facturation au projet : c’est cette configuration qui maintient le projet au forfait gratuit et évite les appels payants. Ne collez aucune clé dans le chat, le code ou un commit. Une clé précédemment partagée dans une conversation doit être révoquée/rotée avant la démo.

### Connexion Supabase

La création de compte et la connexion par e-mail utilisent Supabase Auth. Le projet est à créer par l’équipe au forfait **Free**, sans activer de formule payante. Copiez `.env.example` vers `.env.local`, puis renseignez `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` depuis les paramètres API du projet Supabase. La clé publishable peut être utilisée côté navigateur ; ne jamais utiliser `service_role`. L’URL de redirection e-mail doit inclure `http://localhost:3000/auth/callback` et l’URL publique finale suivie de `/auth/callback`.

Le fournisseur d’e-mail intégré au forfait gratuit est limité à deux messages par heure. Cela peut ralentir les inscriptions et réinitialisations de mot de passe pendant une démo. Supabase peut mettre en pause les projets Free inactifs ; vérifier leur statut avant la présentation.

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_votre_cle
GEMINI_API_KEY=remplacer_par_une_cle_neuve
```

Configurez dans Supabase l’URL de site `http://localhost:3000` et l’URL de redirection `http://localhost:3000/auth/callback`. Pour un déploiement, ajoutez aussi l’URL publique finale et son chemin `/auth/callback` dans les URL autorisées. N’ajoutez jamais une clé `service_role` au code navigateur.

L’application utilise `gemini-2.5-flash` et Google Search, disponibles au forfait gratuit dans les limites publiées par Google : la recherche est plafonnée à 500 requêtes par jour, quota partagé avec Flash-Lite. Les limites de génération peuvent aussi varier et les quotas évoluer. En cas de limite atteinte, Hamarino affiche une erreur et ne bascule vers aucun modèle payant. Les limites ne sont pas un budget : gardez le projet sans compte de facturation lié.

Le forfait gratuit peut utiliser les prompts et réponses pour améliorer les produits Google. Pour la démo, utilisez uniquement une image autorisée, publique et non sensible. L’appel est envoyé avec `store: false` ; Hamarino ne stocke pas les images ni l’historique. Consultez la documentation officielle sur [la gestion des clés Gemini](https://ai.google.dev/gemini-api/docs/api-key), [la facturation et les forfaits](https://ai.google.dev/gemini-api/docs/billing), [les tarifs et quotas](https://ai.google.dev/gemini-api/docs/pricing), [l’Interactions API](https://ai.google.dev/gemini-api/docs/interactions-overview) et [Google Search grounding](https://ai.google.dev/gemini-api/docs/google-search).

## Architecture

- `web/src/app/page.tsx` — landing publique.
- `web/src/app/connexion/` — inscription, connexion et récupération de compte.
- `web/src/app/verification/` — espace de travail authentifié.
- `web/src/lib/supabase/` — gestion des clients et sessions d’authentification.
- `web/src/proxy.ts` — renouvellement de session et protection des routes.
- `web/src/app/api/analyze/route.ts` — validation, normalisation en mémoire et appel Gemini côté serveur.
- `PRODUCT_SPEC.md` — état du MVP, choix produit, règles éditoriales et limites connues.
- `BRAND_GUIDELINES.md` — identité visuelle et principes UI.
- `CLAUDE.md` — handoff à Claude Code pour la sécurité et Framer Motion.

Stack : Next.js App Router, React, TypeScript, Geist Sans/Serif, Lucide, `@supabase/ssr`, `@supabase/supabase-js`, `@google/genai`, Gemini 2.5 Flash avec Google Search grounding (forfait gratuit) et Sharp.

Commandes depuis `web/` :

```powershell
npm run dev
npm run build
npm run lint
```

## Confidentialité et limites

- Le consentement annonce explicitement que le fichier est transmis à Gemini.
- Hamarino ne sauvegarde ni l’image ni son historique ; la réception et le traitement se font en mémoire côté serveur, et l’appel Interactions est envoyé avec `store: false`. Le forfait gratuit Google peut utiliser les prompts et réponses pour améliorer ses produits : ne pas envoyer de contenus sensibles ou confidentiels.
- Supabase Auth conserve les données nécessaires au compte et à la session. Aucun dossier de vérification ni image n’est associé à ce compte dans cette version.
- Le réencodage retire les métadonnées EXIF. Le produit n’est donc pas un outil de conservation des originaux ni une chaîne de preuve forensique.
- Un outil de recherche web peut trouver des sources récentes, mais cela ne signifie pas qu’il a retrouvé la première publication d’une image.
- Pas de recherche inversée d’image, d’analyse médico-légale, de traitement vidéo, de mode hors-ligne, d’annuaire de contacts ni de couverture multilingue dans ce MVP.
- Les comptes et l’accès à l’analyse sont protégés par Supabase Auth. Il n’y a pas encore de dossiers par utilisateur, d’audit de publication ni de limitation distribuée des appels Gemini. Avant une ouverture publique, ajouter une protection contre l’abus au niveau de la plateforme/hébergeur et revoir les règles de confidentialité.
- Le produit est en français. Les formulations malgaches et anglaises doivent être relues par des locuteurs natifs avant publication.

Pour la feuille de route et un récit de démo, consulter [PRODUCT_SPEC.md](PRODUCT_SPEC.md).

