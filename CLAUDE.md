# Contexte Claude Code — Laverta par Urbix

Laverta est le projet Urbix de signalement de rumeurs, vérification journalistique et circulation des corrections à Madagascar. Le nom Hamarino est abandonné. La signature proposée est « La correction doit suivre la rumeur. » La rédaction humaine garde le dernier mot.

## Documents de référence à lire avant une modification produit

1. MEMO_CONTEXTE_HACKATHON.md — faits de la vidéo et standard général de 42 Antananarivo, qui n’est pas le règlement IFM.
2. LAVERTA_STRATEGIE.md — fonctions communiquées par l’équipe, stratégie du PDF fourni, analyse, phases et limites.
3. PRODUCT_SPEC.md — prototype réellement présent, architecture, MVP et exigences.
4. BRAND_GUIDELINES.md — identité et règles UI.
5. README.md et web/README.md — lancement, environnement et limites.

## État du code

L’application se trouve dans web/ : Next.js App Router, TypeScript, Better Auth, PostgreSQL via pg, SDK Google GenAI côté serveur et Sharp. Le MVP inclut une entrée publique sans compte, des codes LV à forte entropie, une image chiffrée AES-256-GCM et effaçable, le suivi par code, une file réservée à LAVERTA_EDITOR_EMAILS, le verdict humain, les sources et la publication d’une correction consultable. La vérification Gemini demeure dans un espace séparé ; le formulaire de signalement ne transfère pas ses images au fournisseur. Le détail des intégrations et limites est dans PRODUCT_SPEC.md. Vérifier le code avant de déclarer une fonction achevée.

## Contraintes impératives

