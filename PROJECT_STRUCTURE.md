# Structure Visuelle du Projet Jojodle

## 🌳 Arborescence Complète

```
Jojodle/
│
├── 📄 package.json                 # Dépendances et scripts
├── 📄 vite.config.js               # Configuration Vite
├── 📄 eslint.config.js             # Configuration ESLint
├── 📄 index.html                   # Point d'entrée HTML
│
├── 📖 README.md                    # Documentation principale
├── 📖 ARCHITECTURE.md              # Documentation d'architecture
├── 📖 MIGRATION_GUIDE.md           # Guide de migration
├── 📖 REFACTORING_SUMMARY.md       # Résumé de la refactorisation
│
├── 📁 public/                      # Assets publics (servis à la racine)
│   └── 📁 assets/
│       └── 📁 jjba/
│           ├── characters.json     # 🗃️ Données des personnages
│           ├── stands.json         # 🗃️ Données des Stands
│           ├── 📁 img/            # Images
│           └── 📁 assets/         # Logo, icônes, etc.
│
├── 📁 scripts/                     # 🔧 Scripts utilitaires
│   ├── 📄 README.md
│   └── 📁 scrapers/
│       ├── scrape_jjba_characters.js
│       ├── scrape_stands.js
│       └── scraper-utils.js
│
└── 📁 src/                         # 💻 Code source principal
    │
    ├── 📄 main.jsx                 # ⚡ Point d'entrée React
    ├── 📄 App.jsx                  # 🎯 Composant racine
    ├── 📄 App.css                  # 🎨 Styles globaux
    ├── 📄 index.css                # 🎨 Styles de base
    │
    ├── 📁 constants/               # ⚙️ Configuration centralisée
    │   ├── gameConfig.js           # - MAX_ATTEMPTS: 20
    │   │                           # - ROUTES (/, /classic, /stand)
    │   │                           # - ASSETS_PATHS
    │   └── index.js                # Exports centralisés
    │
    ├── 📁 models/                  # 📋 Modèles de données
    │   ├── Character.js            # Classe Character
    │   ├── Stand.js                # Classe Stand
    │   └── index.js                # Exports { Character, Stand }
    │
    ├── 📁 services/                # 🔌 Services (API, données)
    │   ├── dataService.js          # Service de chargement JSON
    │   │                           # - fetchCharacters()
    │   │                           # - fetchStands()
    │   └── index.js                # Export { dataService }
    │
    ├── 📁 hooks/                   # 🪝 Hooks React personnalisés
    │   ├── useFetchData.js         # - useFetchCharacters()
    │   │                           # - useFetchStands()
    │   ├── useGameLogic.js         # - useGameLogic(items)
    │   │                           #   → Logique complète du jeu
    │   └── index.js                # Exports centralisés
    │
    ├── 📁 utils/                   # 🛠️ Fonctions utilitaires
    │                               # (vide pour l'instant - prêt pour l'avenir)
    │
    ├── 📁 shared/                  # 🤝 Composants partagés
    │   └── 📁 components/
    │       ├── 📁 Success/         # Écran de victoire
    │       │   ├── Success.jsx     # + Confettis
    │       │   └── Success.css
    │       ├── 📁 Failure/         # Écran de défaite
    │       │   ├── Failure.jsx     # + Particules
    │       │   └── Failure.css
    │       ├── 📁 GameClues/       # Indices déblocables
    │       │   ├── GameClues.jsx
    │       │   └── GameClues.css
    │       ├── 📁 StandShape/      # Silhouette de Stand
    │       │   └── StandShape.jsx
    │       └── index.js            # Exports centralisés
    │
    └── 📁 features/                # 🎮 Features modulaires
        │
        ├── 📁 home/                # 🏠 Page d'accueil
        │   ├── Home.jsx            # Sélection du mode de jeu
        │   ├── MenacingTexts.jsx   # Animation "menacing"
        │   └── index.js            # Export { Home, MenacingTexts }
        │
        ├── 📁 character-game/      # 🎭 Jeu de devinette de personnage
        │   ├── CharacterGame.jsx   # Composant principal
        │   │                       # - Utilise useGameLogic
        │   │                       # - Intègre Success/Failure
        │   ├── CharacterCard.jsx   # Carte de personnage avec comparaison
        │   ├── CharacterAutocomplete.jsx # Autocomplete MUI
        │   ├── CharacterGame.css   # Styles du jeu
        │   └── index.js            # Exports
        │
        └── 📁 stand-game/          # 🌟 Jeu de devinette de Stand
            ├── StandGame.jsx       # Composant principal
            │                       # - Utilise useGameLogic
            │                       # - Intègre Success/Failure
            ├── StandCard.jsx       # Carte de Stand avec comparaison
            ├── StandAutocomplete.jsx # Autocomplete MUI
            ├── StandGame.css       # Styles du jeu
            └── index.js            # Exports
```

