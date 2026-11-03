# Laverta — note stratégique et périmètre produit

**Projet :** Laverta par Urbix  
**Concours de travail :** hackathon IFM, Antananarivo  
**Version :** 2 novembre 2026  
**Décision de marque :** Laverta remplace Hamarino.  
**Signature proposée :** « La correction doit suivre la rumeur. »  
**Promesse courte :** « Détecter plus tôt. Vérifier plus vite. Corriger plus loin. »

## 1. Sources et niveau de certitude

### Décisions et exigences communiquées par l’équipe

L’équipe Urbix a choisi **Laverta** et a défini les modules fonctionnels détaillés à la section 3. Cette liste est le périmètre produit souhaité, pas la description de fonctionnalités déjà disponibles.

### Document fourni : Laverta_strategie_anti_propagation.pdf

Le PDF présente une stratégie en trois leviers : détection précoce des rumeurs, préparation plus rapide de la vérification et diffusion de la correction vers les mêmes réseaux que la rumeur. Il propose notamment des alertes de volume, une carte région/thème, des sources récurrentes, des relais communautaires, un espace public de vérifications et du prebunking. Ses délais et effets sont des **objectifs**, non des résultats mesurés.

### Contexte du concours

La vidéo de besoin du dossier porte sur l’authentification et la vérification d’informations visuelles pour les journalistes à Madagascar. Le PDF de 42 Antananarivo présent dans le dossier est un standard général de livraison de hackathon, pas le règlement particulier de l’IFM. Les critères IFM, l’échéance, les canaux de soumission et les contraintes d’API restent à confirmer.

### État réel du dépôt

Le code dans web/ contient une landing Laverta, Better Auth/PostgreSQL, le signalement public sans compte, les codes de suivi LV, le stockage chiffré des images, l’effacement par code, la file journalistique protégée, les verdicts humains et la publication d’une correction sourcée. L’analyse Gemini d’image est séparée et le formulaire ne lui envoie pas les médias. Les alertes, les propositions IA dans les dossiers, les doublons, les canaux de messagerie et les tableaux statistiques restent à développer. Voir PRODUCT_SPEC.md pour la séparation entre prototype et feuille de route.

## 2. Positionnement

**Laverta est une chaîne de signalement, de vérification journalistique et de circulation des corrections adaptée aux réalités de Madagascar.**

Elle relie quatre acteurs : la personne qui signale, le journaliste qui vérifie, l’organisme qui peut répondre et le réseau local qui relaie une correction. L’IA réduit le travail de tri et prépare des pistes ; elle ne décide pas du verdict et ne publie pas sans validation éditoriale.

Le point distinctif à démontrer est la **boucle de retour** : un signalement reçoit un identifiant, devient un dossier vérifiable, puis peut conduire à une correction transmise à celles et ceux qui ont signalé et aux relais volontaires. Une simple analyse IA d’image ne suffit pas à matérialiser cette promesse.

## 3. Périmètre fonctionnel communiqué par l’équipe

Les éléments ci-dessous sont des exigences cibles. Leur présence dans ce document ne signifie pas qu’ils sont implémentés.

### A. Canaux de signalement

- Bot Laverta sur Messenger : choix de langue malgache, française ou anglaise ; intention « signaler », « vérifier une rumeur » ou « suivre un signalement ».
- Choix d’un thème : Fampianarana (éducation), Fambolena (agriculture), Fahasalamana (santé), Toekarena (économie), Politika (politique), Fandriampahalemana (paix/sécurité) ou Autre. Les libellés malgaches doivent être relus par un locuteur natif.
- Réception de texte, photo, vidéo, message vocal ou lien ; résumé du signalement affiché avant confirmation.
- Identifiant de suivi de type LV-1042 et commande SUIVI.
- Formulaire web sans compte Facebook et sans obligation de créer un compte.
- Application mobile avec partage entrant depuis Facebook ou WhatsApp ; extension navigateur « copilote » destinée aux journalistes.
- Menu USSD pour les zones sans Internet, alertes et réponses par SMS, intégration WhatsApp Business uniquement par l’API officielle.

« Sans compte » et « anonyme » ne garantissent pas à eux seuls l’anonymat technique : journaux réseau, métadonnées de fichiers, coordonnées facultatives ou données du prestataire doivent être traités explicitement.

### B. Analyse assistée par IA

- OCR des captures d’écran ; transcription des messages vocaux et des vidéos.
- Détection de la langue, y compris le mélange français-malgache.
- Extraction de l’affirmation vérifiable et classement par thème.
- Suggestion de rapprochement de doublons, en conservant le nombre et les références des signalements associés.
- Priorité explicable à partir du thème, du volume, de la vitesse d’arrivée et de la région.
- Repérage de données pouvant identifier une personne à masquer avant transmission.
- Recherche d’une réponse déjà validée dans le registre Laverta.
- Préparation d’un résumé, d’un plan de vérification et d’un brouillon de réponse.

