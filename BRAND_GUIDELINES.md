# Direction artistique — Laverta par Urbix

## Idée de marque

**Laverta** est le nom choisi par l’équipe Urbix. Ne pas lui attribuer de traduction ou d’étymologie sans validation par un locuteur malgache natif.

**Signature :** « La correction doit suivre la rumeur. »
**Promesse :** « Détecter plus tôt. Vérifier plus vite. Corriger plus loin. »

Laverta relie le premier signal, les éléments de preuve et la correction. L’outil assiste les journalistes ; la rédaction garde le dernier mot.

## Direction retenue

La référence visuelle est [OffRec](https://offrec.qualitec.mg/) : contraste net, bleu franc, interface lumineuse et duo typographique reconnaissable. Laverta en reprend ces principes de composition sans copier son logo, ses illustrations ni ses écrans.

Le résultat doit évoquer une rédaction actuelle : solide et humaine, avec des titres qui se repèrent vite et une interface qui reste calme quand le sujet est sensible.

## Système visuel

| Rôle | Couleur | Usage |
|---|---|---|
| Encre | `#101B2D` | Texte principal, navigation et fonds sombres |
| Papier | `#F5F7FB` | Fond de page |
| Blanc | `#FFFFFF` | Cartes, formulaires et contenus lisibles |
| Bleu signal | `#1A56FF` | Actions principales, liens et repères actifs |
| Bleu profond | `#1547D6` | Survols et actions enfoncées |
| Bleu brume | `#EAF1FF` | Surfaces informatives et fonds secondaires |
| Corail | `#D46A5E` | Attention éditoriale, jamais verdict à lui seul |
| Ambre | `#FFCA72` | Détail d’illustration, sans signification de vérité |
| Ligne | `#E3E8F0` | Séparation et structure |

Les verdicts et statuts sont toujours écrits. Ne pas faire dépendre leur interprétation de la couleur seule.

**Typographie :** Plus Jakarta Sans pour navigation, textes, formulaires et dossiers ; Bebas Neue pour les grands titres courts, en capitales ; Georgia en appoint pour quelques citations longues. Les fichiers WOFF2 sont locaux dans `web/public/fonts/` et leurs licences OFL sont conservées à côté des fontes.

**Logo et mascotte officiels :** utiliser `DA/logo.jpeg` comme source du logo et `DA/mascot.jpeg` comme source de la mascotte. Les variantes transparentes et optimisées utilisées par l’application sont dans `web/public/brand/` : `laverta-logo.png` sur fond clair, `laverta-logo-on-dark.png` sur fond sombre et `laverta-symbol.png` pour les petits formats. Les originaux de `DA/` restent intacts. La mascotte accompagne la lecture et le signalement ; elle ne représente ni une IA qui vérifie seule, ni un verdict. Ne pas réintroduire l’ancien pictogramme œil/globe comme logo.

**Disposition :** l’accueil `/` adopte une composition centrée avec en-tête translucide superposé au hero, logo Laverta, grande accroche, appels à l’action et globe animé en arrière-plan. Le globe dessine les frontières des pays depuis le jeu cartographique Natural Earth 10m. Il effectue un tour complet, commence et revient sur Madagascar, puis marque une courte pause. Les satellites et lumières colorées sont décoratifs : ils ne montrent ni positions satellitaires réelles ni signalements en direct. Les sections de fonctionnalités, parcours, transparence, espaces et FAQ suivent sous le héros. Le thème clair reste le choix initial pour l’application ; le héros d’accueil garde son fond nuit comme panneau de marque, tandis que le contrôle global change le thème des autres surfaces. L’ancienne présentation éditoriale est conservée sur `/landing-editoriale`. Sur mobile, le menu se réduit et les appels à l’action se réorganisent.

**Référence visuelle et structurelle God’s Eye View :** [godseyeview.ai](https://godseyeview.ai/) inspire l’en-tête sombre, la composition centrée du héros, le globe cartographique et l’ordre des sections : introduction, éléments de confiance, fonctionnalités, parcours d’accès, bandeau de partage, transparence, espaces, FAQ et appel final. La section vidéo YouTube est retirée. Les chiffres et témoignages de la référence ne sont pas repris. Le logo, l’animation du globe, les textes et les parcours Laverta restent originaux. La licence MIT du dépôt [God’s Eye View](https://github.com/bilawalsidhu/gods-eye-view) couvre le code source, pas automatiquement les assets tiers.

Le dépôt local `God's_Eye/` contient l’application Vue/Cesium, et non le code du site marketing godseyeview.ai. Le site public sert son propre hero HTML/CSS et son animation `canvas#earth` via `/assets/globe.js`. Laverta reprend la composition générale avec son logo officiel, ses textes et un canvas original. Les contours pays viennent du pack Natural Earth présent localement dans `God's_Eye/`; la source et les conditions domaine public sont documentées dans `web/public/geo/README.md`. Aucun logo, GIF ou script God’s Eye View n’est réutilisé. La mascotte du dossier `DA/` peut apparaître comme repère visuel ; elle ne doit pas suggérer de décision automatisée.

**Langues et thème :** interface disponible en français, malgache et anglais, avec le français et le thème clair par défaut. Les choix sont conservés entre les routes. Tout texte malgache reste à faire relire par un locuteur natif avant une démonstration publique ; les réponses Gemini suivent la langue choisie, mais doivent être relues comme des propositions.

**Mouvement :** transitions courtes au chargement et à l’entrée des sections ; survols discrets sur les cartes et boutons. Le globe du hero fait un tour lent de Madagascar à Madagascar, marque une pause puis recommence. Les satellites tournent autour du globe et les lumières décoratives changent de couleur. Toute l’animation s’arrête hors écran et reste fixe si `prefers-reduced-motion` est actif. Motion for React (anciennement Framer Motion) est importé depuis `motion/react`. Respecter clavier et lecteurs d’écran ; aucun défilement forcé ou contenu masqué si le JavaScript échoue.

**Lottie :** réserver l’animation à un petit symbole de signalement, la jouer une fois et la laisser statique si la réduction du mouvement est demandée. Les icônes d’action ordinaires restent en SVG/Lucide, pour garder une interface rapide et homogène.

## Principes d’interface

1. **Le journalisme avant le spectacle.** Afficher provenance, date, limites et prochaines étapes.
2. **La chaîne reste lisible.** Signalement, vérification, décision, correction et diffusion sont des étapes distinctes ; les statuts ne se confondent pas avec les verdicts.
3. **L’incertitude est nommée.** Écrire « proposition IA », « source consultée », « en attente » ou « non vérifiable ». Un score ne remplace pas une preuve.
4. **L’ancrage local se fait par l’usage.** Montrer les régions, langues et canaux réellement disponibles ; éviter les motifs décoratifs folkloriques. Faire relire les textes en malgache.
5. **Les personnes sont protégées.** Masquer les identités par défaut et ne pas promettre un anonymat absolu sans validation des journaux, prestataires et règles de conservation.
6. **La correction se partage.** Privilégier une conclusion éditoriale courte, ses sources, sa date et un lien ou code de suivi.

## Ton rédactionnel

Direct, calme et compréhensible en français, malgache et anglais. Distinguer « une rumeur est signalée » de « une rumeur est confirmée ». Ne pas ridiculiser les personnes qui partagent une information ; donner une action claire et une source. Ne pas utiliser de chiffres sans données auditables.

## À ne pas faire

- Présenter une maquette, un résultat IA ou un jeu d’exercice comme une vérification réelle.
- Afficher un verdict automatique « FAUX » ou créer un score de certitude sans méthode.
- Annoncer une portée estimée comme un résultat mesuré.
- Ajouter des dégradés bleu-violet, du verre flouté ou des halos décoratifs ; le cyan est limité aux repères de provenance et de scan.
- Utiliser une carte sans couverture, date et provenance vérifiables.

Le brief pour produire les variantes vectorielles du logo reste dans `PROMPT_LOGO_LAVERTA.md`.
