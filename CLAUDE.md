# Contexte Claude Code — Hamarino by Urbix

L’équipe veut un assistant de vérification visuelle pour le hackathon IFM à Antananarivo. Lire avant chaque modification :

1. `MEMO_CONTEXTE_HACKATHON.md` — faits documentés du besoin et barème général, avec ses limites.
2. `PRODUCT_SPEC.md` — public, parcours, architecture, règles éditoriales et confidentialité.
3. `BRAND_GUIDELINES.md` — marque et direction visuelle.
4. `README.md` — installation et démonstration du projet.

`web/` est une application Next.js App Router + TypeScript avec landing publique, authentification Supabase, espace de vérification et route Gemini côté serveur. Le mode de démo est explicitement simulé. Aucune clé Gemini ni credential Supabase n’est présent dans le dépôt. Une clé Gemini collée dans la conversation est compromise : demander son remplacement à Google AI Studio, ne jamais la copier dans un fichier suivi ni la remettre dans un chat. La clé Supabase publishable peut aller dans `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`; ne jamais utiliser de clé `service_role` côté client.

La contrainte financière est stricte : **zéro dépense**. La route doit utiliser Gemini 2.5 Flash avec Google Search en forfait gratuit. Le projet Google AI Studio doit rester au statut **Free**, sans compte de facturation lié. Ne pas ajouter de repli vers un modèle payant ou de service facturé ; quota dépassé = message d’attente/erreur. Supabase Auth doit également rester en formule Free, sans upgrade. Le forfait gratuit Google peut utiliser les prompts et réponses pour améliorer les produits : la démo doit se limiter à des images autorisées, publiques et non sensibles. Garder `store: false` sur les interactions.

Le fichier `src/proxy.ts` renouvelle les sessions, mais n’est pas le seul contrôle d’accès : chaque route qui traite des données sensibles doit revalider l’identité côté serveur. `/api/analyze` doit vérifier une session Supabase valide avant de lire l’image ou d’appeler Gemini. Ne pas embarquer la clé Gemini dans une application mobile. L’APK attend l’URL publique du serveur ; ne produire aucun lien de téléchargement fictif.

## Votre mission

### 1. Revue sécurité d’abord

- Examiner la route `web/src/app/api/analyze/route.ts`, `.gitignore`, les scripts, les dépendances et les variables d’environnement.
- Repérer et corriger les fuites de secrets, validation/limites de requête, manipulation d’image, injection de prompt, citations non vérifiables, erreurs qui divulguent l’API, usage impropre de données sensibles, contrôles de production et risques de quota/abus. Conserver l’intégration Gemini sur le forfait gratuit uniquement.
- Signaler les limites qui exigent infrastructure ou décision de l’équipe, sans prétendre qu’une limitation mémoire locale serait une protection distribuée.
- Ne pas assouplir le refus « non vérifié » lorsqu’aucune source citée n’est retournée. L’API Gemini doit rester sur le serveur.
- Une revue doit être concrète : fichier concerné, scénario exploitable, correction, risque restant.

### 2. Ajouter les mouvements Framer Motion

Toute l’animation d’interface est votre périmètre. Framer Motion n’est pas encore ajouté : installez `framer-motion` seulement si son usage améliore réellement le produit et vérifiez la compatibilité avec les versions en place.

Privilégier des transitions courtes et discrètes pour les changements d’étape, l’arrivée des résultats et les états d’upload. Ne pas ajouter de scroll hijacking, de mouvement continu, de grands effets de parallaxe ou de décor animé. Respecter `prefers-reduced-motion`, préserver clavier/lecteurs d’écran et ne pas ralentir la soumission du formulaire. Garder la hiérarchie et l’aspect imprimé/éditorial de la charte.

### 3. Améliorer les défauts réellement observés

- Garder le ton français et vérifier chaque nouvelle chaîne.
- Toute démonstration sans API doit demeurer étiquetée simulée ; aucun lien/source fictif.
- Les réponses et preuves restent compréhensibles à débit lent, sur mobile et au clavier.
- La landing est `/`, la connexion est `/connexion` et l’espace protégé est `/verification`. Maintenir les liens cohérents et la navigation mobile.
- L’APK téléchargeable depuis la landing doit pointer vers l’URL publique de l’application/API ; le serveur reste la seule frontière qui détient la clé Gemini. Tant que l’hébergement n’est pas choisi, garder le CTA Android en état « en préparation ».
- Conserver l’image en mémoire uniquement, après consentement ; les données de compte passent par Supabase Auth, mais ne pas ajouter de stockage d’images ou de télémétrie produit.
- Pas de motif AI générique (dégradé violet/bleu, halo néon, verre, étoiles ou faux score numérique).
- Le nom Hamarino est un choix de projet à valider par un locuteur natif. Ne pas publier de traduction malgache non relue.

## Sortie attendue

**État de l’audit npm initial :** `npm audit` signale 16 avis modérés regroupés autour de `minimatch` dans la chaîne ESLint de développement ; `npm audit --omit=dev` affiche zéro vulnérabilité. Ne pas lancer `npm audit fix --force` : npm propose un retour incompatible vers ESLint 4. Chercher une correction compatible et documenter le résultat.

1. Faire les corrections sûres et réversibles dans le code.
2. Lancer `npm run build` et `npm run lint` depuis `web/` après les modifications ; ne jamais appeler l’API Gemini avec une clé exposée dans le chat.
3. Fournir un résumé des vulnérabilités traitées, les versions/API consultées, les vérifications exécutées, les risques restants, et la marche à suivre pour une nouvelle clé locale.
4. Ne pas déployer, publier d’images journalistiques, modifier le nom, ou partager une clé au nom de l’équipe.
