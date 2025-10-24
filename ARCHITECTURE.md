# Jojodle - Architecture du Projet

## 📁 Structure du Projet

```
Jojodle/
├── public/                      # Assets publics
│   └── assets/
│       └── jjba/               # Assets JoJo's Bizarre Adventure
│           ├── characters.json  # Données des personnages
│           ├── stands.json      # Données des Stands
│           └── img/            # Images
│
├── scripts/                     # Scripts utilitaires
│   └── scrapers/               # Scripts de scraping
│       ├── scrape_jjba_characters.js
│       ├── scrape_stands.js
│       └── scraper-utils.js
│
└── src/                        # Code source de l'application
    ├── constants/              # Constantes globales
    │   ├── gameConfig.js       # Configuration du jeu (MAX_ATTEMPTS, ROUTES, etc.)
    │   └── index.js
    │
    ├── features/               # Features de l'application (architecture modulaire)
    │   ├── character-game/     # Jeu de devinette de personnage
    │   │   ├── CharacterGame.jsx
    │   │   ├── CharacterCard.jsx
    │   │   ├── CharacterAutocomplete.jsx
    │   │   ├── CharacterGame.css
    │   │   └── index.js
    │   │
    │   ├── stand-game/         # Jeu de devinette de Stand
    │   │   ├── StandGame.jsx
    │   │   ├── StandCard.jsx
    │   │   ├── StandAutocomplete.jsx
    │   │   ├── StandGame.css
    │   │   └── index.js
    │   │
    │   └── home/               # Page d'accueil
    │       ├── Home.jsx
    │       ├── MenacingTexts.jsx
    │       └── index.js
    │
    ├── hooks/                  # Hooks React personnalisés
    │   ├── useFetchData.js     # Hooks pour charger les données
    │   ├── useGameLogic.js     # Hook pour la logique du jeu
    │   └── index.js
    │
    ├── models/                 # Modèles de données
    │   ├── Character.js        # Modèle Character
    │   ├── Stand.js            # Modèle Stand
    │   └── index.js
    │
    ├── services/               # Services (API, data fetching)
    │   ├── dataService.js      # Service de chargement des données
    │   └── index.js
    │
    ├── shared/                 # Composants et utilitaires partagés
    │   └── components/         # Composants réutilisables
    │       ├── Success/        # Composant de succès
    │       ├── Failure/        # Composant d'échec
    │       ├── GameClues/      # Composant d'indices
    │       ├── StandShape/     # Composant silhouette de Stand
    │       └── index.js
    │
    ├── utils/                  # Fonctions utilitaires
    │
    ├── App.jsx                 # Composant racine
    ├── App.css                 # Styles globaux
    ├── main.jsx                # Point d'entrée
    └── index.css               # Styles de base
```

## 🏗️ Principes d'Architecture

### 1. **Feature-Based Architecture**
- Chaque feature (character-game, stand-game, home) est autonome
- Contient ses propres composants, styles et logique
- Facilite la maintenance et l'évolution

### 2. **Separation of Concerns**
- **Features** : Fonctionnalités métier
- **Shared** : Composants réutilisables
- **Services** : Logique de chargement de données
- **Hooks** : Logique React réutilisable
- **Models** : Structures de données
- **Constants** : Configuration centralisée

### 3. **DRY (Don't Repeat Yourself)**
- Hook `useGameLogic` réutilisé pour les deux jeux
- Service `dataService` centralisé
- Composants partagés (Success, Failure, GameClues)

### 4. **Single Responsibility**
- Chaque fichier a une responsabilité unique
- Composants focalisés sur l'UI
- Hooks focalisés sur la logique
- Services focalisés sur les données

## 🔧 Composants Clés

### Hooks

#### `useGameLogic(items)`
Hook personnalisé qui gère toute la logique du jeu :
- Sélection d'un item aléatoire
- Gestion des tentatives
- Détection de victoire/défaite
- Réinitialisation du jeu

```javascript
const {
    selectedItems,
    availableItems,
    randomItem,
    attempts,
    winner,
    loser,
    handleSelect,
    handleReset,
    attemptsLeft,
} = useGameLogic(characters);
```

#### `useFetchCharacters()` / `useFetchStands()`
Hooks pour charger les données :
```javascript
const { characters, loading, error } = useFetchCharacters();
```

### Services

#### `dataService`
Service centralisé pour le chargement de données :
- `fetchCharacters()` - Charge les personnages
- `fetchStands()` - Charge les Stands
- `fetchData(url)` - Méthode générique

### Constants

Centralise toute la configuration :
```javascript
export const GAME_CONFIG = { MAX_ATTEMPTS: 20 };
export const ROUTES = { HOME: '/', CLASSIC: '/classic', ... };
export const ASSETS_PATHS = { LOGO: '/assets/jjba/assets/logo.png', ... };
```

## 📦 Modules d'Export

Chaque dossier expose un fichier `index.js` pour simplifier les imports :

```javascript
// ✅ Bon
import { CharacterGame } from './features/character-game';
import { useGameLogic } from './hooks';

// ❌ Éviter
import CharacterGame from './features/character-game/CharacterGame.jsx';
import useGameLogic from './hooks/useGameLogic.js';
```

## 🚀 Commandes

```bash
# Développement
npm run dev

# Build production
npm run build

# Scraping
npm run scrape:characters  # Scrape les personnages
npm run scrape:stands      # Scrape les Stands
npm run scrape:all         # Scrape tout
```

## 🎯 Avantages de cette Architecture

1. **Scalabilité** : Facile d'ajouter de nouvelles features
2. **Maintenabilité** : Code organisé et prévisible
3. **Réutilisabilité** : Hooks et composants partagés
4. **Testabilité** : Logique séparée de l'UI
5. **Lisibilité** : Structure claire et cohérente
6. **Performance** : Hooks optimisés avec `useCallback` et `useMemo`

## 🔄 Migration depuis l'Ancienne Architecture

### Avant
```
src/
├── components/
│   ├── views/
│   │   ├── Home.jsx
│   │   └── mods/
│   │       ├── classic/Classic.jsx
│   │       └── stand/Stand.jsx
│   ├── character/
│   ├── stand/
│   ├── success/
│   └── failure/
└── scripts/
```

### Après
- `components/views/mods/classic/` → `features/character-game/`
- `components/views/mods/stand/` → `features/stand-game/`
- `components/views/Home.jsx` → `features/home/Home.jsx`
- `components/success/` → `shared/components/Success/`
- `scripts/*.model.js` → `models/`
- Logique extraite dans `hooks/` et `services/`

## 📝 Bonnes Pratiques

1. **Imports** : Toujours utiliser les barrel exports (`index.js`)
2. **Naming** : PascalCase pour composants, camelCase pour fonctions
3. **Documentation** : Commenter les fonctions complexes
4. **Constants** : Pas de magic numbers, utiliser les constantes
5. **Hooks** : Préfixer avec `use` (convention React)
6. **Types** : Considérer TypeScript pour les types stricts

## 🎨 Styles

- CSS modules par feature
- Styles partagés dans les composants shared
- Tailwind-like classes utilitaires

## 🔮 Évolutions Futures

- [ ] Ajouter TypeScript
- [ ] Implémenter des tests (Jest, React Testing Library)
- [ ] Ajouter un système de routing plus avancé
- [ ] Implémenter un state management (Context API ou Zustand)
- [ ] Ajouter un mode dark/light
- [ ] Progressive Web App (PWA)
