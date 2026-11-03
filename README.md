# Laverta par Urbix

**La correction doit suivre la rumeur.** Laverta est un projet de signalement, vérification journalistique et circulation de corrections pour Madagascar. Sa stratégie relie la détection précoce, la vérification assistée et le retour des corrections vers les signaleurs et relais.

L’application de web/ comprend maintenant le signalement sans compte, le stockage chiffré des images jointes, les codes de suivi LV, une file rédaction réservée aux adresses autorisées et la publication de corrections sourcées. Elle conserve l’espace distinct d’analyse d’image assistée par Gemini. Voir [la note stratégique](LAVERTA_STRATEGIE.md), [le contexte du concours](MEMO_CONTEXTE_HACKATHON.md), [la spécification produit](PRODUCT_SPEC.md), [la charte](BRAND_GUIDELINES.md) et [le brief Claude Code](CLAUDE.md).

Le dossier inclut une vidéo de besoin IFM, le PDF de stratégie Laverta et un document général de 42 Antananarivo. Ce dernier n’est pas le règlement particulier de l’IFM. La synthèse distingue les informations fournies par l’équipe, les objectifs du PDF et les recommandations de conception.

## Prototype disponible

- Landing publique et connexion par e-mail avec Better Auth/PostgreSQL.
- Formulaire public : affirmation, thème, langue, contexte et image ou lien, avec récapitulatif avant envoi.
- Code LV aléatoire à forte entropie ; page de suivi qui n’expose que le statut et la correction publiée.
- Images originales chiffrées AES-256-GCM dans PostgreSQL, avec empreinte SHA-256, accès rédaction, durée de conservation de 30 jours et effacement par code.
- File éditoriale et fiche dossier ; seules les adresses de `LAVERTA_EDITOR_EMAILS` peuvent décider et publier.
- Verdict humain séparé du statut, justification et au moins une source consultable requis pour une correction publiée.
- Espace séparé d’analyse d’image avec Gemini après consentement, recherche Google et citations réellement retournées. Il requiert une clé neuve configurée localement.

La file ne contient pas encore de propositions IA, de détection de doublons ou de transmission automatique aux signaleurs. Un premier bot Messenger existe (voir plus bas), mais ses signalements n’arrivent pas encore dans la file rédaction. WhatsApp, SMS, USSD, analyse vidéo, carte, statistiques et APK restent la feuille de route. Le suivi par code permet de retrouver la correction sur le site, sans alerte SMS ou e-mail.

## Lancer le prototype

Prérequis : Node.js 22 ou plus récent et npm. Depuis PowerShell :

- Se placer dans web.
- Installer les dépendances avec npm install.
- Copier .env.example vers .env.local.
- Renseigner DATABASE_URL, BETTER_AUTH_SECRET, LAVERTA_MEDIA_ENCRYPTION_KEY et LAVERTA_EDITOR_EMAILS. La clé Gemini neuve est nécessaire uniquement pour l’analyse d’image.
- Démarrer PostgreSQL par npm run db:start, créer les tables avec npm run db:migrate puis démarrer le site avec npm run dev.

Ouvrir ensuite http://localhost:3000. La connexion et l’analyse réelle demandent une configuration PostgreSQL et Better Auth valide. Ne pas copier de clé dans un chat ou dans Git.

## Bot Messenger (prototype)

Le bot de la Page Facebook Laverta recueille des signalements dans Messenger, en français, malgache ou anglais. Il demande successivement :
- la langue, gardée pour les échanges suivants ;
- le type : information douteuse ou rumeur à vérifier ;
- le thème et le contenu ;
- le lieu de diffusion et la ville ou région ;
- la confirmation.

Chaque question affiche ses choix numérotés. On répond avec un bouton, en tapant le numéro ou en tapant le nom de l’option : le bot reste utilisable dans les applications qui n’affichent pas les boutons. Le bot n’appelle pas Gemini et ne rend aucun verdict. Il compte les photos et fichiers reçus sans les télécharger ni les conserver.

