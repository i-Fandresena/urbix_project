# Mémo de contexte — Hackathon IFM, Antananarivo

**Mis à jour le 2 novembre 2026**  
**Objet :** conserver le contexte connu du concours et guider les prochains travaux dans ce dossier.

## 1. Contexte établi

- L’utilisateur situe ce dossier dans une compétition organisée par l’IFM à Antananarivo.
- La vidéo présente un besoin identifié comme **« Besoin 2 — Authentification des images »**. Une intervenante décrit les difficultés des journalistes face à la circulation rapide de l’information à Madagascar et au travail de qualification, traitement et vérification.
- Le PDF est un référentiel général de livraison des hackathons de **42 Antananarivo**, version 1.1 (novembre 2026). Il ne contient pas le règlement particulier du concours IFM. Les consignes propres à l’événement, lorsqu’elles seront disponibles, primeront.
- Le dossier contient désormais le prototype Laverta dans web/ et une copie locale d'étude de God's Eye View dans `God's_Eye/`. Il ne contient toujours pas le règlement IFM, l'échéance, le canal de soumission ni la composition officielle de l'équipe.

## 2. Besoin utilisateur décrit dans la vidéo

Le besoin central est un outil de travail pour les journalistes malgaches qui aide à vérifier l’information de manière professionnelle et indique le niveau de confiance en s’appuyant sur des éléments et des sources vérifiables.

La priorité exprimée est l’authentification des **photos et vidéos** circulant sur les réseaux sociaux et autres canaux visuels. Le nom « Check » ou « Madagascar Check » est proposé, sans décision définitive.

Autres attentes citées, à traiter comme pistes au-delà du noyau initial :

- veille de l’actualité à Madagascar et dans les différentes régions ;
- interface en malgache, français et anglais ;
- accès dans les zones éloignées, idéalement hors ligne ou au moins via satellite ;
- orientation vers les sources de vérification : administrations, experts, dossiers et lieux où consulter les documents ;
- annuaire à jour des contacts d’organismes publics et privés ;
- accès à des statistiques récentes ;
- suggestions d’angles de reportage par thème ou actualité.

La transcription automatique de la vidéo est conservée dans `analysis/transcripts/Hackathon_Besoins.txt`. Elle a été faite localement avec Whisper (modèle `base`, langue détectée : français). C’est une transcription de travail avec quelques erreurs de reconnaissance ; la synthèse de ce mémo paraphrase le sens, et toute citation mot à mot devra être vérifiée à l’écoute.

## 3. Analyse et cadrage conseillé

**Positionnement de travail :** un assistant de vérification pour les journalistes, avec des résultats explicables et des pistes de vérification, plutôt qu’un arbitre qui prétend déclarer seul une information « vraie » ou « fausse ».

**MVP conseillé pour le hackathon :** centrer la démonstration sur un cas vérifiable de photo (et, si le temps le permet, d’image extraite d’une vidéo). Pour chaque cas, montrer :

1. l’image reçue et le contexte fourni par l’utilisateur ;
2. les indices disponibles et leurs limites ;
3. les sources ou vérifications qui permettent de recouper l’image ;
4. une conclusion prudente, avec un niveau de confiance justifié et les étapes suivantes.

La détection technique d’une image manipulée ne suffit pas à établir le contexte ou la véracité d’une publication. La traçabilité des indices, des sources et de l’incertitude doit donc faire partie de la démonstration.

**À garder comme extensions, sauf si le règlement ou le temps disponible l’impose :** veille nationale, couverture multilingue complète, fonctionnement hors ligne/satellite, annuaire national exhaustif, statistiques actualisées et suggestions d’angles. Ces éléments élargissent fortement le périmètre et dépendent de données, de partenaires et d’infrastructures qui ne sont pas décrits dans le dossier.

Cette priorité est une recommandation déduite de la vidéo et du barème général, pas une consigne officielle du concours.

## 4. Référentiel général de livraison (PDF)

Le document de 42 Antananarivo demande trois livrables obligatoires à la date limite :

- un dépôt GitHub complet et accessible, avec historique de commits ;
- un `README.md` qui explique le problème, la solution, les fonctionnalités réalisées, la stack, le lancement, la démo et les limites ;
- un prototype ou démonstrateur qui fonctionne, même s’il n’est pas déployé.

