# Panneau Havo

Sources TypeScript/Lit dans `src/`, bundle autonome distribué dans `custom_components/havo/frontend/`. Utiliser Node.js 24 : `npm ci`, `npm run check`, `npm test`, `npm run build`.

Navigation par pièces et sous-vues compactes, thème Home Assistant, droits serveur, anglais/français. Les champs de vitesse sont conditionnés à SET_SPEED. Le composant de sélection d’entités est adapté de Halo ; aucun composant privé Home Assistant n’est importé. L’action publique `hass-action` ouvre la fenêtre native.

API WebSocket : `havo/get`, `havo/subscribe`, `havo/save` (config et révision) et `havo/command` (vent_id, command, valeur éventuelle). Commandes : turn_on, turn_off, set_percentage, automation, resume. Les erreurs utilisent des codes traduits. Le serveur filtre les lectures et valide les droits.

Le brouillon conserve les saisies entre les vues, refuse les valeurs invalides et détecte les révisions concurrentes. La sauvegarde acquitte les données envoyées sans perdre les saisies suivantes. Les tests DOM couvrent ces parcours et les différences entre appareils ; ils utilisent une connexion simulée.

`dev.html` est un aperçu avec données fictives, distinct d’un essai dans Home Assistant. Après le build, servir la racine du dépôt sur une adresse locale et ouvrir `/frontend/dev.html`.
