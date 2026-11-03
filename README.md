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

La landing et l’espace sont adaptés au mobile. L’APK Android n’est pas encore publié : il faut d’abord choisir une URL publique pour le serveur, afin que l’application mobile puisse se connecter à PostgreSQL et à l’API Gemini. Le bouton Android reste volontairement désactivé jusque-là.

## Lancer en local

Prérequis : Node.js 22 ou plus récent et npm. L’application se trouve dans `web/`.

```powershell
cd web
npm install
Copy-Item .env.example .env.local
# Renseigner DATABASE_URL, BETTER_AUTH_SECRET et une clé Gemini neuve dans .env.local
npm run db:start
npm run db:migrate
npm run dev
```

Ouvrir http://localhost:3000. Sans variables PostgreSQL et Better Auth, la landing et la prévisualisation de l’espace sur http://localhost:3000/verification restent consultables en mode développement, mais la création de compte et l’analyse réelle ne sont pas disponibles.

### Clé Gemini

La route utilise `GEMINI_API_KEY` seulement côté serveur. Créez une clé **neuve** dans un projet Google AI Studio dont la colonne **Billing Tier** indique **Free**, puis ajoutez-la uniquement à `web/.env.local` (ce fichier est ignoré par Git). Ne reliez aucun compte de facturation au projet : c’est cette configuration qui maintient le projet au forfait gratuit et évite les appels payants. Ne collez aucune clé dans le chat, le code ou un commit. Une clé précédemment partagée dans une conversation doit être révoquée/rotée avant la démo.

### Comptes et PostgreSQL

Hamarino se connecte directement à PostgreSQL avec `pg`. Better Auth gère les comptes e-mail/mot de passe, les mots de passe hachés et les sessions. La base ne stocke pas les images, les analyses ni les recherches. L’équipe peut utiliser le serveur local fourni par `compose.yaml` ou toute instance PostgreSQL accessible depuis le serveur Next.js.

Depuis `web/`, démarrez PostgreSQL localement avec `npm run db:start`, puis renseignez `DATABASE_URL`, `BETTER_AUTH_SECRET` et `BETTER_AUTH_URL` dans `.env.local`. Générez un secret avec Node.js :

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
```

Créez les tables d’authentification avec `npm run db:migrate`, puis lancez le site avec `npm run dev`. La création de compte est disponible dans `/connexion`. Un SMTP n’est pas nécessaire pour l’inscription et la connexion ; il est requis pour la confirmation d’adresse et la récupération du mot de passe. Configurez `AUTH_SMTP_URL` et `AUTH_EMAIL_FROM` seulement si un serveur SMTP est disponible. Les identifiants SMTP et PostgreSQL restent dans `.env.local`, jamais dans le navigateur ou Git.

L’application utilise `gemini-2.5-flash` et Google Search, disponibles au forfait gratuit dans les limites publiées par Google : la recherche est plafonnée à 500 requêtes par jour, quota partagé avec Flash-Lite. Les limites de génération peuvent aussi varier et les quotas évoluer. En cas de limite atteinte, Hamarino affiche une erreur et ne bascule vers aucun modèle payant. Les limites ne sont pas un budget : gardez le projet sans compte de facturation lié.

Le forfait gratuit peut utiliser les prompts et réponses pour améliorer les produits Google. Pour la démo, utilisez uniquement une image autorisée, publique et non sensible. L’appel est envoyé avec `store: false` ; Hamarino ne stocke pas les images ni l’historique. Consultez la documentation officielle sur [la gestion des clés Gemini](https://ai.google.dev/gemini-api/docs/api-key), [la facturation et les forfaits](https://ai.google.dev/gemini-api/docs/billing), [les tarifs et quotas](https://ai.google.dev/gemini-api/docs/pricing), [l’Interactions API](https://ai.google.dev/gemini-api/docs/interactions-overview) et [Google Search grounding](https://ai.google.dev/gemini-api/docs/google-search).

## Bot Messenger (prototype)

Le bot de la Page Facebook Laverta reçoit des signalements dans Messenger. Il demande successivement :
- le type : information douteuse ou rumeur à vérifier ;
- le thème et le contenu ;
- le lieu de diffusion et la ville ou région ;
- la confirmation.

Chaque question affiche aussi ses choix numérotés. On peut répondre avec un bouton, en tapant le numéro ou en tapant le nom de l’option (« 2 », « Santé », « Passer »). Le bot reste ainsi utilisable dans les applications qui n’affichent pas les boutons.

Chaque signalement confirmé reçoit un code `LV-XXXXXX`. La personne suit ses signalements avec le bouton « Suivre un dossier », sans avoir à retenir le code, ou en écrivant `SUIVI LV-XXXXXX`. Chaque statut est expliqué par une phrase, par exemple « Bien reçu : un journaliste va l’examiner. ». Le bot n’appelle pas Gemini et ne rend aucun verdict.

Au premier message, le bot demande la langue, puis la garde pour les échanges suivants (bouton « Changer de langue »). Tous les textes sont dans `web/src/lib/messenger-messages.ts` :
- **Français :** texte de référence.
- **Anglais :** premier jet à faire relire avant une démonstration publique.
- **Malgache :** à écrire par un locuteur natif. Il apparaît automatiquement dans le choix de langue quand chaque texte est rempli, garde les mêmes champs que le français (`{code}`, `{date}`, `{status}`…) et que chaque titre de bouton tient en 20 caractères.

Seul le texte est enregistré dans PostgreSQL. Les photos et fichiers ne sont ni téléchargés ni conservés : le bot en note le nombre et demande une description écrite. Un brouillon non confirmé est supprimé après 24 heures.

Mise en route depuis `web/` :

1. Renseigner `MESSENGER_PAGE_ACCESS_TOKEN`, `MESSENGER_APP_SECRET` et `MESSENGER_VERIFY_TOKEN` dans `.env.local` (voir `.env.example`).
2. Créer les tables avec `npm run db:migrate:signalements`.
3. Lancer `npm run dev`, puis exposer le port 3000 en HTTPS, par exemple avec `cloudflared tunnel --url http://localhost:3000`.
4. Dans l’application Meta, déclarer `https://<adresse-du-tunnel>/api/messenger/webhook` avec le jeton de vérification, puis abonner la Page aux champs `messages` et `messaging_postbacks`.

