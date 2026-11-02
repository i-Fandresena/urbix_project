# Direction artistique — Hamarino by Urbix

## Idée de marque

**Hamarino** signifie « vérifie », « confirme » ou « assure-toi » en malgache. Le nom place le journaliste dans le rôle actif : l’outil aide à examiner une image, mais la rédaction garde le dernier mot. La nuance et la prononciation restent à valider avec un locuteur natif ([notice lexicale](https://malagasyword.org/bins/teny2/hamarino)).

**Signature :** « Chaque image mérite ses sources. »

**Positionnement :** le bureau de recoupement visuel pour les journalistes malgaches. Une interface de travail éditoriale, calme et lisible, avec une traçabilité visible des sources et des incertitudes.

## Principes d’interface

1. **Éditoriale, pas spectaculaire.** Une composition inspirée d’un bureau de rédaction et de la presse de qualité : titres typographiques, marges généreuses, repères de classement, hiérarchie nette.
2. **Une information par niveau.** L’image, les indices visuels, le contexte et les sources ont des blocs distincts. La conclusion doit toujours montrer ses limites.
3. **Calme et crédible.** Pas de compteurs de confiance en pourcentage, d’alertes rouges sans fondement, de jargon de laboratoire ni de ton péremptoire.
4. **Ancrage malgache avec retenue.** La géographie et la réalité de travail de Madagascar sont visibles dans le produit. Pas de motifs folkloriques utilisés comme décoration ; employer les langues locales après validation par des locuteurs natifs.
5. **L’outil s’efface derrière la preuve.** L’image et les sources sont les objets principaux. L’IA n’est ni une mascotte, ni une autorité, ni un décor.

## Système visuel

### Couleurs

| Rôle | Couleur | Usage |
|---|---|---|
| Encre | `#172421` | Titres, texte principal |
| Papier | `#F6F5EF` | Fond de l’espace de travail |
| Papier clair | `#FBFAF6` | Panneaux de formulaire et résultats |
| Vert forêt | `#385D4B` | Actions, liens, repères actifs |
| Vert profond | `#254438` | Action principale |
| Citron doux | `#D6EE75` | Accent très parcimonieux, sélection ou état actif |
| Terre cuite | `#C76A4C` | Accent ponctuel, signal éditorial ou attention |
| Ligne | `#E4E2D9` | Séparateurs et contours |

Le vert ne signifie pas automatiquement « vrai » : les statuts sont nommés en toutes lettres. La terre cuite n’est pas une alerte factuelle par défaut.

### Typographie

- **Geist Sans** pour la navigation, les formulaires et le texte d’interface.
- **Geist Serif** pour les accroches et les titres éditoriaux. La paire fait partie de la même famille typographique ([présentation Vercel de Geist Serif](https://vercel.com/blog/introducing-geist-serif)).
- Le corps de texte reste compact mais lisible ; aucune information essentielle ne dépend d’une petite capitale ou d’une couleur seule.

### Signe

Le signe Hamarino est un cadre d’image ouvert, associé à un repère de source. Il évoque un cadrage et un recoupement, sans reprendre le bouclier de sécurité ou la loupe générique comme logo.

## À éviter

- Dégradés bleu-violet, verre flouté, halos néon et rangées de « cartes IA » interchangeables.
- Étoiles de génération, cerveau, robot, bouclier ou viseur utilisés comme marque.
- Scores de probabilité sans méthode empirique documentée.
- Badges « vérifié » fondés uniquement sur une réponse du modèle.
- Données de démonstration présentées comme de vraies actualités, citations ou statistiques.
- Animations décoratives. Le mouvement de l’interface est réservé à Claude Code ; respecter `prefers-reduced-motion`.

## Langues

Le MVP est en français. Une interface malgache ou anglaise est une extension de produit, pas une traduction automatique à publier sans relecture. Faire relire chaque libellé et nuance éditoriale par un locuteur natif avant une démonstration publique.

## Éléments créés

- Wordmark typographique `hamarino.`
- Cadre de vérification dessiné en SVG inline.
- Palette et composants de base dans `web/src/app/globals.css`.
- Icônes d’interface dans Lucide, utilisées pour la fonction et non comme motifs décoratifs.
