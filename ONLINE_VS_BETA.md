# ByteBuddy '98 — V0.12.1 P2P beta

## Jouer depuis deux appareils

1. Chaque joueur ouvre https://mebirii.github.io/bytebuddy-98/?v=0121 sur son propre téléphone ou ordinateur.
2. Chacun possède une créature éclose, éveillée et en état de jouer.
3. Dans **MENU → DUELS → VS EN LIGNE**, l'hôte choisit **CRÉER UN SALON**.
4. Depuis l'écran LCD d'attente, il clique sur **COPIER L'INVITATION** et envoie le lien à son ami.
5. L'invité ouvre ce lien, puis **MENU → DUELS → REJOINDRE**. Le code est automatiquement rempli.
6. Les deux choisissent **FRAPPER, PARER, CANALISER ou POUVOIR**.
7. Quand les deux actions sont reçues, les dégâts et PV se synchronisent. Chacun choisit **MANCHE SUIVANTE**.
8. Le combat se termine par une victoire, une défaite ou une égalité.

### Ce que cette bêta fait

- Duel réellement à distance par canal de données WebRTC.
- Salon privé avec code aléatoire de 14 caractères; pas de recherche publique de salons.
- L'hôte conserve l'état du combat et résout chaque manche avec `vs-engine-v011.js`.
- Les choix ne sont pas révélés à l'autre joueur avant la résolution du tour.
- Affichage commun des PV, de l'énergie et des messages de résultat.
- Pas de récompenses; les sauvegardes locales sont inchangées.

### Limites importantes

- La mise en relation dépend du service PeerJS Cloud partagé et gratuit; l'accès peut échouer ou être indisponible.
- Selon les routeurs et réseaux mobiles, le WebRTC direct peut échouer sans serveur TURN dédié.
- Les deux navigateurs doivent rester ouverts, actifs et connectés. Un rechargement/une déconnexion peut terminer le salon.
- Le service de signalisation et l'adversaire peuvent voir des informations réseau (notamment une adresse IP). Ne partage pas un lien de salon publiquement.
- Les statistiques du profil viennent des clients : **les joueurs peuvent tricher**. Il ne faut donc pas attribuer de points officiels ou de classement à ces parties.
- Ce n'est **pas** encore un système de comptes, matchmaking, classement, tournois ou notifications push.
- Pour les batailles classées et robustes il faudra ensuite un serveur de jeu dédié, un état de créature autoritaire, une identification des joueurs et éventuellement un service TURN.

### Contrôles recommandés avant une version stable

- Deux appareils différents, Wi-Fi puis 4G/5G, Safari iOS et Chrome.
- Host choisit en premier puis guest; ensuite guest en premier puis host.
- Protection des duplications / manque d'énergie.
- Cas de déconnexion, rechargement, erreur d'invitation, refus de joindre une session pleine.
- Capacité du petit écran LCD, accessibilité tactile et navigation à trois boutons.
- Audit du service tiers et politique de confidentialité avant diffusion publique à grande échelle.

## Architecture

Fichiers :
- `vs-engine-v011.js` : règles de combat du prototype.
- `vs-online-v012.js` : transport P2P et affichage LCD.
- `progression-v010.js` : profils et statistiques de combattants.

Le navigateur charge PeerJS 1.5.5 depuis un CDN versionné. Le serveur PeerJS Cloud est utilisé pour le *signaling*; les données de partie passent ensuite par le canal P2P lorsqu'il est disponible.
