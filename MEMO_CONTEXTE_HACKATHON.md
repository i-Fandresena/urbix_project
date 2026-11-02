# Mémo de contexte — Hackathon IFM, Antananarivo

**Mis à jour le 2 novembre 2026**  
**Objet :** conserver le contexte connu du concours et guider les prochains travaux dans ce dossier.

## 1. Contexte établi

- L’utilisateur situe ce dossier dans une compétition organisée par l’IFM à Antananarivo.
- La vidéo présente un besoin identifié comme **« Besoin 2 — Authentification des images »**. Une intervenante décrit les difficultés des journalistes face à la circulation rapide de l’information à Madagascar et au travail de qualification, traitement et vérification.
- Le PDF est un référentiel général de livraison des hackathons de **42 Antananarivo**, version 1.1 (novembre 2026). Il ne contient pas le règlement particulier du concours IFM. Les consignes propres à l’événement, lorsqu’elles seront disponibles, primeront.
- Le dossier ne contient actuellement ni code de projet, ni règlement IFM, ni échéance, ni canal de soumission, ni composition d’équipe.

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
- `42_Antananarivo_Standard_Livraison_Hackathons.pdf` — référentiel général, version 1.1, novembre 2026. Pages utiles : livrables et README (4–5), dépôt (6), sécurité et IA (7–8), présentation et barème (9–10), soumission et checklist (11–12), pièges fréquents (13), gouvernance (14).

## 7. Direction prise pour Urbix — Hamarino

À la demande de l’équipe Urbix, le premier MVP a été cadré autour de **Hamarino by Urbix**, signature **« Chaque image mérite ses sources. »** Le nom vient de l’impératif malgache lié à « vérifier / s’assurer » ; sa prononciation et la nuance culturelle doivent être validées par une personne dont le malgache est la langue native ([notice lexicale Hamarino](https://malagasyword.org/bins/teny2/hamarino)).

La direction visuelle est éditoriale et sobre : encre, papier, vert forêt, accents limités, typographies Geist Sans et Geist Serif. Le produit sépare les indices visuels, le contexte trouvé et les sources. Il n’affiche pas de verdict automatique ; l’absence de citations maintient le résultat à « à vérifier ».

La première implémentation se trouve dans `web/`. Consulter `PRODUCT_SPEC.md` pour le parcours, l’architecture, les règles de preuve, les limites et les pistes d’évolution, `BRAND_GUIDELINES.md` pour la charte, `README.md` pour lancer la démo, et `CLAUDE.md` pour le handoff de sécurité et de Framer Motion.

**Clé Gemini :** une clé a été collée par l’utilisateur dans la conversation. Elle est considérée compromise ; elle n’a pas été copiée dans le code ou les fichiers du projet. La révoquer/rotater dans le compte Google et mettre une clé d’autorisation neuve uniquement dans `web/.env.local`, fichier ignoré par Git. Ne jamais la communiquer à Claude Code dans un chat, à un commit ou à un autre agent.

**Limites de la réalisation actuelle :** l’analyse Gemini ne fournit pas une preuve médico-légale ni une authentification de provenance ; la recherche web n’est pas une recherche inversée d’image. L’application ne conserve pas les images, et son réencodage retire les métadonnées originales. Le mode d’exemple est entièrement simulé et ne doit pas être présenté comme une enquête réelle. L’interface est française ; les traductions malgaches/anglaises nécessitent une relecture native.
