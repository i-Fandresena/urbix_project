# Produit — Hamarino by Urbix

## 1. Problème et public

Les journalistes à Madagascar reçoivent des photos et vidéos dont le lieu, la date ou la légende sont incertains. Le besoin documenté est d’aider à authentifier le contexte et de trouver des pistes de vérification, dans un environnement où les sources locales et les conditions d’accès varient.

**Public primaire :** journaliste, rédacteur ou fact-checker qui doit décider quoi recouper avant de publier.

**Promesse :** « Donnez une image et ce que vous en savez. Hamarino rassemble des indices et des sources consultables pour guider la vérification humaine. »

**Ce que le produit ne prétend pas faire :** certifier automatiquement qu’une image est vraie, détecter avec fiabilité un montage, établir seul une date ou une localisation, ni remplacer une source locale.

## 2. Parcours MVP

1. Le journaliste choisit une image JPEG, PNG ou WebP, jusqu’à 8 Mo.
2. Il saisit l’affirmation à vérifier et un contexte optionnel (source, date, lieu, lien).
3. Avant l’envoi, il confirme que le fichier sera transmis à Gemini pour l’analyse.
4. Le serveur vérifie le format réel, limite les dimensions et réencode l’image en mémoire afin de retirer les métadonnées EXIF et de réduire le poids.
5. Gemini 2.5 Flash examine les éléments visuels, utilise Google Search pour le recoupement, puis retourne un objet structuré. L’appel désactive le stockage d’interaction (`store: false`).
6. Hamarino présente séparément observations visuelles, contexte, niveau de convergence, limites, étapes suivantes et liens de citations retournés par Google Search.
7. Le journaliste ouvre les sources, réalise les vérifications proposées et copie une note partageable.

Un exemple d’interface est disponible sans clé Gemini. Il est **simulé**, ne cite aucune source et ne doit jamais être présenté au jury comme un fait vérifié.

Le parcours d’accès démarre sur la landing `/`, puis mène à `/connexion` (création ou connexion Better Auth) avant l’espace `/verification`. Les comptes et sessions sont conservés dans PostgreSQL. La landing comporte une prévisualisation mobile et un emplacement de téléchargement. L’APK n’est pas publiable tant qu’une URL publique n’est pas disponible : l’application Android doit joindre le serveur Next.js pour authentifier l’utilisateur et appeler Gemini sans embarquer la clé.

## 3. États et règles éditoriales

- `supported` : une ou plusieurs sources citées étayent directement l’affirmation.
- `contradicted` : une ou plusieurs sources citées contredisent directement l’affirmation.
- `unverified` : source absente, faible, indirecte, contradictoire ou recherche infructueuse.
- `high`, `medium`, `low`, `insufficient` : appréciation qualitative de la convergence. Ce n’est pas un score de vérité ni une probabilité statistique.
- Si aucune citation URL de recherche n’est retournée par l’API, le serveur force le statut `unverified`, la confiance `insufficient` et l’affichage d’une limite explicite.
- Ne jamais afficher un lien écrit librement par le modèle comme une source. L’interface affiche uniquement les URL portées par les annotations de citation de la réponse Gemini.
- Toute décision de publication reste humaine.

## 4. Architecture actuelle

