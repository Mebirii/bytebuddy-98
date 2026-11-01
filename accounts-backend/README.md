# ByteBuddy '98 — comptes de dresseurs V0.13

## État

Le client de comptes est publié dans la console, mais **désactivé par défaut** tant que le backend ByteBuddy dédié n'est pas configuré. Les utilisateurs continuent de jouer avec leurs sauvegardes locales.

**Ne jamais installer ce schéma dans les projets existants d'autres applications.**

## Configuration du nouveau projet dédié

1. Choisir explicitement l'organisation Supabase et confirmer les éventuels frais **avant** la création.
2. Créer un projet Supabase exclusivement pour ByteBuddy.
3. Appliquer \`accounts-backend/schema.sql\` dans la base du nouveau projet.
4. Vérifier que les tables \`public.trainer_profiles\` et \`public.trainer_saves\` sont exposées dans la Data API et que le rôle \`authenticated\` dispose des droits indiqués dans le schéma. L'accès anonyme est révoqué et **RLS est activée**.
5. Dans Auth → URL Configuration :
   - Site URL : \`https://mebirii.github.io/bytebuddy-98/\`
   - Redirect URL : \`https://mebirii.github.io/bytebuddy-98/\`
   Éviter les URL de redirection trop larges.
6. Conserver la confirmation des emails activée, prévoir un SMTP pour la production et vérifier les limites d'envoi.
7. Renseigner **uniquement** l'URL publique et la clé **publishable** dans le fichier public \`trainer-config.js\` :
   \`\`\`js
   window.BYTEBUDDY_ACCOUNT_CONFIG = Object.freeze({
     url: "https://<PROJECT_REF>.supabase.co",
     publishableKey: "<SUPABASE_PUBLISHABLE_KEY>"
   });
   \`\`\`
   La publishable key est destinée au client. **Ne jamais mettre de service_role, secret key ni mot de passe DB dans le dépôt.**
8. Tester le parcours de bout en bout depuis **deux navigateurs indépendants** avant d'annoncer les comptes opérationnels.

## Comportement et protection des sauvegardes

- Les anciennes sauvegardes restent stockées en localStorage sous \`bytebuddy98-save-v1\`.
- Aucune partie n'est importée ou exportée du cloud sans action explicite du joueur.
- Une récupération cloud exige confirmation et crée une copie de sécurité locale sous \`bytebuddy98-save-backup-before-cloud-v013\`.
- Un second bouton permet de restaurer cette copie. Avant de la restaurer, la partie courante est sauvegardée dans \`bytebuddy98-save-backup-before-recovery-v013\`.
- Le cloud utilise un numéro de **révision** et un contrôle d'égalité de révision lors des mises à jour, afin de limiter les pertes de données lorsque plusieurs appareils utilisent un compte.
- Les données stockées sont la partie du joueur; les attributs sont toujours déclarés par le client et ne sont **pas** des statistiques de combat classé validées.
- Le pseudo de dresseur est unique (3–20 caractères, lettres minuscules, chiffres, soulignements, commence par une lettre).
- Les profils sont privés par RLS; la recherche d'amis nécessitera ensuite une API dédiée, explicite et respectueuse de la confidentialité.

## Tests de déploiement obligatoires

1. Sans backend : le menu explique l'indisponibilité, l'élevage et les sauvegardes locales restent fonctionnels.
2. Email de confirmation, inscription, connexion, déconnexion, oubli et changement de mot de passe.
3. Création du pseudo, collision de pseudo, lecture et modification uniquement par le propriétaire.
4. Envoi initial d'une partie, lecture depuis un deuxième appareil, copie avant import, restauration de la copie.
5. Conflit entre deux appareils : le deuxième transfert ne doit jamais écraser silencieusement le premier.
6. Tester les politiques RLS avec deux utilisateurs A et B et le rôle \`anon\` : chacun ne doit jamais pouvoir lire ou modifier la ligne de l'autre.
7. Vérifier les réglages de quota, SMTP, rotation des clés et sauvegarde/retention.

## Étapes futures du multijoueur

- Identité publique du dresseur et recherche d'amis à autorisation explicite.
- Sauvegarde permanente côté serveur de la **progression compétitive** et combat VS résolu côté serveur.
- Invitations entre comptes, matchmaking, classement, saisons, puis tournois.
- Connecter les notifications push au même backend dédié une fois les règles finalisées.

**Important :** les profils et parties enregistrés par les clients ne sont pas dignes de confiance pour déterminer un classement officiel. Il faut un moteur serveur autoritaire et des règles de progression contrôlées côté serveur.
