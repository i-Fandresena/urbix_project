# Produit — Laverta par Urbix

## 1. Vision

**Signature :** « La correction doit suivre la rumeur. »
**Promesse :** « Détecter plus tôt. Vérifier plus vite. Corriger plus loin. »

Laverta relie signalements, travail de vérification journalistique et diffusion de corrections auprès des personnes et communautés concernées. L’IA trie et prépare ; un journaliste examine les sources, décide du verdict et valide le message public.

Le périmètre cible complet se trouve dans LAVERTA_STRATEGIE.md. Les exigences communiquées par l’équipe ne sont pas toutes implémentées.

## 2. Problème, publics et valeur

Les rédactions reçoivent des rumeurs et médias dont l’origine, la date ou le contexte sont incertains. Une vérification prend du temps, et une correction publiée sur le seul canal du média ne rejoint pas nécessairement les personnes qui ont vu la rumeur.

Publics prévus :

- personnes qui signalent une information ou consultent son suivi ;
- journalistes, correspondants et rédacteurs en chef qui priorisent et vérifient les dossiers ;
- organismes officiels qui répondent uniquement aux dossiers qui leur sont transmis ;
- relais locaux et rédactions partenaires qui partagent les corrections validées.

Le différenciateur est la boucle de retour : code de suivi, dossier éditorial, verdict sourcé, correction et canal de diffusion vers les signaleurs. La confiance dépend de la provenance, de la confidentialité et de la validation humaine.

## 3. État du prototype et limites exactes

