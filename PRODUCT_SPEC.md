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
5. Gemini examine les éléments visuels, utilise Google Search pour le recoupement, puis retourne un objet structuré.
6. Hamarino présente séparément observations visuelles, contexte, niveau de convergence, limites, étapes suivantes et liens de citations retournés par Google Search.
7. Le journaliste ouvre les sources, réalise les vérifications proposées et copie une note partageable.

Un exemple d’interface est disponible sans clé Gemini. Il est **simulé**, ne cite aucune source et ne doit jamais être présenté au jury comme un fait vérifié.

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
- `web/src/app/page.tsx` : interface et état local du formulaire/résultat.
- `web/src/app/api/analyze/route.ts` : route serveur d’analyse, Gemini Interactions API et recherche Google.
- `@google/genai` : SDK officiel Gemini.
- `sharp` : lecture réelle du format, normalisation et retrait des métadonnées par réencodage en mémoire.
- `geist` : polices auto-hébergées, sans requête externe pour les polices.
- `lucide-react` : pictogrammes fonctionnels.
- Aucun compte utilisateur, stockage d’image, base de données, suivi analytique ou journal de recherches n’est installé.

## 5. Sécurité et confidentialité du MVP

- La variable `GEMINI_API_KEY` est utilisée exclusivement dans la route serveur. Aucun préfixe `NEXT_PUBLIC_`.
- La clé publiée dans la conversation doit être révoquée/rotée. Ne pas la remettre dans le dépôt, le README, un fichier d’équipe, un ticket ou une conversation. Créer une clé d’autorisation neuve dans Google AI Studio et la saisir localement dans `web/.env.local`.
- Le fichier n’est jamais écrit sur disque par l’application : il est reçu et normalisé en mémoire, puis transmis à l’API Gemini après consentement.
- La suppression EXIF élimine des métadonnées utiles comme coordonnées et date ; Hamarino ne sert donc pas de chaîne de conservation de preuve. Conserver le fichier original dans un système rédactionnel maîtrisé si l’enquête l’exige.
- Les images, le prompt et l’affirmation sont des données non fiables. Les éventuelles instructions visibles dans l’image ne doivent pas modifier la politique du modèle.
- Limite de taille : 8 Mo. Formats réels acceptés : JPEG, PNG, WebP. Dimensions plafonnées à 25 mégapixels en entrée, puis 1800 px max avant envoi.
- Le MVP n’a pas encore de compte, de contrôle d’accès, de limitation distribuée de requêtes, ni de journal d’audit. Avant un déploiement public, Claude doit proposer une limitation d’abus placée à la frontière de confiance réelle, une règle de rétention côté fournisseur et une revue de la configuration de production.
- Vérifier les conditions de l’API Google applicables aux images et prompts avant d’utiliser des contenus sensibles ou confidentiels. Le consentement dans l’interface ne remplace pas la validation éditoriale/juridique.

## 6. Hors périmètre aujourd’hui

- Vérification complète de vidéo ou extraction automatique de séquences.
- Recherche inversée d’image dédiée, provenance cryptographique ou analyse médico-légale de manipulation.
- Annuaire vérifié d’experts, contacts publics, statistiques actualisées et veille régionale.
- Mode hors-ligne/satellite, application mobile et upload en réseau intermittent.
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
- Préparer une clé Gemini de remplacement, la restreindre, contrôler quotas et coûts, et ne pas la partager dans le chat.
- Faire relire les termes de consentement et les langues par l’équipe éditoriale.
- Demander à Claude Code la revue sécurité, la mise en mouvement Framer Motion et l’amélioration UX décrites dans `CLAUDE.md`.
