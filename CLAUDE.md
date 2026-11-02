# Contexte Claude Code — Hamarino by Urbix

L’équipe veut un assistant de vérification visuelle pour le hackathon IFM à Antananarivo. Lire avant chaque modification :

1. `MEMO_CONTEXTE_HACKATHON.md` — faits documentés du besoin et barème général, avec ses limites.
2. `PRODUCT_SPEC.md` — public, parcours, architecture, règles éditoriales et confidentialité.
3. `BRAND_GUIDELINES.md` — marque et direction visuelle.
4. `README.md` — installation et démonstration du projet.

`web/` est une application Next.js App Router + TypeScript. Le MVP comporte un formulaire de vérification d’image, un mode de démo explicitement simulé et une route Gemini côté serveur. Aucune clé Gemini n’est présente dans le dépôt. Une clé collée dans la conversation est compromise : demander son remplacement à Google AI Studio, ne jamais la copier dans un fichier suivi ni la remettre dans un chat.

## Votre mission

### 1. Revue sécurité d’abord

- Examiner la route `web/src/app/api/analyze/route.ts`, `.gitignore`, les scripts, les dépendances et les variables d’environnement.
- Repérer et corriger les fuites de secrets, validation/limites de requête, manipulation d’image, injection de prompt, citations non vérifiables, erreurs qui divulguent l’API, usage impropre de données sensibles, contrôles de production et risques de coût/abus.
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
- Conserver l’image en mémoire uniquement, après consentement ; ne pas ajouter de base de données ou de télémétrie sans décision de l’équipe.
- Pas de motif AI générique (dégradé violet/bleu, halo néon, verre, étoiles ou faux score numérique).
- Le nom Hamarino est un choix de projet à valider par un locuteur natif. Ne pas publier de traduction malgache non relue.

## Sortie attendue

**État de l’audit npm initial :** `npm audit` signale 16 avis modérés regroupés autour de `minimatch` dans la chaîne ESLint de développement ; `npm audit --omit=dev` affiche zéro vulnérabilité. Ne pas lancer `npm audit fix --force` : npm propose un retour incompatible vers ESLint 4. Chercher une correction compatible et documenter le résultat.

1. Faire les corrections sûres et réversibles dans le code.
2. Lancer `npm run build` et `npm run lint` depuis `web/` après les modifications ; ne jamais appeler l’API Gemini avec une clé exposée dans le chat.
3. Fournir un résumé des vulnérabilités traitées, les versions/API consultées, les vérifications exécutées, les risques restants, et la marche à suivre pour une nouvelle clé locale.
4. Ne pas déployer, publier d’images journalistiques, modifier le nom, ou partager une clé au nom de l’équipe.