## 🔄 Flux de Données

```
┌─────────────────────────────────────────────────────┐
│                     App.jsx                          │
│  ┌───────────────────────────────────────────────┐  │
│  │ useFetchCharacters() → dataService            │  │
│  │ useFetchStands() → dataService                │  │
│  └───────────────────────────────────────────────┘  │
└───────────────┬─────────────────────────────────────┘
                │
        ┌───────┴───────┐
        │               │
┌───────▼────────┐ ┌───▼──────────┐
│ CharacterGame  │ │  StandGame   │
│ ┌────────────┐ │ │ ┌──────────┐ │
│ │useGameLogic│ │ │ │useGame...│ │
│ │  • select  │ │ │ │  • select│ │
│ │  • reset   │ │ │ │  • reset │ │
│ │  • winner  │ │ │ │  • winner│ │
│ └────────────┘ │ │ └──────────┘ │
└───────┬────────┘ └───┬──────────┘
        │              │
    ┌───▼────┐     ┌───▼────┐
    │Success │     │Failure │
    └────────┘     └────────┘
```

## 🎯 Responsabilités par Dossier

### 📁 **features/** - Fonctionnalités métier
- Chaque feature = 1 fonctionnalité complète
- Autonome et auto-suffisante
- Peut avoir ses propres composants, styles, logique

### 📁 **shared/** - Composants réutilisables
- Composants utilisés par plusieurs features
- Pas de logique métier
- Focalisés sur l'UI

### 📁 **hooks/** - Logique React
- Logique réutilisable
- Pas de JSX
- Pure logique d'état

### 📁 **services/** - Accès aux données
- Communication avec APIs/fichiers
- Pas de state React
- Fonctions pures

### 📁 **models/** - Structures de données
- Classes/Types de données
- Validation
- Transformations

### 📁 **constants/** - Configuration
- Valeurs constantes
- Configuration globale
- Pas de logique

## 💫 Pattern d'Import Recommandé

```javascript
// ✅ BON - Via index.js
import { CharacterGame } from './features/character-game';
import { useGameLogic } from './hooks';
import { Success } from './shared/components';
import { GAME_CONFIG } from './constants';

// ❌ ÉVITER - Import direct
import CharacterGame from './features/character-game/CharacterGame.jsx';
import useGameLogic from './hooks/useGameLogic.js';
```

## 📦 Barrel Exports (index.js)

Chaque dossier expose un `index.js` :

```javascript
// features/character-game/index.js
export { default as CharacterGame } from './CharacterGame.jsx';
export { default as CharacterCard } from './CharacterCard.jsx';

// hooks/index.js
export { useFetchCharacters, useFetchStands } from './useFetchData.js';
export { useGameLogic } from './useGameLogic.js';

// shared/components/index.js
export { default as Success } from './Success/Success.jsx';
export { default as Failure } from './Failure/Failure.jsx';
```

## 🚀 Évolution Future

```
features/
├── character-game/      ✅ Existant
├── stand-game/          ✅ Existant
├── home/                ✅ Existant
├── ability-game/        🔮 À venir
├── quote-game/          🔮 À venir
└── leaderboard/         🔮 À venir
```

---

**Cette structure est prête pour évoluer ! 🌟**
