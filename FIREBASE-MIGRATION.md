# ByteBuddy — migration Supabase vers Firebase

État : **code préparé, pas encore connecté à un projet Firebase**.

L'ancien projet Supabase **ByteBuddy** est en pause. Le jeu reste disponible avec
sa sauvegarde locale `bytebuddy98-save-v1`, **sans changement de clé**.

## Démarrage Firebase (offre Spark gratuite)

1. Connecter le plugin Firebase dans ChatGPT, ou créer un projet Web dans
   https://console.firebase.google.com/.
2. Activer Authentication > Sign-in method > Email/Password, ajouter
   `mebirii.github.io` à **Authorized domains** si nécessaire.
3. Créer Firestore (production), publier **toutes** les règles du fichier
   `firestore.rules` et vérifier qu'elles sont effectives **avant** d'activer
   le client. Déployer avec Firebase CLI si possible.
4. Récupérer **uniquement** `apiKey`, `authDomain`, `projectId`, `appId`
   dans les paramètres de l'application Web. Les copier dans
   `firebase-config.js` (clés publiques de client). Ne jamais mettre de
   clé Admin, `service_role` ou compte de service dans GitHub.
5. Publier et tester un compte, la confirmation d'email, le pseudo, l'envoi,
   la récupération et le conflit entre deux appareils. Vérifier les quotas.

### Données et comptes existants

Les identifiants Supabase ne sont **pas** automatiquement transférés à Firebase.
Les utilisateurs doivent créer un nouveau compte, puis **ENVOYER MA PARTIE**
depuis l'appareil où elle est conservée. Les fichiers JSON exportés peuvent aussi
être réimportés dans ByteBuddy avant l'envoi cloud.

**Ne pas supprimer le projet Supabase** avant une vérification manuelle des données
Auth et de tout autre contenu. Firestore n'est pas une copie automatique de
Supabase. Sauvegardes locales intactes.

### Sécurité

- Firestore documents `trainerProfiles/{uid}` et `trainerSaves/{uid}`.
- Chaque compte ne peut lire et écrire que ses propres documents.
- Email vérifié requis pour les sauvegardes cloud.
- Taille maximale de la sauvegarde : 180 000 caractères ; validation en
  application et dans les règles.
- Écriture transactionnelle avec révision anti-écrasement.
- Sauvegarde de secours locale avant restauration distante.

### Notifications

Les alertes locales restent présentes dans ByteBuddy.
Les notifications push automatiques anciennement hébergées par Supabase
sont temporairement désactivées. Leur migration nécessite un backend
d'envoi planifié distinct (Firebase Cloud Messaging seul ne lance pas
de tâches programmées). Ne pas promettre cette fonctionnalité avant test.
