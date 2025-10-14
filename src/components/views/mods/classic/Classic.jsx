import { useState, useEffect } from "react";
import CharacterCard from "../../../character/CharacterCard.jsx";
import CharacterAutocomplete from "../../../character/CharacterAutocomplete.jsx";
import './classic.css';
import { Link } from "react-router-dom";
import GameClues from "../../../game-clues/GameClues.jsx";

export default function Classic({ characters = [] }) {
    const [selectedChars, setSelectedChars] = useState([]);
    const [availableChars, setAvailableChars] = useState(characters); // Nouvel état pour les personnages disponibles
    const [winner, setWinner] = useState(null);
    const [randomChar, setRandomChar] = useState(null);

    // Synchronise la liste des personnages disponibles au premier chargement
    useEffect(() => {
        setAvailableChars(characters);
    }, [characters]);

    useEffect(() => {
        if (characters.length > 0 && !randomChar) {
            const rand = characters[Math.floor(Math.random() * characters.length)];
            setRandomChar(rand);
            console.log("Random character to find:", rand);
        }
    }, [characters, randomChar]);

    const handleSelect = (char) => {
        if (!char) return;

        if (!selectedChars.some((c) => c.id === char.id)) {
            // 1. Ajoutez le personnage à la liste des sélectionnés
            setSelectedChars([...selectedChars, char]);

            // 2. Supprimez le personnage de la liste des disponibles
            setAvailableChars(availableChars.filter(c => c.id !== char.id));
        }

        // Vérifier si c'est le gagnant
        if (randomChar && char.id === randomChar.id) {
            setWinner(char);
            setAvailableChars([]);
        }
    };

    return (
        <div className="w_100 h_100 flex flex_col items_center justify_center">
            <div className="h_100 w_75 flex flex_col items_center m_x_auto gap_3">
                <Link to="/">
                    <img
                        className="h_15 m_4 scale_hover cursor_pointer"
                        src="/assets/jjba/logo.png"
                        alt="Logo"
                    />
                </Link>

                {randomChar && (
                    <GameClues
                        randomChar={randomChar}
                        title={ "Guess today's Jojo's Bizarre Adventure's character!" }
                    />
                )}

                <CharacterAutocomplete
                    characters={availableChars}
                    onSelect={handleSelect}
                />

                {selectedChars.length > 0 && (
                    <p>{selectedChars.length} personnage(s) sélectionné(s) !</p>
                )}

                {winner && (
                    <p className="text-green-400 font-bold mt-4">
                        🎉 Bravo ! Vous avez trouvé le personnage aléatoire : {winner.name} !
                    </p>
                )}

                <div className="character-attributes-container w_75 flex flex_row flex_wrap justify_center gap_2 m-4">
                    <span className="character-attribute status">Status</span>
                    <span className="character-attribute stand">Stand</span>
                    <span className="character-attribute standType">Stand Type</span>
                    <span className="character-attribute age">Age</span>
                    <span className="character-attribute gender">Gender</span>
                    <span className="character-attribute nationality">Nationality</span>
                    <span className="character-attribute hair_color">Hair Color</span>
                    <span className="character-attribute occupation">Occupation</span>
                    <span className="character-attribute part">Part</span>
                </div>

                <div className="character-cards-container w_75 flex flex_col flex_wrap justify_center gap_2 m-4">
                    {[...selectedChars].reverse().map((char) => (
                        <CharacterCard key={char.id} character={char} randomChar={randomChar}/>
                    ))}
                </div>
            </div>
        </div>
    );
}