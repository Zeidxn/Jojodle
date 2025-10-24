# Jojodle ⭐

Un jeu de devinette basé sur l'univers de JoJo's Bizarre Adventure !

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![React](https://img.shields.io/badge/React-19.1-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-7.1-646CFF?logo=vite)

## 🎮 Modes de Jeu

### 🎭 Character Mode
Devinez le personnage mystère en sélectionnant des personnages et en comparant leurs attributs !

### 🌟 Stand Mode
Devinez le Stand mystère à partir de sa silhouette et des caractéristiques des Stands que vous sélectionnez !

## ✨ Fonctionnalités

- ✅ Deux modes de jeu distincts
- ✅ Système d'indices déblocables
- ✅ Autocomplete intelligent pour les sélections
- ✅ Animations et effets visuels (confettis, particules)
- ✅ Comparaison visuelle des attributs
- ✅ Interface responsive et moderne
- ✅ 20 tentatives maximum par partie

## 🏗️ Architecture

Le projet utilise une **architecture modulaire par features** :

```
src/
├── features/        # Fonctionnalités modulaires (character-game, stand-game, home)
├── shared/          # Composants réutilisables (Success, Failure, GameClues)
├── hooks/           # Hooks personnalisés (useGameLogic, useFetchData)
├── services/        # Services (dataService)
├── models/          # Modèles de données (Character, Stand)
└── constants/       # Configuration centralisée
```

📖 Voir [ARCHITECTURE.md](./ARCHITECTURE.md) pour plus de détails

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 18+
- npm ou yarn

### Installation

```bash
# Cloner le repo
git clone https://github.com/Zeidxn/Jojodle.git

# Installer les dépendances
cd Jojodle
npm install

# Lancer le serveur de développement
npm run dev
```

L'application sera accessible sur `http://localhost:5173/`

## 📜 Scripts Disponibles

```bash
# Développement
npm run dev          # Lance le serveur de développement

# Production
npm run build        # Build pour la production
npm run preview      # Preview du build

# Scraping (mise à jour des données)
npm run scrape:characters  # Scrape les personnages
npm run scrape:stands      # Scrape les Stands
npm run scrape:all         # Scrape tout

# Qualité de code
npm run lint         # Vérifie le code avec ESLint
```

## 🎯 Comment Jouer

### Character Mode
1. Cliquez sur "Classic" depuis la page d'accueil
2. Un personnage mystère est sélectionné
3. Utilisez l'autocomplete pour sélectionner des personnages
4. Comparez les attributs (en vert = match, en rouge = pas de match)
5. Débloquez des indices après 5 et 15 tentatives
6. Trouvez le personnage en moins de 20 tentatives !

### Stand Mode
1. Cliquez sur "Stand" depuis la page d'accueil
2. Un Stand mystère est affiché en silhouette
3. Sélectionnez des Stands et comparez leurs caractéristiques
4. Trouvez le bon Stand en moins de 20 tentatives !

## 🛠️ Technologies Utilisées

- **React 19** - Framework UI
- **Vite 7** - Build tool & dev server
- **React Router** - Navigation
- **Material-UI** - Composants UI (Autocomplete)
- **React Confetti** - Animations de victoire
- **TailwindCSS** - Styles utilitaires
- **Cheerio** - Web scraping
- **Node Fetch** - Requêtes HTTP

## 📁 Structure du Projet

```
Jojodle/
├── public/
│   └── assets/jjba/       # Images et données JSON
├── scripts/
│   └── scrapers/          # Scripts de scraping
└── src/
    ├── features/          # Features modulaires
    ├── shared/            # Composants partagés
    ├── hooks/             # Hooks personnalisés
    ├── services/          # Services
    ├── models/            # Modèles de données
    └── constants/         # Configuration
```

📖 Voir [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) pour une vue détaillée

## 📚 Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Architecture détaillée du projet
- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - Structure visuelle
- [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) - Guide pour ajouter des features
- [REFACTORING_SUMMARY.md](./REFACTORING_SUMMARY.md) - Résumé de la refactorisation

## 🔮 Roadmap

- [ ] Mode "Ability" - Deviner le personnage par sa capacité
- [ ] Mode "Quote" - Deviner le personnage par ses citations
- [ ] Système de scores et leaderboard
- [ ] Mode multijoueur
- [ ] Modes de difficulté
- [ ] Support TypeScript
- [ ] Tests automatisés
- [ ] PWA (Progressive Web App)

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push sur la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](./LICENSE) pour plus de détails.

## 👤 Auteur

**Nicolas (Zeidxn)**

- GitHub: [@Zeidxn](https://github.com/Zeidxn)

## 🙏 Remerciements

- Hirohiko Araki pour JoJo's Bizarre Adventure
- La communauté React
- Tous les contributeurs

---

**Fait avec ❤️ et beaucoup de ゴゴゴゴ**