Les signalements Messenger sont stockés dans la table `signalement`, séparée de `laverta_reports`. Ils n’apparaissent donc pas encore dans la file rédaction. Leur code de suivi (`LV-` suivi de 6 caractères) fonctionne uniquement dans Messenger, avec le bouton « Suivre un dossier » ou en écrivant `SUIVI LV-XXXXXX`, et seulement depuis le compte qui a fait le signalement. La page `/suivi` du site ne le reconnaît pas.

Les textes du bot sont dans `web/src/lib/messenger-messages.ts`. Une langue n’est proposée que si tous ses textes sont remplis, gardent les champs du français (`{code}`, `{date}`…) et si chaque bouton tient en 20 caractères. Les textes malgaches et anglais doivent être relus par des locuteurs natifs avant une démonstration publique.

Mise en route depuis `web/` :

1. Renseigner `MESSENGER_PAGE_ACCESS_TOKEN`, `MESSENGER_APP_SECRET` et `MESSENGER_VERIFY_TOKEN` dans `.env.local`.
2. Créer les tables avec `npm run db:migrate`, ou seulement celles du bot avec `npm run db:migrate:signalements`.
3. Lancer `npm run dev`, puis exposer le port 3000 en HTTPS, par exemple avec `cloudflared tunnel --url http://localhost:3000`.
4. Dans l’application Meta, déclarer `https://<adresse-du-tunnel>/api/messenger/webhook` avec le jeton de vérification, puis abonner la Page aux champs `messages` et `messaging_postbacks`.

Tant que l’application Meta n’a pas passé l’App Review, seules les personnes qui ont un rôle sur l’application, avec un compte développeur Meta, peuvent utiliser le bot.

`npm run signalements:export` crée un fichier CSV des signalements Messenger dans `web/exports/`, dossier ignoré par Git. Le fichier ne contient pas l’identifiant Messenger des signaleurs, mais il contient des données personnelles : ne pas le partager hors de l’équipe. La durée de conservation de ces signalements reste à fixer avant une ouverture publique.

## Budget IA et confidentialité

Le budget convenu est de zéro. Le projet Gemini doit rester au niveau gratuit, sans facturation liée et sans fallback payant. Les quotas et les conditions peuvent changer ; les vérifier avant la démo. Le forfait gratuit peut utiliser prompts et réponses pour améliorer les produits Google : ne transmettre que des contenus publics/autorisés et non sensibles, après consentement. La clé Gemini précédemment partagée est compromise ; la révoquer et en créer une autre, conservée uniquement dans web/.env.local, ignoré par Git.

Le formulaire de signalement conserve l’affirmation, le contexte, le lien fourni et les données de décision jusqu’à l’expiration à 30 jours. L’image jointe est conservée originale et chiffrée par la clé locale ; la rédaction peut la consulter, et son empreinte est vérifiée à la lecture. Le serveur actif purge périodiquement les dossiers ; sur un hébergement serverless, une purge planifiée est nécessaire. La clé de chiffrement doit être sauvegardée séparément et ne doit pas changer sans ré-encryptage des médias. L’effacement par code supprime le dossier et les journaux liés. L’anonymat réseau n’est pas garanti et une ouverture publique demande une revue de l’hébergement, des journaux et du limiteur de débit.

## Références et outils

Le PDF Laverta propose des objectifs de stratégie, pas des résultats observés. Les intégrations Meta, WhatsApp, SMS, USSD, recherche inversée et extension nécessitent une validation réelle de leurs API, autorisations, conditions, couverture et éventuels coûts.

Le développement doit respecter BRAND_GUIDELINES.md et PRODUCT_SPEC.md. Le logo et la mascotte choisis par l’équipe sont dans `DA/` ; les variantes web utilisées par l’application sont dans `web/public/brand/`. Le brief de création de logo reste disponible dans [PROMPT_LOGO_LAVERTA.md](PROMPT_LOGO_LAVERTA.md). Claude Code reçoit les tâches de revue sécurité et Framer Motion décrites dans CLAUDE.md.

## Rôles et espaces (novembre 2026)

Citoyen sans compte (`/signaler`, `/suivi`, `/verifications`), administrateur (`/admin`), rédacteur en chef et journaliste (`/redaction`, `/redaction/statistiques`), correspondant (`/correspondant`), organisme externe (`/organisme`). Après connexion, `/espace` oriente vers l’espace du rôle. Détails et limites : PRODUCT_SPEC.md.
