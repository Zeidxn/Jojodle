import { Link } from "react-router-dom";
import { useGameLogic } from '../../hooks/index.js';
import { Success, Failure, GameClues } from '../../shared/components/index.js';
import CharacterCard from './CharacterCard.jsx';
import CharacterAutocomplete from './CharacterAutocomplete.jsx';
import { ASSETS_PATHS } from '../../constants/index.js';
import './CharacterGame.css';

/**
 * Feature CharacterGame (anciennement Classic)
 * Jeu de devinette de personnage
 */
export default function CharacterGame({ characters = [] }) {
    const {
        selectedItems: selectedChars,
        availableItems: availableChars,
        randomItem: randomChar,
        attempts,
        winner,
        loser,
        handleSelect,
        handleReset,
        attemptsLeft,
    } = useGameLogic(characters);

    return (
        <div className="w_100 h_100 flex flex_col items_center justify_center">
            <div className="h_100 w_75 flex flex_col items_center m_x_auto gap_3">
                <Link to="/">
                    <img
                        className="h_15 m_4 scale_hover cursor_pointer"
                        src={ASSETS_PATHS.LOGO}
                        alt="Logo"
                    />
                </Link>

                {randomChar && (
                    <GameClues
                        randomChar={randomChar}
                        attempts={attempts}
                        title="Guess today's Jojo's Bizarre Adventure's character!"
                    />
                )}

                <CharacterAutocomplete
                    characters={availableChars}
                    onSelect={handleSelect}
                />

                {selectedChars.length > 0 && (
                    <p className="attempts-left">Attempts left: {attemptsLeft}</p>
                )}

                {winner && (
                    <Success winner={winner} onReset={handleReset} />
                )}

                {loser && (
                    <Failure loser={loser} correctChar={randomChar} onReset={handleReset} />
                )}

                <div className="character-cards-container w_75 flex flex_col flex_wrap justify_center gap_2 m-4">
                    <div className="flex flex_col gap-2">
                        <div className="character-attributes-container">
                            <span className="character-attribute name">Name</span>
                            <span className="character-attribute status">Status</span>
                            <span className="character-attribute alignment">Alignment</span>
                            <span className="character-attribute stand">Stand</span>
                            <span className="character-attribute standType">Stand Type</span>
                            <span className="character-attribute age">Age</span>
                            <span className="character-attribute gender">Gender</span>
                            <span className="character-attribute nationality">Nationality</span>
                            <span className="character-attribute hair_color">Hair Color</span>
                            <span className="character-attribute occupation">Occupation</span>
                            <span className="character-attribute part">Part</span>
                        </div>
                        {[...selectedChars].reverse().map((char) => (
                            <CharacterCard key={char.id} character={char} randomChar={randomChar} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