- Next.js utilise `cacheComponents: true`. Garder `app/layout.tsx` statique, sans `cookies()` ni autre donnée de requête ; laisser les pages qui lisent la langue dans une frontière `<Suspense>` avec un fallback statique. Le fournisseur de préférences démarre en FR/clair puis hydrate ses valeurs depuis les cookies côté client.
- Zéro budget pour l’IA : garder Gemini uniquement sur un projet au forfait gratuit sans facturation liée, aucun fournisseur ou fallback payant. Revérifier les quotas actuels avant une démo ; si la limite est atteinte, informer l’utilisateur et attendre.
- Une clé Gemini a été collée dans une conversation et est compromise. Ne jamais la réutiliser ni la copier dans Git, les documents de contexte, un ticket, un prompt à Claude ou un APK. Seule une clé neuve, saisie par l’équipe localement dans web/.env.local, peut être utilisée. Le fichier doit rester ignoré par Git.
- DATABASE_URL, BETTER_AUTH_SECRET, SMTP et la clé Gemini restent côté serveur. Better Auth valide chaque session privée côté serveur ; le proxy n’est qu’une redirection optimiste.
- La page `/connexion` capture les erreurs pendant la validation de session PostgreSQL, affiche un message localisé et désactive les actions d’authentification jusqu’au retour de la base. Ne jamais afficher les identifiants ni le message brut de connexion au navigateur.
- Les conditions de l’offre gratuite Gemini peuvent autoriser l’usage des prompts/réponses pour l’amélioration des produits. Ne pas transmettre de dossiers sensibles ou confidentiels avant validation de la politique applicable et consentement approprié. Conserver store: false lorsque l’API utilisée le permet.
- Ne jamais présenter une réponse Gemini, une source inventée, une maquette ou un jeu d’exercice comme une vérification réelle. L’IA aide à trier, extraire et préparer ; le journaliste choisit le statut et valide toute correction.
- Masquer l’identité des signaleurs par défaut. Ne pas promettre un anonymat absolu sans avoir revu journaux serveur, métadonnées, prestataires et modèle de conservation.
- Les médias de signalement sont stockés sans réencodage dans PostgreSQL et chiffrés avec LAVERTA_MEDIA_ENCRYPTION_KEY ; garder cette clé hors Git et ne pas la changer sans migration de chiffrement. La rédaction autorisée peut voir les métadonnées originales, dont EXIF/localisation. La rétention est de 30 jours et l’effacement via le code supprime aussi l’audit. Le traitement Gemini séparé réencode l’image et retire les EXIF.
- Respecter les API officielles, les autorisations et les coûts. Meta, WhatsApp, SMS/USSD, recherche inversée et services de transcription peuvent exiger approbation, partenaire ou paiement ; pas d’intégration non vérifiée.
- Les chaînes malgaches doivent être relues par un locuteur natif. Ne pas auto-publier une traduction IA.
- Garder l’interface éditoriale, accessible et responsive, selon BRAND_GUIDELINES.md : encre/papier/bleu signal, Plus Jakarta Sans, Bebas Neue pour les grands titres, pas de dégradé bleu-violet, verre ou halo décoratif. Le cyan sert d’accent de marque et de provenance ; pas d’étoiles IA, faux score ou verdict fondé sur la couleur.
- L’interface utilise désormais Motion for React (anciennement Framer Motion, import `motion/react`) et `lottie-react`. Garder les transitions courtes, le Lottie de signal joué une fois, respecter prefers-reduced-motion, clavier et lecteurs d’écran. Exception visuelle : le canvas cartographique du hero fait un tour complet en partant et revenant sur Madagascar, puis marque une courte pause ; deux satellites décoratifs orbitent et les lumières changent de couleur. Toute l’animation s’arrête hors écran et reste fixe avec prefers-reduced-motion. Ne pas ajouter d’autre mouvement continu ni scroll hijacking.
- L’interface est disponible en français, malgache et anglais ; le français et le thème clair sont les valeurs par défaut. Le contrôle de préférences est global et conserve les choix. Les textes malgaches sont provisoires et doivent être relus par un locuteur natif.
- L’accueil `/` reprend la composition centrée et le héros sombre de la capture godseyeview.ai, puis l’ordre de ses sections (confiance, fonctionnalités, accès, partage, transparence, espaces, FAQ et appel final) avec les parcours et contenus propres au prototype. L’ancienne landing claire reste sur `/landing-editoriale`. Omettre les vidéos YouTube et ne jamais importer les preuves sociales, chiffres, logo, cartes, captures, données ou assets tiers de la référence. La licence MIT du dépôt God’s Eye View concerne le code source, pas automatiquement ses assets tiers.
- Pour le branding Laverta, utiliser les sources d’équipe `DA/logo.jpeg` et `DA/mascot.jpeg`, avec leurs variantes web optimisées dans `web/public/brand/`. Ne pas réintroduire l’ancien pictogramme. La mascotte est décorative et ne doit jamais suggérer un verdict ou une vérification automatique.
- Le dossier local `God's_Eye/` contient l’application Vue/Cesium, pas le site marketing godseyeview.ai. Le hero d’accueil Laverta est une adaptation visuelle originale du site public et de la capture, sans transfert du code ou des assets du clone. Exception : les frontières pays sont issues du pack Natural Earth fourni dans le dépôt local ; la source publique et les conditions sont documentées dans `web/public/geo/README.md`. Les satellites et lumières sont illustratifs, jamais des données live.

## Priorité produit

Le MVP signalement → code LV → file éditoriale → verdict sourcé → correction consultable est implémenté. Prochaine priorité : ajouter des propositions IA modifiables dans la fiche sans en faire un verdict, après création d’une nouvelle clé Gemini gratuite et validation des conditions de partage. Les modules externes peuvent rester maquettes conceptuelles et doivent être explicitement étiquetés.

Avant une nouvelle table, analyser les rôles, accès, consentements, suppression, exposition de données et journal d’audit. Ne pas ouvrir publiquement les signalements sans protection contre les abus du code de suivi et validation de la politique de rétention.

## Travail Claude Code demandé par l’équipe

Claude Code intervient pour la revue sécurité, l’accessibilité des animations déjà intégrées et les corrections UX réellement observées. Examiner les routes et dépendances avant de modifier ; rapporter les risques résiduels. N’affirmer qu’une vulnérabilité est corrigée qu’après une vérification compatible. Ne pas utiliser npm audit fix --force. Ne jamais appeler Gemini avec la clé compromise.

Pour une modification d’architecture, mettre à jour PRODUCT_SPEC.md, LAVERTA_STRATEGIE.md si le périmètre change, et README(s) si le lancement ou l’état produit change. Rafraîchir Graphify après les modifications de sources conformément à AGENTS.md. Ne pas déployer ni publier au nom de l’équipe sans une demande explicite distincte.
