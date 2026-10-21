# Havo

[English](../README.md)

**Gestion des ventilations de la maison, adaptée aux capacités de chaque appareil.**

Havo pilote les entités `fan` existantes depuis un panneau intégré à Home Assistant : température pour les ventilateurs de confort, extraction adaptative d’humidité pour les pièces ventilées. Havo fait partie de Haxo avec [Halo](https://github.com/Gnol86/Halo), dédié aux lumières. Les deux intégrations sont indépendantes.

## Fonctionnalités

- Installation unique, pièces Home Assistant et règles propres à chaque ventilateur.
- Détection du marche/arrêt et des vitesses réglables à partir des capacités de l’entité. Des modes prédéfinis seuls ne constituent pas des vitesses.
- Ventilation de fond facultative sur les appareils modulables, avec adaptation aux paliers disponibles.
- Modes température et humidité, hystérésis, durées minimales et pause manuelle.
- Capteurs extérieurs prioritaires sur la météo et fonctionnement dégradé explicite si des mesures manquent.
- Panneau adaptatif suivant le thème Home Assistant, en anglais et français.
- Interrupteur d’automatisation, bouton de reprise et capteur d’état par ventilation.
- Entrées dans l’activité native identifiant Havo, la commande demandée et son motif.
- Stockage validé et versionné, configuration administrateur et droits de commande vérifiés côté serveur.

## Installation

**Home Assistant 2026.10.0 ou ultérieur** est nécessaire. Les ventilateurs et capteurs doivent déjà être intégrés à Home Assistant ; Havo ne se connecte pas directement aux fabricants.

1. Dans HACS, ouvre **Dépôts personnalisés**, ajoute `https://github.com/Gnol86/Havo` et sélectionne **Intégration**.
2. Télécharge Havo et redémarre Home Assistant.
3. Ajoute **Havo** dans **Paramètres → Appareils et services → Ajouter une intégration**.
4. Ouvre **Havo** dans la barre latérale. Aucun YAML ni carte séparée n’est nécessaire.

Installation manuelle : copie `custom_components/havo` dans le dossier `custom_components` de Home Assistant, redémarre puis ajoute l’intégration.

La version **0.2.0** ajoute un délai facultatif d’extraction sous le seuil de démarrage en humidité. Consulte les [notes de version](../releases/0.2.0.md). Utilise la release publiée depuis le dépôt personnalisé HACS ; le référencement au catalogue HACS et l’installation domestique sont des étapes distinctes.

## Premiers réglages

1. Dans **Réglages généraux**, sélectionne éventuellement une météo et des capteurs extérieurs de température et d’humidité. Chaque capteur dédié valide est prioritaire sur l’attribut météo correspondant.
2. Choisis une pièce et ajoute un ventilateur. Les appareils déjà gérés ailleurs sont exclus ; le sélecteur peut inclure ceux des autres pièces.
3. Dans **Automatisation**, sélectionne les capteurs de la pièce et le mode de chaque ventilation.
4. Ajuste les seuils et durées, active l’automatisation puis enregistre. **Une nouvelle ventilation commence avec l’automatisation désactivée.**

Le **Pilotage** affiche l’état réel, la raison, les mesures, les seuils courants, les sources et la fin de pause. Les commandes manuelles suspendent l’automatisation ; **Reprendre l’automatisation** permet une reprise immédiate. La fenêtre native Home Assistant donne accès aux modes prédéfinis et autres fonctions propres à l’appareil.

Le brouillon est conservé entre les vues. Les champs invalides bloquent navigation et sauvegarde, les modifications concurrentes signalent un conflit et les saisies effectuées pendant une sauvegarde lente sont préservées. Les commandes physiques sont désactivées tant qu’un brouillon existe pour éviter d’agir sur une affectation non enregistrée.

## Capacités matérielles

| Capacité de l’entité | Comportement |
| --- | --- |
| `TURN_ON` / `TURN_OFF` | Commandes marche/arrêt prises en charge, sans pourcentage |
| `SET_SPEED` | Pourcentage, modulation automatique et fond facultatif |
| Modes prédéfinis sans `SET_SPEED` | Marche/arrêt ; aucune interprétation des modes comme vitesses |
| Entité indisponible | Aucune commande ; état indisponible explicite |

Les capacités sont revérifiées pendant le fonctionnement. Un appareil simple n’affiche ni champ ni curseur de vitesse. Une perte de prise en charge conserve les paramètres et suspend le pilotage de fond configuré. Limites et cibles sont normalisées aux paliers disponibles ; la cible effective est affichée. Sur un appareil à peu de paliers, fond et minimum actif peuvent correspondre à la même vitesse.

## Mode température

Valeurs initiales : démarrage **25 °C**, repos **24 °C**, vitesse maximale **30 °C**. Un appareil modulable suit une progression linéaire entre ses vitesses active minimale et maximale. Un appareil simple utilise seulement les seuils de marche et d’arrêt. L’extérieur ne bloque pas ce mode de brassage intérieur.

Les capteurs peuvent exprimer leurs températures en °C, °F ou K. Les réglages et mesures calculées du panneau utilisent les °C.

## Confort d’humidité

Valeurs initiales : référence **75 %**, hystérésis **5 points**, demande maximale **85 %**. Avec l’adaptation extérieure, le démarrage se situe entre **70 et 75 %** et le retour au repos entre **65 et 70 %**. Sans données extérieures, les seuils sont de **75 % / 70 %**. L’humidité extérieure est ramenée à la température intérieure avant comparaison.

Ces seuils initiaux ciblent les pics d’humidité dans les pièces dont le niveau de fond peut rester vers 64–69 %, afin que l’extraction puisse s’arrêter après un pic. Ce sont des seuils de commande, pas une plage d’humidité intérieure permanente recommandée ni une garantie que la ventilation pourra les atteindre. Adapte-les à chaque pièce. Les réglages déjà enregistrés sont conservés ; changer les valeurs par défaut ne met pas à jour les ventilateurs configurés.

```text
es(T) = 6,11 × 10^(7,5 × T / (237,3 + T))
Hext_equivalente = Hext × es(Text) / es(Tint)
D = borne((Hint - Hext_equivalente) / 20, 0, 1)
F = borne(1 - max(0, Tint - Text - 10) / 20, 0, 1)
démarrage = référence_humidité - 5 × D × F
repos = démarrage - hystérésis_humidité
```

Températures en °C, humidités en pourcentage. Le calcul autorise jusqu’à cinq points d’anticipation lorsque l’extérieur favorise l’assèchement ; un grand écart thermique modère cette anticipation. **L’extraction reste prioritaire à partir de la référence, même si l’air extérieur est humide.** La durée minimale de repos et une pause manuelle restent prioritaires.

Un appareil modulable progresse du minimum actif au maximum entre le seuil courant et la demande maximale. Un appareil marche/arrêt utilise les mêmes décisions adaptatives.

La conversion de pression de vapeur suit la [formule du National Weather Service](https://www.weather.gov/media/epz/wxcalc/vaporPressure.pdf). L’anticipation et la modération thermique sont des heuristiques de Havo, pas un modèle de condensation du bâtiment. La météo ne mesure pas l’air de remplacement arrivant réellement dans la pièce : efficacité et réglages doivent être vérifiés dans chaque logement.

## Durées, données manquantes et intervention manuelle

| Réglage | Valeur initiale |
| --- | --- |
| Marche minimale | 5 minutes |
| Repos minimal | 2 minutes |
| Délai sous le seuil de démarrage en humidité | Désactivé par ventilation ; 3 heures proposées à l’activation |
| Pause manuelle | 1 heure |
| Vitesse de fond | Désactivée ; 20 % proposés à l’activation |
| Plage active | 40–100 %, adaptée aux paliers |

Le moteur réagit aux mesures, recalcule toutes les 30 secondes et se réveille aux échéances. Il continue lorsque le panneau est fermé. La configuration, le besoin actif, les dates de transition et les pauses persistent au redémarrage.

Dans l’onglet **Automatisation** de chaque ventilation, le mode humidité propose un **délai sous le seuil de démarrage**, réglable de 1 à 1 440 minutes (initialement 180 minutes / 3 heures). L’option est désactivée pour les ventilations nouvelles et existantes. La désactivation conserve la durée choisie. Le compteur commence pendant l’extraction automatique active lorsque l’humidité est strictement entre les seuils calculés de repos et de démarrage. Atteindre le seuil de démarrage remet le compteur à zéro ; atteindre le seuil de repos conserve l’arrêt normal. À l’échéance, Havo revient au repos (arrêt ou vitesse de fond configurée pour les appareils modulables), en respectant la marche minimale. Le panneau affiche le décompte séparément ; l’état et l’Activité expliquent ce retour au repos.

Après ce retour au repos, une remontée au seuil calculé de démarrage peut relancer l’extraction, en respectant le repos minimal. Cette option limite la prolongation de l’extraction sous le seuil de démarrage ; elle ne détecte pas un plateau d’humidité et n’empêche pas un rebond rapide. Elle n’agit pas en mode température. Un compteur valide persiste lors d’un rechargement/redémarrage et d’une modification sans rapport. Une intervention manuelle, l’automatisation désactivée, un ventilateur ou une mesure principale indisponible, ou une modification des règles d’humidité/sources remettent le compteur à zéro ; une mesure manquante n’est jamais assimilée à une humidité stable.

En mode humidité, l’absence de données extérieures ou de température intérieure fait revenir aux seuils fixes. Sans mesure principale — température en mode température, humidité en mode humidité — les décisions sont suspendues et l’état matériel conservé. Valeurs et unités invalides sont rejetées.

Un changement externe de marche, de vitesse ou de mode prédéfini suspend uniquement la ventilation concernée. Havo reconnaît ses contextes de commande et utilise une courte fenêtre d’acquittement correspondant à la cible pour les intégrations qui perdent ce contexte. Les commandes manuelles priment sur les durées automatiques minimales. Désactiver l’automatisation, supprimer une ventilation ou décharger Havo conserve l’état matériel.

## Activité des commandes

Ouvre l’**Activité** native d’une ventilation pour retrouver par exemple **Havo : mise en marche demandée — extraction d’humidité** ou **Havo : vitesse de 33 % demandée — ventilation de fond**. Un appareil marche/arrêt ne reçoit jamais de pourcentage ; les entrées de vitesse indiquent la cible réellement envoyée après adaptation aux paliers de l’appareil.

Le motif provient du moteur au moment de la commande : refroidissement, extraction d’humidité, ventilation de fond, retour au repos, délai sous le seuil de démarrage en humidité, durée minimale de marche/repos ou commande manuelle dans Havo. Un recalcul sans commande et une intervention externe ne créent pas d’entrée de commande Havo. Un appel en échec ou expiré ajoute une erreur explicite ; une demande ne prouve jamais le changement d’état physique de l’appareil.

Havo fournit un événement d’origine et une entrée standard associée à la ventilation. Le détail natif peut attribuer le changement d’état à **Havo — motif** si l’intégration de l’appareil conserve le contexte de commande. Si elle le perd, la demande Havo reste dans l’activité du ventilateur, mais le lien avec le changement physique ne peut pas être établi de façon fiable. Les ajustements de vitesse restent visibles même si Home Assistant n’affiche pas de transition d’état distincte. Le journal global non filtré peut afficher à la fois l’origine et l’entrée de demande.

[Activity/Logbook](https://www.home-assistant.io/integrations/logbook/) et Recorder doivent être activés, et leurs filtres doivent inclure la ventilation et les événements Havo. L’ancien historique n’est pas complété. Les messages utilisent la langue configurée sur le serveur Home Assistant — anglais ou français, variantes régionales comprises — indépendamment de la langue de chaque lecteur. Les noms personnalisés des entités sont conservés.

## Développement et validation

Python 3.14 et Node.js 24 :

```sh
uv sync --frozen
uv run --frozen ruff check .
uv run --frozen ruff format --check .
uv run --frozen pytest
npm ci
npm run check
npm test
npm run build
```

Le panneau et sa licence Lit sont embarqués, sans CDN. La CI vérifie Python, TypeScript, le panneau, la reproductibilité du bundle, Hassfest et HACS. Le workflow de release contrôle le tag, le manifeste, les versions du projet/verrou et les notes avant publication.

Les essais utilisent des appareils simulés et ne prouvent pas le comportement ou la calibration du matériel du logement. Voir le [guide du panneau](../frontend/README.md) et les [notes de version](../releases/0.2.0.md).

## Licence

MIT. La licence du runtime Lit embarqué est conservée. Havo est une intégration personnalisée indépendante, pas un produit officiel Home Assistant.