Le standard recommande de créer le dépôt dès le kick-off, de pousser des commits réguliers, de maintenir `main` fonctionnelle, de compléter le README au fil de l’eau, puis de geler les fonctionnalités environ une heure avant la deadline pour stabiliser, documenter et tester. Un référent transmet les liens de toute l’équipe. La dernière version soumise avant l’échéance est celle évaluée.

Barème de référence sur 100 points : fonctionnalité du prototype **30 %** ; pertinence du problème **15 %** ; innovation et créativité **15 %** ; qualité technique **15 %** ; expérience utilisateur **10 %** ; pitch et démonstration **10 %** si prévus ; collaboration **5 %**. L’organisation peut adapter ce barème.

Sécurité et intégrité : aucune clé, aucun mot de passe ou token dans le dépôt ; aucun jeu de données personnelles réelles ; licences et sources citées ; indiquer les outils d’IA utilisés ; expliquer et vérifier le code généré ; décrire honnêtement les limites. Le README doit permettre au jury de lancer le projet depuis un clone propre sans aide de l’équipe.

## 5. Points à confirmer auprès de l’organisation ou de l’équipe

- règlement et thème officiels du concours IFM ;
- deadline exacte, canal et format de soumission, pitch ou démo attendus ;
- critères de jury spécifiques, s’ils diffèrent du référentiel général ;
- durée du hackathon, composition de l’équipe et technologies maîtrisées ;
- données, sources, API, contacts de journalistes ou partenaires disponibles ;
- règles de confidentialité, droits d’utilisation des images et éventuelles restrictions sur l’IA.

## 6. Sources locales

- `Hackathon_Besoins.mp4` — présentation vidéo du besoin « Authentification des images » ; synthèse et transcription de travail ci-dessus.
- `Laverta_strategie_anti_propagation.pdf` — stratégie Laverta en trois leviers ; ses indicateurs sont des objectifs et non des résultats mesurés.
- `42_Antananarivo_Standard_Livraison_Hackathons.pdf` — référentiel général, version 1.1, novembre 2026. Pages utiles : livrables et README (4–5), dépôt (6), sécurité et IA (7–8), présentation et barème (9–10), soumission et checklist (11–12), pièges fréquents (13), gouvernance (14).

## 7. Nouvelle direction Urbix — Laverta

L’équipe a choisi **Laverta** à la place de Hamarino. La signature proposée est « La correction doit suivre la rumeur » et la promesse « Détecter plus tôt. Vérifier plus vite. Corriger plus loin. » Ne pas attribuer de traduction ou d’étymologie au nom sans validation par un locuteur malgache natif.

Le document **Laverta_strategie_anti_propagation.pdf** décrit trois leviers : détection précoce, préparation de la vérification et circulation des corrections auprès des signaleurs, relais et rédactions. Il présente les délais et la portée comme des objectifs, pas des résultats mesurés. L’équipe a ensuite fourni un périmètre détaillé couvrant signalements multicanaux, analyse IA, sources officielles, tableau journaliste, organismes, corrections, prévention, statistiques, administration et sécurité. La synthèse des sources, le détail fonctionnel, la recommandation MVP et les limites sont dans [LAVERTA_STRATEGIE.md](LAVERTA_STRATEGIE.md).

**État réel au 2 novembre 2026 :** le prototype web Laverta comprend le formulaire public avec récapitulatif, le suivi par code LV, le stockage d’images chiffrées dans PostgreSQL, l’effacement par code, la file et la fiche rédaction protégées, la décision humaine avec sources et la correction consultable. L’analyse Gemini reste une fonction séparée et ne reçoit pas automatiquement les images des signalements. Les alertes, propositions IA dans les dossiers, bot, messageries, USSD/SMS, API Meta, carte et statistiques sont encore à développer. Voir PRODUCT_SPEC.md pour les limites exactes et le lancement.

**Direction de marque :** signature éditoriale, circulation visible du signal à la source puis à la correction, typographie sobre et interface accessible. Pas de verdict IA automatique, de faux score ni de carte présentée comme mesure de prévalence. BRAND_GUIDELINES.md fournit la charte.