**Implémenté dans web/** : identité et landing Laverta avec le logo et la mascotte choisis par l’équipe dans `DA/`, formulaire public sans compte avec récapitulatif, choix du thème/langue, affirmation, image ou lien, code de suivi aléatoire, suivi public par code, effacement par code, file journalistique protégée par une liste d’adresses autorisées, fiche dossier, statuts, verdict humain, justification, correction sourcée et page publique de correction. Les images jointes sont conservées originales, chiffrées AES-256-GCM dans PostgreSQL et accessibles seulement à la rédaction autorisée ; leur empreinte SHA-256 est contrôlée lors du déchiffrement. Les dossiers expirent après 30 jours.

Le prototype conserve aussi l’espace protégé d’analyse d’image avec transmission à Gemini côté serveur après consentement, recherche Google et citations disponibles. Ce parcours reste séparé : les images reçues par le formulaire de signalement ne sont pas envoyées à Gemini.

La landing et les principaux parcours web ont un choix de langue français/malgache/anglais, mémorisé entre les routes ; le français reste la langue initiale. Le bureau Gemini demande une réponse dans la langue sélectionnée. Un contrôle global active le thème sombre, tandis que le thème clair reste le choix par défaut. Les libellés malgaches sont provisoires et exigent une relecture native.

Un bot Messenger de prototype (`web/src/app/api/messenger/webhook/route.ts`, `web/src/lib/messenger-flow.ts`, `web/src/lib/messenger-messages.ts` et `web/src/lib/signalements.ts`) recueille des signalements texte en français, malgache et anglais. Il n’appelle pas Gemini et ne conserve ni photo ni fichier. Ses signalements sont stockés dans la table `signalement`, séparée de `laverta_reports` : ils n’apparaissent pas encore dans la file rédaction et se récupèrent par export CSV. Ses codes de suivi courts ne fonctionnent que dans Messenger, pour le compte qui a signalé.

Next.js est configuré avec `cacheComponents: true`. Le layout racine reste statique ; les pages qui lisent le cookie de langue sont placées sous une frontière `Suspense` avec un état de chargement statique. Le fournisseur client initialise les préférences depuis les cookies après hydratation.

La page `/connexion` vérifie la session côté serveur. Si PostgreSQL rejette ou interrompt la connexion, elle affiche une erreur localisée et désactive la connexion et la création de compte ; les identifiants `DATABASE_URL` doivent correspondre au serveur PostgreSQL actif.

La route `/` reprend et adapte le héros visuel et l’ordre éditorial de godseyeview.ai : en-tête sombre, composition centrée, globe cartographique, éléments de confiance, fonctionnalités, parcours d’accès, bandeau de partage, transparence, espaces, FAQ et appel final. Le globe utilise les frontières pays Natural Earth 10m ; il commence orienté sur Madagascar, effectue un tour complet et revient sur Madagascar avant une courte pause. Deux satellites stylisés orbitent autour du globe et les lumières changent de couleur. Ces éléments sont illustratifs et ne représentent pas des satellites suivis ni des signalements en direct. Le jeu de données et sa provenance figurent dans `web/public/geo/README.md`. Le catalogue YouTube est omis. Les chiffres et témoignages de la référence ne sont pas transposés ; le texte Laverta décrit seulement le prototype disponible. L’ancienne landing est conservée sur `/landing-editoriale`. Aucun logo, asset applicatif, capture ou script de God’s Eye View n’est embarqué. La licence MIT couvre le code source du dépôt, pas automatiquement ses assets tiers.

Le dépôt local `God's_Eye/` est l’application globe Vue/Cesium et ne contient pas le code source du hero marketing. Le site public utilise un canvas `#earth` animé par `/assets/globe.js`; Laverta reprend la disposition avec un canvas local qui projette les frontières Natural Earth sur un globe, sans transférer le script distant.

Le logo horizontal, son symbole d’application et la mascotte viennent des fichiers fournis dans `DA/`. Les versions transparentes utilisées par le site sont servies depuis `web/public/brand/`. La mascotte est une illustration de marque, pas une représentation de verdict ou d’analyse autonome.

**Limites actuelles** : aucune identité ou coordonnée de retour n’est collectée ; les corrections sont consultables par code, sans alertes. La file utilise une liste locale d’adresses autorisées, pas encore des rôles métier complets. Les propositions IA, le regroupement de doublons, les réponses d’organismes, l’arrivée des signalements Messenger dans la file rédaction, OCR, transcription, recherche inversée, carte, alertes, statistiques et diffusion réseau ne sont pas encore implémentés. La liste complète est dans LAVERTA_STRATEGIE.md.

Le mode sans clé est une simulation et doit le rester clairement. Aucune source ni statistique d’exercice ne doit apparaître comme réelle. La recherche web n’est pas une recherche inversée d’image et l’analyse de Gemini n’est ni une preuve médico-légale ni un verdict.

## 4. Tranche verticale recommandée pour le concours

La première tranche de cette boucle est maintenant implémentée :

1. Formulaire web sans compte obligatoire, avec consentement, affirmation, thème et un média d’exercice.
2. Résumé confirmé et création d’un code LV de suivi.
3. File journaliste protégée et fiche dossier avec statut.
4. Verdict manuel, justification et sources saisies par la rédaction.
5. Correction publique disponible par code après passage au statut « Vérifié ».
6. Effacement du dossier et de ses médias avec le code de suivi.

La prochaine tranche recommandée est l’assistance IA modifiable (affirmation candidate, thème, résumé, doublons et pistes), avec provenance et limites visibles. La rédaction garde la décision et la publication.

Les messageries, SMS, USSD, intégrations officielles, cartes et alertes restent une feuille de route tant qu’elles ne sont pas testées avec de vrais comptes et conditions. Les maquettes doivent être étiquetées « concept ».

## 5. Parcours et statuts

Signalant : choisir la langue et l’intention → décrire la rumeur → joindre un média autorisé → relire le résumé → consentir et envoyer → conserver le code → consulter le suivi → recevoir une correction si un canal de retour a été demandé.

Journaliste : ouvrir la file → examiner thème/région/langue/priorité → valider ou corriger l’analyse → consulter les sources → contacter un organisme si nécessaire → choisir un verdict et le justifier → approuver la correction → choisir les canaux → clôturer.

Statuts demandés : nouveau, en vérification, transmis, vérifié, clos. Les verdicts sont séparés des statuts : faux, vrai, trompeur, non vérifiable. L’absence de source ne constitue pas un verdict de fausseté.

Organisme : accès sur invitation aux seuls dossiers transmis et anonymisés → réponse officielle et pièces autorisées → suivi des délais. Relances avant échéance selon une règle visible ; aucune relance automatique ne doit exposer des informations additionnelles.

## 6. Architecture actuelle et destination

**Application actuelle** : Next.js App Router, TypeScript, React, Better Auth, PostgreSQL via pg, SDK Google GenAI côté serveur, Sharp pour le traitement en mémoire de l’image, Motion for React pour les transitions UI et Lottie pour un symbole animé local. Le SMTP est facultatif. Les polices Plus Jakarta Sans et Bebas Neue sont servies depuis `web/public/fonts/`.

**Composants métier présents** : table `laverta_reports` pour le signalement, les médias chiffrés, l’état éditorial et la correction ; table `laverta_report_audit` pour les changements de statut et de verdict. L’identité de retour n’est pas collectée. La rédaction est autorisée via `LAVERTA_EDITOR_EMAILS` et une session Better Auth vérifiée en production.

Politique du prototype : image originale conservée sans réencodage dans PostgreSQL, chiffrée en AES-256-GCM avec `LAVERTA_MEDIA_ENCRYPTION_KEY`, empreinte SHA-256, accès à l’image réservé à la rédaction, expiration à 30 jours, effacement à la demande par code. Le serveur actif effectue une purge périodique et les routes purgent aussi à l’accès ; les hébergements serverless peuvent suspendre les minuteries, donc prévoir un ordonnanceur de purge avant ouverture publique. Une clé perdue rend les médias irrécupérables ; sa sauvegarde séparée et sa rotation planifiée sont nécessaires. Le chiffrement applicatif ne remplace pas le chiffrement du disque et des sauvegardes.

## 7. Politique IA et sécurité

- Aucune clé Gemini dans le navigateur, dans l’APK, Git ou un chat. Une clé partagée précédemment est compromise : seule une clé neuve peut être créée localement dans web/.env.local, ignoré par Git.
- Garder le projet Google au forfait gratuit sans compte de facturation, sans fallback payant. Revalider les limites et les conditions au moment de la démo ; quota atteint signifie attente ou erreur explicite.
- N’envoyer au fournisseur que les médias autorisés et non sensibles après consentement. Les conditions du forfait gratuit peuvent permettre l’utilisation des prompts/réponses pour l’amélioration des services ; ne pas traiter des sources confidentielles sans décision appropriée.
- Conserver la session Better Auth vérifiée côté serveur pour les routes privées. La clé reste sur le serveur Next.js.
- Les résultats IA et le rapprochement ne sont jamais un verdict. Chaque source est consultable et les affirmations doivent pouvoir être corrigées par un journaliste.
- Aucun compte ni contact n’est demandé au signaleur ; « sans compte » ne veut pas dire anonymat réseau garanti. L’hébergement peut conserver des journaux réseau.
- Le code de suivi contient 80 bits aléatoires ; seule son empreinte SHA-256 et son suffixe sont conservés. Un limiteur en mémoire et un champ honeypot freinent les abus locaux ; une ouverture publique demande un limiteur partagé et une revue de l’infrastructure.
- L’effacement avec le code supprime aussi les événements d’audit associés. Les dossiers sont purgés au prochain accès quand leur rétention de 30 jours est passée.

## 8. Canaux et dépendances

Le formulaire web est le premier canal à réaliser. Le partage mobile peut commencer par une page web adaptée ; l’APK nécessite une URL serveur publique et une signature. Messenger, WhatsApp Business et Meta demandent configuration et autorisations officielles. SMS et USSD dépendent d’un opérateur ou agrégateur et peuvent engendrer des frais. Les extensions de navigateur et recherches inversées dépendent de politiques de navigateur, d’accès aux API, de licences, de quotas et parfois de paiements.

L’équipe a un budget de zéro : ne pas implémenter de dépendance qui débite un compte, ne pas ajouter de fallback payant et ne pas promettre qu’une API externe est gratuite sans vérification.

## 9. Démonstration et mesure

Démo recommandée : envoyer un signalement d’exercice avec une image publique ou autorisée, conserver le code remis, ouvrir la file journaliste avec un compte figurant dans `LAVERTA_EDITOR_EMAILS`, examiner l’image, ajouter des sources réellement consultables, justifier un verdict, publier une correction et la retrouver par code. Marquer clairement le cas d’exercice. Aucun message n’est envoyé au signaleur ; il consulte manuellement la correction sur la page de suivi.

Indicateurs à définir avec leurs dates et dénominateurs : délai premier signalement → verdict, délai → correction, proportion de rumeurs déjà documentées, réponse des organismes, retours délivrés par canal. La portée de correction est un objectif du PDF ; ne pas la présenter comme mesurée sans méthode.

## 10. Décisions à obtenir

Règlement IFM et deadline ; validation du flux par un journaliste ; régions et thèmes du scénario ; relecture native du malgache ; hébergement ; règles de conservation et effacement ; sources officielles disponibles ; accès API et coûts des canaux ; procédure pour traiter les dossiers sensibles.

## Rôles, circuit éditorial et diffusion (novembre 2026)

**Rôles** (table `laverta_staff`, attribués par adresse e-mail depuis `/admin`) : administrateur (équipe et tout le circuit ; amorcé par `LAVERTA_ADMIN_EMAILS`), rédacteur en chef (toute la file, attribution, publication ; les adresses de `LAVERTA_EDITOR_EMAILS` sans rôle en base sont traitées ainsi), journaliste (dossiers de ses rubriques et dossiers attribués), correspondant (`/correspondant` : signalement régional et suivi de ses dossiers), organisme externe (`/organisme` : seulement les dossiers transmis, en version anonymisée rédigée par le journaliste). Le citoyen reste sans compte. En production, un rôle n’est actif qu’avec une adresse confirmée ; la confirmation et la réinitialisation passent par SMTP (Resend, domaine aura-plus.site).

**Circuit** : `/espace` oriente chaque rôle après connexion. Les signalements du bot Messenger (table `signalement`) sont recopiés dans `laverta_reports` (canal `messenger`, sans PSID) et rejoignent la file. La file est triée par une priorité explicable (thème sensible, volume de signalements similaires, vitesse sur 24 h, région, statut) et filtrable par statut, thème, langue, canal, région et attribution. Les doublons sont regroupés par similarité de texte (pg_trgm, seuil 0,45) avec compteur ; un journaliste peut détacher un signalement. Un pic (5 signalements similaires en 24 h) s’affiche dans la file et déclenche un e-mail aux responsables. Attribution, transmission et réponse d’organisme envoient un e-mail et sont journalisées.

**Diffusion** : le statut « Vérifié » avec verdict, justification, source et affirmation publiée (reformulée pour retirer tout indice d’identité) crée une entrée dans `laverta_publications`, sans donnée de signaleur et conservée après l’expiration des dossiers. La base publique `/verifications` permet la recherche par mot-clé et par thème ; chaque vérification propose des visuels PNG FAUX/VRAI/TROMPEUR/NON VÉRIFIABLE en FR/MG/EN (carré et vertical) et des liens de partage. Un nouveau signalement proche d’une vérification publiée (similarité 0,5) reçoit une réponse instantanée sur le web et dans Messenger. Les signaleurs Messenger reçoivent la correction si Meta autorise l’envoi (fenêtre de 24 h) ; sinon la commande SUIVI la renvoie.

**Statistiques** (`/redaction/statistiques`) : délai médian et moyen entre premier signalement et correction, personnes jointes (réponses instantanées et messages Messenger remis), taux de réponses instantanées, rumeurs par thème et région, signalements par canal, réactivité des organismes.

**Limites** : la similarité de texte n’est ni sémantique ni multilingue ; la priorité ne dit rien de la véracité. Les libellés malgaches des espaces connectés sont partiels (repli en français) et doivent être relus par un locuteur natif. Restent à faire : propositions IA (clé Gemini neuve), recherche inversée, sources officielles RSS, relances automatiques des organismes, carte, prebunking, notifications temps réel hors e-mail, application mobile, USSD/SMS, WhatsApp.
