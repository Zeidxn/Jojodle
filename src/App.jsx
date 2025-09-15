import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css';
import Home from "./components/views/Home.jsx";
import Classic from "./components/views/mods/classic/Classic.jsx";
import Stand from "./components/views/mods/Stand.jsx";

function App() {
    const [characters, setCharacters] = useState([]);

    useEffect(() => {
        fetch("/assets/jjba/characters.json")
            .then((res) => res.json())
            .then((data) => setCharacters(data))
            .catch((err) => console.error("Erreur JSON:", err));
    }, []);

    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home characters={characters} />} />
                <Route path="/classic" element={<Classic characters={characters} />} />
                <Route path="/stand" element={<Stand characters={characters} />} />
            </Routes>
        </Router>
    );
}

export default App;
