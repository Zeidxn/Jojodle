import { ASSETS_PATHS } from '../constants';

/**
 * Service de chargement des données
 */
class DataService {
    /**
     * Charge les données depuis un fichier JSON
     * @param {string} url - URL du fichier JSON
     * @returns {Promise<any>} Les données chargées
     */
    async fetchData(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error loading data from ${url}:`, error);
            throw error;
        }
    }

    /**
     * Charge les personnages
     * @returns {Promise<Array>} Liste des personnages
     */
    async fetchCharacters() {
        return this.fetchData(ASSETS_PATHS.CHARACTERS_JSON);
    }

    /**
     * Charge les Stands
     * @returns {Promise<Array>} Liste des Stands
     */
    async fetchStands() {
        return this.fetchData(ASSETS_PATHS.STANDS_JSON);
    }
}

export const dataService = new DataService();
export default dataService;