- `web/` : Next.js App Router, TypeScript, React, CSS global responsive.
- `web/src/app/page.tsx` : landing publique et présentation du produit.
- `web/src/app/connexion/` : création de compte, connexion et demande de réinitialisation.
- `web/src/app/verification/` : interface et état local du formulaire/résultat.
- `web/src/proxy.ts` : redirections optimistes vers la connexion ; les routes protégées valident aussi la session côté serveur.
- `web/src/lib/auth.ts` : Better Auth, pool PostgreSQL et e-mails SMTP facultatifs.
- `web/src/app/api/auth/[...all]/route.ts` : endpoints Better Auth.
- `web/src/app/api/analyze/route.ts` : route serveur d’analyse, Gemini Interactions API et recherche Google.
- `web/src/app/api/messenger/webhook/route.ts`, `web/src/lib/messenger-flow.ts` et `web/src/lib/signalements.ts` : bot Messenger de la Page Laverta, qui recueille des signalements texte sans appeler Gemini.
- Better Auth avec PostgreSQL (`pg`) : comptes e-mail/mot de passe, mots de passe hachés et sessions par cookies ; SMTP est facultatif pour la confirmation et la récupération par e-mail.
- `@google/genai` : SDK officiel Gemini.
- `sharp` : lecture réelle du format, normalisation et retrait des métadonnées par réencodage en mémoire.
- `geist` : polices auto-hébergées, sans requête externe pour les polices.
- `lucide-react` : pictogrammes fonctionnels.
- Aucun dossier de vérification, stockage d’image, suivi analytique ou journal de recherches n’est installé. PostgreSQL conserve les données minimales de compte, les mots de passe hachés et les sessions. Pour le bot Messenger, il conserve aussi le texte des signalements confirmés, les brouillons de moins de 24 heures et la langue choisie par chaque contact.

## 5. Sécurité et confidentialité du MVP

- La variable `GEMINI_API_KEY` est utilisée exclusivement dans la route serveur. Aucun préfixe `NEXT_PUBLIC_`.
- La clé publiée dans la conversation doit être révoquée/rotée. Ne pas la remettre dans le dépôt, le README, un fichier d’équipe, un ticket ou une conversation. Créer une clé d’autorisation neuve dans Google AI Studio et la saisir localement dans `web/.env.local`.
- Le fichier n’est jamais écrit sur disque par l’application : il est reçu et normalisé en mémoire, puis transmis à l’API Gemini après consentement.
- Le projet Gemini doit rester au forfait **Free**, sans compte de facturation associé. L’application n’a aucun basculement payant. Google publie 500 requêtes Google Search par jour au forfait gratuit (quota partagé avec Flash-Lite) ; les limites peuvent changer et une demande peut être refusée une fois une limite atteinte.
- La base PostgreSQL doit être fournie par l’équipe, en local ou chez un hébergeur choisi sans dépasser le budget. `DATABASE_URL` et `BETTER_AUTH_SECRET` restent des secrets serveur. Le conteneur Compose fourni est réservé au développement local.
- Les pages de connexion et d’inscription utilisent Better Auth. Le proxy ne fait qu’une redirection optimiste ; la page `/verification` et la route d’analyse revalident la session côté serveur avant tout accès. La clé Gemini reste exclusivement côté serveur.
- Aucun service d’e-mail n’est requis pour créer un compte et se connecter. La confirmation d’adresse et la récupération du mot de passe sont activées seulement lorsque des paramètres SMTP sont fournis ; tester l’envoi avant de l’exiger en production.
- Les conditions du forfait gratuit autorisent Google à utiliser prompts et réponses pour améliorer ses produits. Le consentement de l’interface l’indique ; réserver la démo à des images autorisées, publiques et non sensibles.
- L’appel Interactions utilise `store: false` pour ne pas conserver la requête/réponse dans l’historique des interactions Google. Cela ne change pas les conditions d’utilisation des données du forfait gratuit.
- La suppression EXIF élimine des métadonnées utiles comme coordonnées et date ; Hamarino ne sert donc pas de chaîne de conservation de preuve. Conserver le fichier original dans un système rédactionnel maîtrisé si l’enquête l’exige.
- Les images, le prompt et l’affirmation sont des données non fiables. Les éventuelles instructions visibles dans l’image ne doivent pas modifier la politique du modèle.
- Limite de taille : 8 Mo. Formats réels acceptés : JPEG, PNG, WebP. Dimensions plafonnées à 25 mégapixels en entrée, puis 1800 px max avant envoi.
- Le MVP n’a pas encore de limitation distribuée de requêtes, de dossiers par utilisateur, ni de journal d’audit. Avant un déploiement public, Claude doit proposer une limitation d’abus placée à la frontière de confiance réelle, une règle de rétention côté fournisseur et une revue de la configuration de production.
- Vérifier les conditions de l’API Google applicables aux images et prompts avant d’utiliser des contenus sensibles ou confidentiels. Le consentement dans l’interface ne remplace pas la validation éditoriale/juridique.