**Mise à jour design du 3 novembre 2026 :** Laverta adopte un style plus lumineux, inspiré par les contrastes, le bleu signal et le duo typographique vus sur OffRec, sans copier ses écrans ou éléments de marque. Le système utilise Plus Jakarta Sans, Bebas Neue, papier clair et surfaces bleues pâles ; la landing met en avant un dossier illustratif et la boucle signalement → source → correction. Les animations Motion restent brèves, un Lottie de signalement joue une seule fois et le mouvement réduit est respecté. Les détails et les fichiers locaux sont dans BRAND_GUIDELINES.md et `web/src/app/`.

**Ajout UI du 3 novembre 2026 :** l’interface web propose FR/MG/EN sur les routes, conserve la préférence, et offre un thème sombre avec thème clair par défaut. L’analyse Gemini reçoit la langue sélectionnée comme consigne de rédaction ; elle reste une proposition à vérifier. La direction de marque et les droits de God’s Eye View sont documentés dans BRAND_GUIDELINES.md et PRODUCT_SPEC.md. La traduction malgache doit être relue nativement.

**Mise à jour landing du 3 novembre 2026 :** l’accueil `/` reprend la composition centrée du héros sombre et l’enchaînement de sections de [godseyeview.ai](https://godseyeview.ai/) — confiance, fonctionnalités, accès, partage, transparence, espaces du prototype, FAQ et appel final. Les contenus Laverta remplacent les métriques et affirmations de la référence ; le catalogue YouTube est omis. Le globe affiche les frontières pays Natural Earth et tourne en un cycle complet de Madagascar à Madagascar. Les satellites et lumières colorées sont décoratifs, pas des positions réelles ni des signalements live. La source du pack et ses conditions domaine public sont documentées dans `web/public/geo/README.md`. La présentation éditoriale précédente est conservée sur `/landing-editoriale`. Les traductions malgaches ajoutées restent à relire par une personne native.

**Précision sur le hero God’s Eye View :** la copie locale `God's_Eye/` contient l’application globe Vue/Cesium et son écran de premier lancement, pas le code du site marketing godseyeview.ai. Le site public utilise un hero HTML/CSS avec `canvas#earth` et `/assets/globe.js`. Laverta en reprend la composition avec son logo officiel, son canvas et son contenu propre au produit. Le script distant et les assets applicatifs God’s Eye View ne sont pas importés. Les frontières Natural Earth sont réelles ; les satellites et lumières sont illustratifs, sans flux live.

**Identité visuelle fournie par l’équipe :** le dossier `DA/` contient `logo.jpeg` et `mascot.jpeg`, désormais adoptés comme logo et mascotte Laverta. Les déclinaisons transparentes du logo, le symbole d’application et la mascotte recadrée sont servis depuis `web/public/brand/`. La mascotte est un repère de marque ; elle ne rend pas de verdict.

**Contraintes persistantes :** budget IA nul ; Gemini doit rester sur projet gratuit sans facturation, et aucune API externe supposée gratuite. Une clé précédemment collée dans la conversation est compromise : la révoquer, en créer une autre et ne la saisir que localement dans web/.env.local. Ne jamais la mettre dans Git ou un contexte Claude Code. Les données d’exercice doivent être identifiées ; les conditions du forfait gratuit et les sources doivent être vérifiées avant tout contenu sensible.

## 8. Copie locale de God's Eye View — piste géospatiale

Le 2 novembre 2026, l'équipe a cloné `https://github.com/bilawalsidhu/gods-eye-view` dans `God's_Eye/` pour évaluer une carte géospatiale complémentaire. Le dépôt est un globe Cesium/Vue qui rassemble des flux et cartes publics ; ce n'est pas un produit d'authentification d'images et il ne remplace pas Laverta. Aucune source dédiée à Madagascar/Antananarivo n'a été identifiée dans la copie. Vérifier la couverture, les dates et les licences de chaque flux avant toute démonstration. L'analyse complète, l'état d'installation local et les recommandations figurent dans `God's_Eye/GODS_EYE_ANALYSE.md`.

Une prévisualisation malgache a été ajoutée localement (`mg`, 52 chaînes sur 2 730) ; les chaînes manquantes reviennent en anglais et nécessitent une relecture par un locuteur natif. Le français du projet source était déjà complet. Le serveur de développement local répond sur `http://127.0.0.1:4173/` ; aucun service n'est publié.