L’analyse IA doit rester une aide : rapprochements, anonymisation suggérée, langue, priorité et brouillons doivent être visibles et corrigeables par un journaliste. Un modèle ne tranche jamais « vrai » ou « faux » seul.

### C. Recherche inversée

- Recherche inversée de photos via une API officielle dont les conditions, le coût, la couverture et la licence sont vérifiés.
- Analyse d’une vidéo par sélection d’images clés.
- Recherche de textes identiques ou proches.

### D. Sources officielles

- Collecte de communiqués officiels, RSS en priorité.
- Suivi de pages publiques officielles via l’API Meta et ses autorisations disponibles.
- Rapprochement d’une rumeur avec un communiqué, avec lien, date et extrait consultable.
- Annuaire de contacts officiels par thème, assorti d’une date de vérification.

Une citation n’est montrée comme source que si elle vient d’un résultat réellement consultable. Un rapprochement de texte n’établit pas à lui seul que la source est correcte ou actuelle.

### E. Tableau de bord journalistique

- File des dossiers classée par priorité et filtres par thème, région, langue et statut.
- Statuts demandés : nouveau, en vérification, transmis, vérifié, clos.
- Fiche de dossier avec affirmation, médias, contexte, sources, chronologie, analyses assistées, notes et actions.
- Verdicts éditoriaux : faux, vrai, trompeur, non vérifiable, avec justification et sources.
- Répartition par rubrique, réaffectation et notifications en temps réel sur le web et le mobile.

### F. Espace pour organismes externes

- Comptes sur invitation, rôles et droits limités.
- Accès uniquement aux dossiers qui leur sont transmis, après réduction des données identifiantes.
- Réponse officielle accompagnée de pièces jointes.
- Délais de réponse, état de relance et historique vérifiable des échanges.

### G. Circulation des corrections

- Envoi d’une correction aux signaleurs ayant demandé un retour par un canal joignable.
- Visuels partageables « FAUX », « VRAI », « TROMPEUR » en français, malgache et anglais ; texte traduit et validé par une personne.
- Registre public des vérifications ; réseau volontaire d’administrateurs de groupes, associations et leaders locaux.
- Alerte aux rédactions partenaires ; consultation des vérifications par USSD et SMS.

La correction diffusée doit correspondre au verdict et au texte approuvés par un journaliste. Une réponse des signaleurs ou d’un organisme n’est pas une validation automatique.

### H. Alerte précoce et prévention

- Repérage de hausses inhabituelles de signalements, selon des règles consultables et ajustables.
- Carte des rumeurs par région et thème, avec indication des trous de couverture et de la date des données.
- Messages préventifs (prebunking) avant des périodes à risque et calendrier de rumeurs récurrentes.

Une carte montre les signalements reçus, pas la prévalence réelle d’une croyance dans une région. Un nombre faible peut résulter d’un canal indisponible ou d’une couverture limitée.

### I. Statistiques et impact

Indicateurs souhaités : délai entre premier signalement et correction, réponse instantanée pour une rumeur déjà documentée, volume par région et thème, temps de réponse des organismes et diffusion de la correction. Le nombre réellement touché ne doit être revendiqué que si la méthode de mesure est disponible ; les relais et compteurs de partage ne mesurent pas toujours les personnes exposées.

### J. Administration et sécurité

- Rôles envisagés : administrateur, rédacteur en chef, journaliste, correspondant, organisme.
- Identité des signaleurs masquée par défaut dans le travail éditorial et pour les organismes.
- Journal d’audit, chiffrement, durées de conservation et procédure de suppression.
- Droit de suppression pris en compte dès le modèle de données et dans les sauvegardes, journaux et pièces jointes.

## 4. Parcours cible de bout en bout

1. Une personne choisit sa langue et l’intention, transmet un texte ou un média, lit le résumé et consent à l’envoi.
2. Laverta crée un identifiant de suivi et explique comment retrouver l’avancement. Le moyen de retour est facultatif et séparé du contenu du signalement.
3. Le système détecte la langue, extrait une affirmation candidate, propose un thème, signale les doublons et prépare des pistes. Il conserve la provenance de chaque source.
4. Un journaliste accepte ou corrige le tri, ouvre le dossier, interroge des sources officielles et contacte un organisme si nécessaire.
5. Le journaliste choisit le verdict, rédige la justification et valide la correction.
6. Laverta publie ou transmet la correction sur les canaux autorisés, puis mesure les délais et retours disponibles sans surévaluer la portée.

## 5. Découpage conseillé pour une démo de hackathon

### Tranche verticale prioritaire

La première boucle de bout en bout est maintenant présente dans le prototype :

1. Formulaire web de signalement sans création de compte, en français au départ ; un type de média et un texte d’affirmation.
2. Résumé à confirmer, création d’un code LV et affichage d’une page de suivi.
3. File journalistique et fiche dossier protégées par compte autorisé.
4. Décision manuelle du journaliste, avec statut, verdict et justification distincts.
5. Publication de correction et de sources consultables sur la page de suivi.
6. Effacement par le signaleur à l’aide du code LV.