## 6. Hors périmètre aujourd’hui

- Vérification complète de vidéo ou extraction automatique de séquences.
- Recherche inversée d’image dédiée, provenance cryptographique ou analyse médico-légale de manipulation.
- Annuaire vérifié d’experts, contacts publics, statistiques actualisées et veille régionale.
- APK Android signé, publication du fichier et hébergement public du binaire ; la conception landing/mobile existe mais nécessite une URL de serveur public avant de construire une version distribuable.
- Mode hors-ligne/satellite et upload reprenable sur réseau intermittent.
- Publication d’une interface malgache ou anglaise sans relecture humaine.
- Gestion de dossiers, collaboration rédactionnelle, hébergement d’images ou rétention de preuves.

## 7. Évolutions qui créent de la valeur

1. **Piste source exploitable :** chaque résultat relie une affirmation à une source consultable et une prochaine action (contact local, recherche de version antérieure, comparaison d’éléments visibles).
2. **Mode faible débit :** interface légère, redimensionnement local facultatif avant upload, reprise réseau et fiche texte sans images persistées. À concevoir sans promettre de recherche hors-ligne.
3. **Chronologie des apparitions :** intégrer une recherche inversée autorisée ou un catalogue de publications, conserver les URL et dates de première observation avec une preuve d’origine.
4. **Carte des sources à Madagascar :** répertoire maintenu et validé par journalistes, avec date de vérification, domaine, région et contact public.
5. **Passerelle image depuis vidéo :** extraction de quelques images clés, puis le même processus de source et de contexte.
6. **Rapport de vérification exportable :** conserver les citations, date de recherche, texte envoyé, limites et interventions du journaliste, avec politique de confidentialité explicite.

Ces extensions ne doivent entrer dans le pitch MVP que si elles sont réellement prototypées ou clairement nommées comme feuille de route.

## 8. Récit de démonstration (2 minutes)

1. Ouvrir la vérification d’image et présenter une affirmation plausible avec une image d’exercice autorisée.
2. Montrer les éléments de contexte que le journaliste connaît déjà et le consentement d’envoi.
3. Lancer Gemini et observer séparément ce que l’image montre et ce que les sources corroborent.
4. Ouvrir une citation de recherche et montrer les limites / vérifications suivantes.
5. Conclure : « Hamarino n’ajoute pas un verdict de plus au bruit : il rend le recoupement visible, sourçable et réutilisable par le journaliste. »

La démo réelle doit utiliser une clé de remplacement neuve, une image dont l’équipe a les droits, un cas non sensible et des liens vérifiés à l’avance. Si l’API est indisponible, utiliser l’exemple simulé en disant explicitement qu’aucune source réelle n’a été recherchée.

## 9. Décisions attendues de l’équipe avant le pitch

- Obtenir le règlement IFM spécifique, le format de démo, la durée et l’échéance.
- Valider le nom et le sens exact de « Hamarino » avec un locuteur malgache natif.
- Choisir une image de démonstration avec licence/autorisation et un fait qui se recoupe dans des sources ouvertes.
- Préparer une nouvelle clé Gemini dans un projet dont le statut reste **Free**, sans compte de facturation lié, surveiller les quotas gratuits et ne pas partager la clé dans le chat.
- Démarrer PostgreSQL en local ou créer une base PostgreSQL accessible au serveur, renseigner les variables locales, lancer `npm run db:migrate`, puis créer un premier compte avant la démo.
- Choisir une URL publique pour héberger Next.js ; elle est nécessaire à l’APK Android et aux liens d’e-mail si SMTP est configuré. Préparer ensuite la signature Android et le lien de téléchargement.
- Faire relire les termes de consentement et les langues par l’équipe éditoriale.
- Demander à Claude Code la revue sécurité, la mise en mouvement Framer Motion et l’amélioration UX décrites dans `CLAUDE.md`.
