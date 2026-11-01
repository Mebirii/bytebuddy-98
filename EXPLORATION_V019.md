# ByteBuddy '98 — V0.19.1 Exploration GPS

## Principe

Le joueur ouvre **MENU → EXPLORER**, appuie sur **DÉMARRER LE GPS**, accepte la permission de son navigateur et marche en gardant ByteBuddy au premier plan.

Ce mode n'est **pas** un podomètre natif : il estime des mètres parcourus à partir des positions géographiques reçues par \`navigator.geolocation.watchPosition\`. Les erreurs GPS et les limitations des navigateurs rendent les distances approximatives. Aucun nombre de pas exact n'est affiché ou inventé.

- Tous les 300 m validés : un coffre, dans la limite de 6 coffres par jour.
- À 1200 m validés dans la journée : un œuf d'exploration (1 par jour) rejoint l'incubateur, si une place est disponible.
- Les coffres contiennent un objet de soin, de moral, d'énergie ou des fragments échangeables contre +8 Bits.
- Si l'incubateur contient déjà 3 œufs, l'exploration donne des baies à la place.
- Les objets sont conservés dans \`state.exploration.items\` et utilisables depuis le menu Exploration.
- Les distances et récompenses quotidiennes sont conservées dans le même format de sauvegarde version 4 que les anciennes versions, localement et lors des exportations cloud.
- Nouvelle génération et activation d'un œuf : progression et inventaire sont conservés, mais une exploration active est arrêtée.

## Vie privée / sécurité

- **Jamais d'activation automatique du GPS** au chargement, à la connexion, ni lors de la sauvegarde.
- Permission demandée uniquement après le clic utilisateur. Le navigateur contrôle la permission.
- Les positions sont utilisées uniquement en mémoire, pour calculer une distance entre deux mesures. Les latitude/longitude, traces, horaires et points GPS ne sont **pas** sauvegardés, synchronisés ni envoyés au serveur.
- La surveillance \`watchPosition\` est supprimée via \`clearWatch\` dès le clic ARRÊTER, le passage en arrière-plan, la fermeture de page, la mise en attente d'un œuf ou une erreur GPS.
- Mesure ignorée si précision GPS supérieure à 35 m, donnée trop ancienne, déplacement trop court, vitesse incompatible avec la marche (>3,2 m/s) ou saut GPS manifestement trop rapide. Les imprécisions restent possibles.
- Les récompenses GPS sont de simples récompenses d'élevage **non compétitives** côté client. L'API client ne constitue pas une preuve fiable pour un éventuel classement public.
- Pas de carte de position réelle, pas de lieux imposés, pas de partage social de trajectoire.
- Pas d'incitation à regarder ou manipuler le téléphone en traversant une route. Choisir un itinéraire sûr.

## Limites web iPhone / Android

Sur iOS, une PWA / Safari ne fournit pas la même capacité qu'une application native utilisant Core Location et HealthKit. Le suivi peut être suspendu lorsque l'écran est verrouillé ou l'application en arrière-plan. ByteBuddy s'arrête explicitement dès que la page devient masquée. Pour une marche continue téléphone en poche, une version native (ou un pont natif convenablement autorisé) sera nécessaire.

Le GPS n'est pas un compte-pas et ne distingue pas parfaitement la marche de tous les autres déplacements. Un podomètre natif à autorisation explicite et synchronisation agrégée serait une future amélioration, mais ne doit pas être simulé avec des données GPS.

## Contrôles à effectuer sur appareil réel

1. Sur iPhone et Android : appuyer sur DÉMARRER et autoriser l'emplacement, puis vérifier le statut.
2. Marcher à l'extérieur sur un parcours de référence, vérifier le rafraîchissement et l'apparition des récompenses.
3. Verrouiller l'écran / quitter l'app : vérifier l'arrêt du GPS et la conservation du compteur.
4. Tester refus de permission, signal insuffisant, mode avion et changement de réseau.
5. Vérifier qu'un œuf rejoint bien le laboratoire, qu'un incubateur plein ne reçoit pas de quatrième œuf et qu'une nouvelle génération conserve l'inventaire.
6. Vérifier qu'aucun champ de coordonnées ou trajet ne figure dans la sauvegarde locale ou cloud.
7. Tester la lisibilité et les actions de l'inventaire dans la console LCD sur petit écran.

## Tests de logique déjà effectués

Avec un fournisseur GPS simulé : lancement volontaire, déplacement simulé de 1650 m à vitesse de marche, 5 coffres, 1 œuf en incubateur, utilisation d'un objet, refus d'une position à vitesse véhicule, absence de coordonnées dans l'état sauvegardé, arrêt du suivi lorsque la page est masquée.

Aucun test de permission ou de déplacement en conditions réelles n'a été effectué dans le simulateur.