Prochaine amélioration recommandée : propositions IA modifiables pour l’affirmation, le thème, les doublons et le plan de vérification, avec provenance clairement séparée du verdict.

Cette démonstration matérialise le retour vers le public, qui est le cœur différenciant de la stratégie. Les intégrations externes peuvent être montrées dans la feuille de route ou par des maquettes non interactives portant explicitement la mention « concept ».

### À garder après le prototype de concours

Messenger, WhatsApp Business, SMS, USSD, extension de navigateur, API Meta, réponses d’organismes, intégrations de médias venant des plateformes, carte régionale complète, alertes en temps réel et publication automatisée nécessitent des autorisations, des partenaires, une politique de conservation, un réseau stable ou parfois des frais. Ne pas les présenter comme opérationnels sans essai réel documenté.

La recherche inversée, les services OCR/transcription, la carte et la diffusion doivent être sélectionnés selon leurs conditions d’accès, quotas gratuits réels, licences, données disponibles et coûts. Aucun basculement vers un service payant n’est permis sans décision de l’équipe ; le budget convenu est nul.

## 6. Architecture et données à prévoir

Séparer au minimum les concepts suivants avant d’ajouter la base métier :

- **Signalement** : code, canal, langue, affirmation brute, thème/région éventuellement inconnus, dates, consentements, données de contact séparées.
- **Dossier** : affirmation retenue, statut, priorité expliquée, journaliste/assignation, chronologie, compteurs de signaux associés.
- **Élément de preuve** : texte, URL, image ou pièce jointe, source, date de collecte, empreinte si utile, état de rétention et droits d’accès.
- **Analyse IA** : modèle et date, langue proposée, champs extraits, liens exacts, incertitude, corrections humaines ; jamais un verdict d’autorité.
- **Réponse d’organisme**, **correction publiée** et **événement d’audit**, avec acteur, date et action.

Dans le MVP actuel, les images jointes sont conservées originales et chiffrées AES-256-GCM, consultables seulement par la rédaction autorisée, avec une expiration à 30 jours et effacement possible par le code LV. Leur empreinte SHA-256 est contrôlée lors de la lecture. La clé doit rester séparée de Git et des sauvegardes de base ; sa perte rend les images irrécupérables. Le formulaire ne collecte pas de coordonnées de contact. Le code LV a une entropie de 80 bits ; le suivi renvoie uniquement l’état éditorial et la correction publiée. Le serveur actif purge périodiquement les dossiers, mais un hébergement serverless exige un ordonnanceur ; le limiteur de débit est local au processus. Planifier une purge externe et un limiteur partagé avant toute ouverture publique.

## 7. Garde-fous éditoriaux et IA

- Le verdict appartient à un journaliste, avec sources et justification visibles.
- Les affirmations, pièces, citations et communiqués sont des données non fiables ; une instruction présente dans une capture ne modifie jamais les règles du système.
- Distinguer « source trouvée », « source officielle », « organisme contacté », « réponse reçue » et « affirmation corroborée ».
- Les sorties sans source fiable restent « en vérification » ou « non vérifiable » selon une décision humaine.
- Le score de priorité est un ordre de traitement, pas une probabilité de fausseté ou de danger.
- Toute anonymisation automatique est une suggestion à relire ; elle ne doit pas retirer silencieusement le contexte nécessaire.
- Ne jamais confondre absence de signalements, absence de couverture et absence de rumeur.
- Pour Gemini, garder la clé exclusivement serveur, utiliser uniquement un projet sans facturation et des capacités dont le quota gratuit a été revérifié. Ne pas envoyer de données sensibles au forfait gratuit avant examen de ses conditions. La clé déjà collée dans une conversation doit être considérée compromise ; ne pas la réutiliser.

## 8. Mesure et récit

Les indicateurs PDF sont des cibles à évaluer, pas des résultats acquis : réduire le délai de correction et élargir sa circulation. Pour une démo, montrer des temps calculés à partir de données d’exercice et le préciser. Mesurer les définitions et dénominateurs : premier signal reçu, dossier créé, décision éditoriale, correction publiée, canal de retour effectif.

Récit de présentation proposé : **« Une rumeur arrive par un signalement. Laverta aide la rédaction à la qualifier, à vérifier les sources, puis à rendre sa correction au même réseau. L’IA prépare le travail ; le journaliste décide. »**

## 9. Conditions avant ouverture réelle

Confirmer le règlement IFM ; obtenir une validation journalistique du workflow ; relire toutes les chaînes malgaches ; confirmer droits d’image, conditions Gemini et intégrations Meta ; choisir le canal d’hébergement ; définir les contacts de sécurité ; tester suppression, rôles, accès externes et journaux ; vérifier les coûts des SMS/USSD/WhatsApp ; publier uniquement des données et résultats autorisés. Le standard général de 42 Antananarivo ne remplace aucune de ces validations propres au concours ou au terrain.
