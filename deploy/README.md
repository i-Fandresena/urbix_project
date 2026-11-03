# Déploiement Laverta sur le VPS

Laverta est déployée directement par Docker Compose sous `/home/laverta`. Aucune ressource Application ou Service n’est créée dans Coolify. Le conteneur web rejoint seulement le réseau Docker `coolify` et expose des labels Traefik ; il ne publie aucun port hôte. PostgreSQL reste sur un réseau privé distinct.

## Déclenchement et garde-fous

- Les pull requests vers `prototype` construisent l’image et exécutent ESLint et `next build`, sans accès SSH ni déploiement.
- Un push dans `prototype` lance le même build sur GitHub Actions, puis un contrôle des ressources et le déploiement. Les pushes ne démarrent pas de build Next.js sur le VPS.
- Le workflow ne garde qu’un déploiement actif à la fois. Le serveur utilise aussi `flock`; il relit `prototype` et refuse une image si son commit n’est plus le dernier de la branche.
- Avant le transfert puis à nouveau avant l’installation, le serveur enregistre mémoire disponible, charge, espace disque, conteneurs actifs et redémarrages dans `/home/laverta/inventory/`. Il bloque si la mémoire disponible tombe sous 2 Gio, l’espace disque sous 15 Gio, le disque atteint 85 % ou la charge dépasse 1,5 par cœur. Les conteneurs déjà en redémarrage sont signalés dans le rapport mais ne bloquent pas seuls.
- Le déploiement sauvegarde PostgreSQL avant les migrations, vérifie la santé HTTP de l’application et revient à la dernière image saine en cas d’échec. Il garde deux images et les sauvegardes des 30 derniers jours. Les migrations doivent rester additives ; une suppression ou un renommage de colonne doit être livré en plusieurs versions.

## Ressources et chemins

- Image Next.js construite avec `output: "standalone"` sur le runner GitHub ; le VPS ne fait que charger l’image, exécuter une migration ponctuelle et démarrer les conteneurs.
- Limites initiales : web 0,75 CPU / 768 Mio ; PostgreSQL 0,5 CPU / 1 Gio ; migrateur 0,5 CPU / 768 Mio. Les logs Docker gardent au plus trois fichiers de 10 Mio par service.
- Sources, Compose, secrets et inventaires : `/home/laverta/`. Données PostgreSQL : `/home/laverta/data/postgres/`. Sauvegardes : `/home/laverta/backups/`.
- Le proxy Traefik existant écoute déjà sur 80/443 ; le Compose de Laverta utilise son réseau `coolify`, ses points d’entrée `http`/`https` et son résolveur `letsencrypt`. Cela évite un conflit de ports sans enregistrer Laverta dans le tableau de bord Coolify.

## API publique

`https://api-laverta.aura-plus.site` route les chemins `/api/*` vers les handlers Next.js de l’application existante. Le site utilise toujours son domaine principal pour l’interface et l’authentification. Les requêtes navigateur cross-origin sont autorisées uniquement depuis `https://laverta.aura-plus.site`, sans partage de cookies ; les intégrations d’autres origines doivent passer par une configuration CORS explicite.

Exemples : `GET /api/health`, `POST /api/reports`, `POST /api/reports/track` et le webhook Meta `/api/messenger/webhook`.

## Secrets

Le fichier `/home/laverta/.env` est réservé à root (`0600`) et n’est jamais suivi par Git. Il contient `POSTGRES_PASSWORD`, `BETTER_AUTH_SECRET`, `LAVERTA_MEDIA_ENCRYPTION_KEY` (32 octets encodés en base64), `BETTER_AUTH_URL`, `BETTER_AUTH_TRUSTED_ORIGINS` et `LAVERTA_EDITOR_EMAILS`. SMTP et les variables Messenger sont facultatifs.

Ne réutilisez pas la clé Gemini précédemment partagée dans la conversation : elle est considérée compromise. `LAVERTA_GEMINI_API_KEY` reste vide jusqu’à la création d’une nouvelle clé. Sauvegardez séparément le fichier de configuration chiffré et la clé média ; perdre cette dernière rend les médias chiffrés irrécupérables.

## Accès GitHub Actions du VPS

- `LAVERTA_DEPLOY_SSH_KEY` est un secret de dépôt. Sa clé publique est autorisée pour l’utilisateur système `laverta-ci` avec une commande forcée ; cette clé ne permet ni shell, ni transfert de port, ni agent forwarding. Elle n’accepte que `inventory` et `deploy:<SHA>`.
- Le VPS possède une autre clé SSH, lecture seule, limitée au clone de `i-Fandresena/urbix_project`. Elle met `/home/laverta/app` à jour sur le commit exact avant le déploiement.
- Le fichier `qualitec-vps.known_hosts` épingle la clé publique SSH du serveur afin que le runner refuse une identité inconnue.

Après le premier déploiement, vérifier `https://laverta.aura-plus.site/api/health`, l’état des conteneurs et le rapport `/home/laverta/inventory/latest.json`. Ne lancez pas `docker system prune` sur ce VPS partagé.
