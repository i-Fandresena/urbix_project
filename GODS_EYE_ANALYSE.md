# Analyse de God's Eye View pour le hackathon IFM

Date : 2 novembre 2026
Dépôt source : <https://github.com/bilawalsidhu/gods-eye-view>
Copie locale : branche `main`, commit `151ce3de` au moment du clonage.

Ce document distingue les éléments relevés dans le dépôt, leur lecture pour le
besoin IFM et les adaptations proposées. Le mémo parent rappelle que le
règlement particulier de l'IFM n'est pas encore disponible ; le besoin décrit
dans la vidéo porte sur l'authentification du contexte des photos et vidéos.

## Faits relevés dans le dépôt

- L'application est un globe interactif d'intelligence géospatiale fondé sur
  des flux et des cartes publics : vols, navires, satellites, séismes,
  météorologie, imagerie cartographique et certaines caméras publiques.
- La pile principale est Vue 3, Pinia, CesiumJS et Vite. Elle tourne dans le
  navigateur avec un serveur local Node.js.
- Le démarrage de base ne demande pas de compte ni de clé API. Certaines
  fonctions sont facultatives et nécessitent des clés, peuvent être limitées ou
  sont facturées. Sans clé, les navires, les incendies NASA FIRMS et la voix IA
  ne sont pas disponibles ; l'accès anonyme OpenSky est limité.
- Le projet fournit l'anglais comme langue source et une traduction française
  complète. Ce dépôt ne contenait pas de catalogue malgache.
- Le code est sous licence MIT, mais les données intégrées et les flux externes
  ont leurs propres licences et conditions. Le jeu de démonstration sur les
  inondations au Népal est signalé comme non commercial.
- Aucune configuration ou source dédiée à Madagascar/Antananarivo n'a été
  trouvée dans cette copie. La couverture doit être vérifiée source par source
  pour le lieu choisi ; l'absence d'un point sur la carte ne prouve pas
  l'absence d'un événement.
- Le projet ne propose pas à lui seul le parcours Hamarino d'authentification
  d'une image : il ne demande pas une photo et une affirmation, ne fait pas de
  recherche inversée d'image, et ne certifie ni provenance ni manipulation.

## État local

- Node.js 24.22.0 LTS est installé dans `%LOCALAPPDATA%\Programs\GodsEye` ; la
  version globale Node 22 n'a pas été remplacée. Elle satisfait la contrainte
  du dépôt (Node 24.14 ou plus récent, ou Node 26).
- Les dépendances sont installées sans télécharger Chromium pour Puppeteer. Le
  lancement Vite ne dépend pas de ce navigateur de test.
- `npm run doctor` indique que l'application est prête sans clés.
- Le serveur local est démarré sur `http://127.0.0.1:4173/`. Pour afficher le
  pilote malgache, ouvrir `http://127.0.0.1:4173/?lang=mg` ; `?lang=fr` choisit
  le français et l'absence de paramètre conserve la sélection/valeur par défaut.
- Aucun fichier `.env` ni secret API n'a été créé.
- Le PC observé dispose d'un Intel i5-10300H (4 cœurs / 8 threads), 16 Go de
  RAM et d'une GTX 1650 Ti de 4 Go. C'est suffisant pour une démo locale, mais
  les scènes Cesium lourdes dépendront du navigateur et de l'accélération GPU.

## Adaptation multilingue locale

Le français existait déjà et reste complet (2 730 messages). Une première
prévisualisation malgache (`mg`) a été ajoutée au sélecteur de langues. Elle
traduit 52 libellés sur 2 730, surtout l'accueil, le sélecteur et des noms de
couches. Les messages manquants retombent explicitement en anglais.

Cette ébauche n'a pas été relue par une personne de langue maternelle
malgache. Ne pas la présenter comme une interface malgache terminée ; relire
les formulations et poursuivre le catalogue dans `src/i18n/locales/mg.json`.
Le contrôle `npm run i18n` affiche le taux de couverture et vérifie les entrées
fournies. Retirer l'exception `mg` dans `scripts/i18n.mjs` une fois le catalogue
complet et relu.

## Analyse pour le besoin IFM

God's Eye View est pertinent comme **outil de recoupement géographique** :
après avoir formulé une affirmation, un journaliste peut explorer le lieu,
consulter des couches cartographiques et comparer certains indices publics.
Il ne répond pas à lui seul à la question « cette image est-elle authentique ? ».
Une vue satellite actuelle ne prouve pas qu'une photo a été prise à cet endroit
ou à cette date.

L'aspect « spy satellite » et certaines couches de surveillance (caméras,
emplacements ALPR, sites sensibles) peuvent aussi détourner la démo du travail
éditorial et créer des risques de vie privée. Les couches ALPR/CCTV ne sont pas
recommandées pour le prototype IFM.

## Recommandations de prototype

1. Garder Hamarino comme parcours principal : image autorisée, affirmation,
   contexte fourni, sources vérifiables, limites et décision humaine.
2. Ouvrir God's Eye View comme panneau cartographique complémentaire centré sur
   le lieu allégué. Présenter chaque couche avec sa source, sa date, sa zone de
   couverture et ce qu'elle ne permet pas de conclure.
3. Préparer un seul scénario de démonstration à Madagascar avec des données
   publiques, pertinentes, licenciées et testées à l'avance. Vérifier la
   disponibilité réelle des couches dans la région et prévoir une capture ou un
   état de démo si le réseau est instable.
4. Utiliser le mode sans clé pour rester à coût nul ; laisser désactivées la
   voix IA et les intégrations cartographiques facturées. Ne pas ajouter de
   clé Gemini/OpenAI à l'application cliente.
5. Éviter le verdict automatique. Une carte peut fournir des indices de lieu
   ou de contexte, pas certifier l'origine, la date ou l'intégrité d'une image.
6. Faire relire le malgache par un locuteur natif avant la présentation au jury.
   Vérifier aussi les licences des données ; la licence MIT du code ne couvre
   pas automatiquement les images ni les flux.

## Lancement PowerShell

Le Node local est conservé à part de la version globale. Dans un nouveau
terminal, depuis ce dossier :

```powershell
$nodeDir = Join-Path $env:LOCALAPPDATA 'Programs\GodsEye\node-v24.22.0-win-x64'
$env:Path = "$nodeDir;$env:Path"
npm run dev -- --host 127.0.0.1
```

Ouvrir ensuite `http://127.0.0.1:4173/`. La copie n'est pas publiée et aucun
changement n'a été poussé sur le dépôt d'origine.
