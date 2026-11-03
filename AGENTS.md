# Contexte du concours

Avant de répondre sur le besoin, le périmètre ou les livrables, lire `MEMO_CONTEXTE_HACKATHON.md`. Distinguer les faits des sources, l'analyse et les recommandations. Le PDF disponible est un standard général de 42 Antananarivo, pas le règlement particulier du concours IFM.

# Projet Laverta

Avant de modifier le produit, lire `LAVERTA_STRATEGIE.md`, `PRODUCT_SPEC.md`, `BRAND_GUIDELINES.md` et `CLAUDE.md` en plus du mémo de concours. Le PDF `Laverta_strategie_anti_propagation.pdf` donne la stratégie ; les fonctions listées dans la note ne sont pas nécessairement déjà codées. L'application Next.js se trouve dans `web/`. La clé Gemini partagée dans la conversation est compromise : seule une clé nouvellement créée peut aller dans `web/.env.local`, qui doit rester ignoré par Git.

# Graphify

Ce dossier possède un graphe de connaissances dans `graphify-out/`.

- Pour une question sur le projet, consulter d'abord le graphe avec `graphify query "<question>"`.
- Si `graphify` n'est pas dans le PATH Windows, utiliser son lanceur installé via `& (Join-Path $env:APPDATA 'Python\Python313\Scripts\graphify.exe') query "<question>"`.
- Utiliser `graphify path "<A>" "<B>"` pour relier deux concepts et `graphify explain "<concept>"` pour en examiner un.
- Consulter les sources brutes pour les détails auxquels le graphe renvoie.
- Après modification des sources ou du mémo, actualiser le graphe avec le skill Graphify ou `graphify update .`.
- Ne pas traiter les liens `INFERRED` comme des faits explicites des documents.
