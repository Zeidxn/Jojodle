import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css';
import { useFetchCharacters, useFetchStands } from './hooks/index.js';
import { Home } from './features/home/index.js';
import { CharacterGame } from './features/character-game/index.js';
import { StandGame } from './features/stand-game/index.js';
import { ROUTES } from './constants/index.js';

/**
 * Application principale
 */
function App() {
    const { characters, loading: loadingChars } = useFetchCharacters();
    const { stands, loading: loadingStands } = useFetchStands();

    return (
        <Router>
            <Routes>
                <Route path={ROUTES.HOME} element={<Home />} />
                <Route 
                    path={ROUTES.CLASSIC} 
                    element={
                        loadingChars ? <div>Loading...</div> : <CharacterGame characters={characters} />
                    } 
                />
                <Route 
                    path={ROUTES.STAND} 
                    element={
                        loadingStands ? <div>Loading...</div> : <StandGame stands={stands} />
                    } 
                />
            </Routes>
        </Router>
    );
}

export default App;
