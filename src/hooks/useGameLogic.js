import { useState, useEffect, useCallback } from 'react';
import { GAME_CONFIG } from '../constants';

/**
 * Hook pour gérer la logique du jeu
 * @param {Array} items - Liste des items (personnages ou stands)
 * @returns {Object} État et actions du jeu
 */
export const useGameLogic = (items = []) => {
    const [selectedItems, setSelectedItems] = useState([]);
    const [availableItems, setAvailableItems] = useState([]);
    const [randomItem, setRandomItem] = useState(null);
    const [attempts, setAttempts] = useState(0);
    const [winner, setWinner] = useState(null);
    const [loser, setLoser] = useState(null);

    // Synchronise la liste des items disponibles
    useEffect(() => {
        setAvailableItems(items);
    }, [items]);

    // Sélectionne un item aléatoire au chargement
    useEffect(() => {
        if (items.length > 0 && !randomItem) {
            const rand = items[Math.floor(Math.random() * items.length)];
            setRandomItem(rand);
            console.log('Random item to find:', rand);
        }
    }, [items, randomItem]);

    /**
     * Gère la sélection d'un item
     */
    const handleSelect = useCallback((item) => {
        if (!item) return;

        // Vérifie si l'item n'a pas déjà été sélectionné
        if (!selectedItems.some((i) => i.id === item.id)) {
            setSelectedItems(prev => [...prev, item]);
            setAttempts(prev => prev + 1);
            setAvailableItems(prev => prev.filter(i => i.id !== item.id));
        }

        // Vérifie si c'est le gagnant
        if (randomItem && item.id === randomItem.id) {
            setWinner(item);
            setAvailableItems([]);
            return;
        }

        // Vérifie si le nombre maximum de tentatives est atteint
        if (attempts + 1 >= GAME_CONFIG.MAX_ATTEMPTS) {
            setAvailableItems([]);
            setLoser(item);
        }
    }, [selectedItems, randomItem, attempts]);

    /**
     * Réinitialise le jeu
     */
    const handleReset = useCallback(() => {
        setWinner(null);
        setLoser(null);
        setSelectedItems([]);
        setAvailableItems(items);
        setRandomItem(null);
        setAttempts(0);
    }, [items]);

    return {
        selectedItems,
        availableItems,
        randomItem,
        attempts,
        winner,
        loser,
        handleSelect,
        handleReset,
        attemptsLeft: GAME_CONFIG.MAX_ATTEMPTS - attempts,
    };
};
