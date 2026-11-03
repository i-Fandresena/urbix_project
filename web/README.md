# Laverta — application web

Application Next.js pour **Laverta par Urbix**. Le prototype comprend une landing publique, un formulaire de signalement sans compte, un code de suivi LV, une file de rédaction protégée, la publication d’une correction sourcée et l’effacement du dossier par son code. Il conserve aussi l’espace distinct d’analyse d’image assistée par Gemini.

Lire le [README du projet](../README.md), la [stratégie Laverta](../LAVERTA_STRATEGIE.md), la [spécification produit](../PRODUCT_SPEC.md) et le [brief Claude Code](../CLAUDE.md).

Depuis ce dossier, lancer `npm install`, copier `.env.example` vers `.env.local` si aucun fichier local n’existe, puis démarrer PostgreSQL avec `npm run db:start`. Configurer `DATABASE_URL`, `BETTER_AUTH_SECRET`, `LAVERTA_MEDIA_ENCRYPTION_KEY` et `LAVERTA_EDITOR_EMAILS`, puis lancer `npm run db:migrate` et `npm run dev`. Le SMTP est facultatif en local. Une nouvelle clé Gemini est facultative au lancement et n’active que l’espace d’analyse d’image ; la clé précédemment partagée est compromise et ne doit pas être réutilisée. Les secrets restent dans `web/.env.local`, ignoré par Git.

Le signalement accepte un texte et une image ou un lien. L’image originale est chiffrée AES-256-GCM dans PostgreSQL ; le journaliste autorisé peut la consulter, et le signaleur peut effacer le dossier avec son code LV. Les dossiers expirent après 30 jours ; le serveur actif les purge périodiquement et les routes purgent aussi à l’accès. Sur un hébergement serverless, configurez un ordonnanceur pour garantir la suppression. L’identité du signaleur n’est pas demandée. La protection contre les abus repose sur une limite en mémoire ; une ouverture publique demande un limiteur partagé et une politique d’exploitation adaptés.

Pour ouvrir l’espace de rédaction en local, créez un compte via la page de connexion/inscription avec une adresse présente dans `LAVERTA_EDITOR_EMAILS`. En production, l’adresse doit aussi être vérifiée. Une correction publique exige un verdict humain, une justification, une correction rédigée et au moins une source HTTP(S).

Le nouveau formulaire ne transmet pas les images à Gemini. L’analyse Gemini existante reste une fonction séparée qui requiert une nouvelle clé configurée sous `LAVERTA_GEMINI_API_KEY`. Les propositions IA intégrées à la file, les doublons, les notifications, Messenger, WhatsApp, SMS, USSD, la carte, l’APK et les intégrations Meta restent à développer.