Tant que l’application Meta n’a pas passé l’App Review, seules les personnes qui ont un rôle sur l’application peuvent utiliser le bot.

Pour récupérer les signalements, `npm run signalements:export` crée un fichier CSV dans `web/exports/`, dossier ignoré par Git. Le fichier s’ouvre dans Excel et ne contient pas l’identifiant Messenger des signaleurs. Il contient malgré tout des données personnelles : ne pas le partager hors de l’équipe.

## Architecture

- `web/src/app/page.tsx` — landing publique.
- `web/src/app/connexion/` — inscription, connexion et récupération de compte.
- `web/src/app/verification/` — espace de travail authentifié.
- `web/src/lib/auth.ts` — Better Auth, PostgreSQL et sessions côté serveur.
- `web/src/lib/auth-client.ts` — client d’authentification du formulaire.
- `web/src/proxy.ts` — redirections optimistes ; les pages et l’API valident la session dans PostgreSQL.
- `web/src/app/api/analyze/route.ts` — validation, normalisation en mémoire et appel Gemini côté serveur.
- `web/src/app/api/messenger/webhook/route.ts` — webhook du bot Messenger : signature Meta vérifiée, réponse envoyée après l’accusé de réception.
- `web/src/lib/messenger-flow.ts` et `web/src/lib/signalements.ts` — parcours de conversation et stockage des signalements.
- `PRODUCT_SPEC.md` — état du MVP, choix produit, règles éditoriales et limites connues.
- `BRAND_GUIDELINES.md` — identité visuelle et principes UI.
- `CLAUDE.md` — handoff à Claude Code pour la sécurité et Framer Motion.

Stack : Next.js App Router, React, TypeScript, PostgreSQL (`pg`), Better Auth, SMTP facultatif (`nodemailer`), Geist Sans/Serif, Lucide, `@google/genai`, Gemini 2.5 Flash avec Google Search grounding (forfait gratuit) et Sharp.

Commandes depuis `web/` :

```powershell
npm run dev
npm run db:start
npm run db:migrate
npm run db:migrate:signalements
npm run signalements:export
npm run db:stop
npm run build
npm run lint
```

## Confidentialité et limites

- Le consentement annonce explicitement que le fichier est transmis à Gemini.
- Hamarino ne sauvegarde ni l’image ni son historique ; la réception et le traitement se font en mémoire côté serveur, et l’appel Interactions est envoyé avec `store: false`. Le forfait gratuit Google peut utiliser les prompts et réponses pour améliorer ses produits : ne pas envoyer de contenus sensibles ou confidentiels.
- PostgreSQL conserve les données nécessaires au compte et à la session. Aucun dossier de vérification ni image n’est associé à ce compte dans cette version.
- Le bot Messenger conserve le texte des signalements confirmés et l’identifiant Messenger de leur auteur, sans photo ni fichier. Leur durée de conservation reste à fixer avant une ouverture publique.
- Le réencodage retire les métadonnées EXIF. Le produit n’est donc pas un outil de conservation des originaux ni une chaîne de preuve forensique.
- Un outil de recherche web peut trouver des sources récentes, mais cela ne signifie pas qu’il a retrouvé la première publication d’une image.
- Pas de recherche inversée d’image, d’analyse médico-légale, de traitement vidéo, de mode hors-ligne, d’annuaire de contacts ni de couverture multilingue dans ce MVP.
- Les comptes et l’accès à l’analyse sont protégés par Better Auth et PostgreSQL. Il n’y a pas encore de dossiers par utilisateur, d’audit de publication ni de limitation distribuée des appels Gemini. Avant une ouverture publique, ajouter une protection contre l’abus au niveau de la plateforme/hébergeur et revoir les règles de confidentialité.
- Le produit est en français. Les formulations malgaches et anglaises doivent être relues par des locuteurs natifs avant publication.

Pour la feuille de route et un récit de démo, consulter [PRODUCT_SPEC.md](PRODUCT_SPEC.md).

