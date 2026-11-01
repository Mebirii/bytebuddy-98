# ByteBuddy ’98 — duels de dresseurs (V0.11)

## Jouable aujourd'hui

- **VS ordinateur** : tour par tour, adversaire adapté aux statistiques du compagnon.
- **VS deux joueurs sur le même appareil** : le joueur 1 choisit une action, passe la console au joueur 2, puis les actions sont résolues.
- Choix : **Frapper, Parer, Canaliser, Pouvoir**.
- Stats réellement utilisées : PV max, force, défense, vitesse (initiative), précision, endurance (énergie) et esprit (spéciaux).
- Affinités élémentaires et coups critiques.
- 24 manches maximum, puis décision au pourcentage de PV restant.
- Replays déterministes exportables, mais **non probants pour la compétition**.
- Les duels sont **amicaux : aucune monnaie, XP ou victoire classée** n'est attribuée.

## Ce qui n'est PAS encore en ligne

L'application est hébergée sur GitHub Pages (site statique). Il n'existe pas de serveur VS, pas de salons synchronisés, pas d'identité de dresseur liée à un serveur et pas d'arbitre empêchant les manipulations de statistiques. Les codes BBVS1 ne prouvent rien : ils peuvent être fabriqués par un client.

**Ne jamais considérer les résultats locaux comme des victoires multijoueurs officielles.**

## Architecture du véritable VS en ligne

Utiliser un projet backend dédié à ByteBuddy, indépendant de toute autre application, avec :

1. Authentification des dresseurs (éventuellement compte invité convertible).
2. Stockage **serveur** des créatures et statistiques avec historiques de progression.
3. Salons privés de duel (codes d'invitation à durée limitée), invitation, acceptation, abandon.
4. À chaque manche, chaque joueur soumet son action séparément; état « prêt » sans révéler la commande.
5. La manche est **calculée côté serveur** avec version de règles figée, graine interne et journal d'événements.
6. Synchronisation en direct des salons, compte à rebours, reconnexion, limites contre les demandes multiples.
7. Permissions strictes : un joueur ne peut lire que ses salons et n'écrire que ses propres commandes; ni HP ni stats ne sont modifiables par requête client.
8. Résolution des déconnexions et égalités; validation des points de classement seulement côté serveur.
9. Matchmaking d'abord amical/privé, puis équilibrage par statistiques normalisées (caps) et saison de classement.

### Sécurité et déploiement

- **Jamais de clé service_role dans le navigateur**.
- Toutes les tables publiques exposées auront RLS et règles de propriété.
- Fonction de résolution unique côté serveur, transaction atomique avec identifiant de manche pour empêcher double-submit.
- Rate limits et contrôle des données importées.
- Tests d'équilibrage simulés + tests réels avec deux connexions indépendantes.
- Respecter un plafond de coûts validé explicitement avant création du serveur.

Les fichiers \`vs-engine-v011.js\` et \`vs-ui-v011.js\` sont la base **locale** de ces mécaniques; leurs résultats ne sont pas assez fiables pour un classement officiel.

## Ordre de travail prévu

1. Stabiliser l'ergonomie des duels sur téléphone / PC.
2. Étendre le bestiaire et équilibrer les profils.
3. Créer un serveur ByteBuddy dédié après validation de son coût.
4. Connecter les salons, tester les déconnexions et la synchronisation.
5. Puis ajouter la progression classée, les saisons, les tournois et les notifications push.
