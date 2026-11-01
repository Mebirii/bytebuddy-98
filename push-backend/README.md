# ByteBuddy Web Push — V0.14 (Supabase)

## Déploiement actuel

Projet dédié : **ByteBuddy** — \`tqgnarnuohglfxrbxroi\` (eu-west-3).

Fonction : \`bytebuddy-push\`, déployée à
\`https://tqgnarnuohglfxrbxroi.supabase.co/functions/v1/bytebuddy-push\`.

Un seul abonnement par installation et uniquement après une action volontaire.

### Fonctionnement

- La clé VAPID est générée à la première requête du serveur, puis **conservée uniquement en base de données** dans \`public.bytebuddy_push_settings\` (RLS activée, aucun accès \`anon\` ou \`authenticated\`).
- La clé privée et le jeton de cron ne doivent jamais apparaître dans un fichier Git ou dans le navigateur.
- Les abonnements sont stockés dans \`public.bytebuddy_push_devices\` ; les opérations serveur utilisent le rôle \`service_role\` du runtime Edge, jamais celui du navigateur.
- La fonction refuse les requêtes de navigateur hors origine \`https://mebirii.github.io\` et exige un secret individuel aléatoire pour les appareils.
- Supabase \`pg_cron\` et \`pg_net\` appellent \`/tick\` toutes les **15 minutes**, avec un secret lu côté base.
- Les pushes de besoins sont limités à **3 par jour**, au moins **4 heures** entre les alertes et un silence entre **22 h et 8 h**, heure de Paris.
- Les appareils qui n'ont pas synchronisé leur état depuis 24 h ne reçoivent plus d'alerte de besoins, jusqu'au retour du joueur.

### Tests effectués sur la plateforme

- \`GET /public-key\` : réponse HTTP 200, \`ready:true\`, clé VAPID publique fournie.
- \`POST /tick\` autorisé depuis le cron secret : HTTP 200, résultat JSON valide.
- Tentative d'inscription invalide : HTTP 400, aucun appareil ajouté.
- Planification cron active, contrôlée via \`cron.job\`.
- Les tables ont RLS active et les permissions de lecture publiques désactivées.

### Test manuel indispensable

1. Depuis un ordinateur compatible, ouvrir \`https://mebirii.github.io/bytebuddy-98/\`, puis **SON & ALERTES → ACTIVER LES PUSH**.
2. Accepter l'autorisation du navigateur, puis **TEST NOTIFICATION PUSH**.
3. Fermer le site et vérifier la réception d'une notification de test. Le service push fonctionne côté serveur même si le jeu est fermé.
4. Sur iPhone : iOS 16.4 ou supérieur, ouvrir Safari, **Partager → Sur l'écran d'accueil**, ouvrir ByteBuddy depuis cette icône, puis autoriser les notifications et effectuer le test.
5. Vérifier les cas de désinscription, changement d'appareil, réseau mobile, autorisations refusées.

### Limites

Les notifications de faim ou fatigue projetent la dernière situation sauvegardée quand le jeu est fermé : elles sont estimatives, pas un accès direct à l'état du jeu. La fonction doit éviter de multiplier les notifications. Les délais et quotas du service Push dépendent aussi du navigateur et du système.

Le serveur est actif, mais le bon fonctionnement de l'affichage sur chaque téléphone **ne peut pas être garanti sans test réel de l'appareil**.
