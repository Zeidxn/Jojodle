import { useState, useEffect } from 'react';
import { dataService } from '../services';

/**
 * Hook pour charger les personnages
 * @returns {Object} { characters, loading, error }
 */
export const useFetchCharacters = () => {
    const [characters, setCharacters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadCharacters = async () => {
            try {
                setLoading(true);
                const data = await dataService.fetchCharacters();
                setCharacters(data);
                setError(null);
            } catch (err) {
                setError(err.message);
                console.error('Error loading characters:', err);
            } finally {
                setLoading(false);
            }
        };

        loadCharacters();
    }, []);

    return { characters, loading, error };
};

/**
 * Hook pour charger les Stands
 * @returns {Object} { stands, loading, error }
 */
export const useFetchStands = () => {
    const [stands, setStands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadStands = async () => {
            try {
                setLoading(true);
                const data = await dataService.fetchStands();
                setStands(data);
                setError(null);
            } catch (err) {
                setError(err.message);
                console.error('Error loading stands:', err);
            } finally {
                setLoading(false);
            }
        };

        loadStands();
    }, []);

    return { stands, loading, error };
};
