import { useState } from "react";
import './GameClues.css';

/**
 * Composant GameClues
 * Affiche les indices déblocables du jeu
 */
function GameClues({ randomChar, attempts, title }) {
    const maxAttempsClue1 = 5;
    const maxAttempsClue2 = 15;
    
    const [selectedClue, setSelectedClue] = useState(null);

    const handleClueClick = (clueType) => {
        if (selectedClue === clueType) {
            setSelectedClue(null); // Toggle off si on clique sur le même
        } else {
            setSelectedClue(clueType);
        }
    };

    const isClue1Unlocked = attempts >= maxAttempsClue1;
    const isClue2Unlocked = attempts >= maxAttempsClue2;

    return (
        <div className="game_clues">
            <h2 className="game_clues_title">{title}</h2>
            
            <div className="game_clues_buttons">
                <button
                    className={`clue_button ${isClue1Unlocked ? 'clue_unlocked' : 'clue_locked'} ${selectedClue === 'standType' ? 'clue_active' : ''}`}
                    onClick={() => isClue1Unlocked && handleClueClick('standType')}
                    disabled={!isClue1Unlocked}
                    title={isClue1Unlocked ? 'Stand Type' : `Unlocks at ${maxAttempsClue1} attempts`}
                >
                    <img 
                        src="/assets/jjba/assets/standType.png" 
                        alt="Stand Type"
                        className="clue_icon"
                    />
                    {!isClue1Unlocked && (
                        <span className="clue_lock_overlay">
                            🔒
                            <span className="clue_attempts_left">{maxAttempsClue1 - attempts}</span>
                        </span>
                    )}
                </button>

                <button
                    className={`clue_button ${isClue2Unlocked ? 'clue_unlocked' : 'clue_locked'} ${selectedClue === 'stand' ? 'clue_active' : ''}`}
                    onClick={() => isClue2Unlocked && handleClueClick('stand')}
                    disabled={!isClue2Unlocked}
                    title={isClue2Unlocked ? 'Stand' : `Unlocks at ${maxAttempsClue2} attempts`}
                >
                    <img 
                        src="/assets/jjba/assets/stand.png" 
                        alt="Stand"
                        className="clue_icon"
                    />
                    {!isClue2Unlocked && (
                        <span className="clue_lock_overlay">
                            🔒
                            <span className="clue_attempts_left">{maxAttempsClue2 - attempts}</span>
                        </span>
                    )}
                </button>
            </div>

            {selectedClue && (
                <div className="game_clues_reveal">
                    {selectedClue === 'standType' && (
                        <p className="clue_text">
                            <strong>Stand Type:</strong> {randomChar.standType || "Unknown"}
                        </p>
                    )}
                    {selectedClue === 'stand' && (
                        <p className="clue_text">
                            <strong>Stand:</strong> {randomChar.stand || "None"}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}

export default GameClues;
