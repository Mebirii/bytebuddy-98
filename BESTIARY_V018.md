# ByteBuddy '98 V0.18 — 24 formes, quatre nouvelles lignées

La version V0.18 prolonge le bestiaire de 16 à 24 entrées, sans modifier le format de sauvegarde (version 4) ni la clé \`bytebuddy98-save-v1\`.

## Nouvelles lignées

| Rookie | Ultime | Élément | Déblocage au stade bébé | Trait |
|---|---|---|---|---|
| CENDRIX | PYRÉON | Flamme | En orientant l'œuf Flamme ou la branche Flamme ; Force ≥20, Précision ≥16, 2 repas Viande | Brasier précis : précision et critiques |
| RONCIX | BOSQUÉON | Nature | En orientant l'œuf Nature ou la branche Nature ; Défense ≥20, 2 repas Légumes | Carapace végétale : dégâts reçus réduits |
| RÉCIFIN | ABYSSÉON | Eau | En orientant l'œuf Eau ou la branche Eau ; Esprit ≥18, 2 repas Poisson | Marée mentale : pouvoir spécial augmenté |
| FULGIX | FULGORON | Foudre | En orientant l'œuf Foudre ou la branche Foudre ; Vitesse ≥20, Endurance ≥16 | Charge foudroyante : initiative accrue |

Pour évoluer de ces formes Rookie à leur forme Ultime : au moins **24 soins et 3 victoires**, comme les anciennes lignées. Les quatre formes rares préexistantes restent prioritaires si leurs conditions secrètes sont remplies.

L'affinité choisie dans l'œuf ne garantit **pas** automatiquement la forme souhaitée : la spécialisation et les repas sont nécessaires. Sans affinité d'œuf, une nouvelle branche peut être obtenue si sa famille classique domine les scores d'évolution.

## Illustration et bestiaire interactif

- Chaque forme possède une silhouette dessinée uniquement en rectangles, avec la palette monochrome LCD existante. Pas d'image téléchargée ni de dépendance graphique nouvelle.
- Les huit illustrations sont originales et distinctes ; dessin en coordonnées fixes 24×24.
- Les fiches de bestiaire se consultent en touchant ou en sélectionnant les cartes. Pour une forme découverte, elles affichent le portrait, l'élément, son histoire et son talent.
- Les formes encore inconnues donnent un indice sans afficher ni le portrait ni le nom. Les anciennes formes disposent d'indices génériques.
- Les découvertes restent liées à l'historique local et aux sauvegardes cloud existantes.

## Combats

Le moteur PvP amical déterministe applique les mêmes familles et les traits par type de forme. Le joueur n'a pas de classement ou de récompense officielle dans les duels P2P. Les snapshots \`BBVS1\` anciens restent compatibles.

Les quatre traits sont affectés à la forme elle-même, pas à des propriétés libres fournies par le navigateur. Le système reste **amical** : une compétition classée nécessiterait toujours une validation serveur de la progression.

## Validation

- 4 chemins d'obtention Rookie testés, y compris lorsque l'affinité vient du choix d'œuf ;
- 4 évolutions Ultimes vérifiées ;
- 8 snapshots VS acceptés par la validation existante ;
- 8 sprites dessinés dans les limites 24×24 ;
- 200 duels simulés + 200 replays déterministes vérifiés ;
- ouverture d'une fiche cachée sans révéler son portrait ; ouverture d'une fiche découverte avec son portrait et son talent ;
- scripts JavaScript analysés et sauvegarde locale version 4 inchangée.

La qualité visuelle et l'ergonomie tactile doivent encore être testées sur deux vrais téléphones.
