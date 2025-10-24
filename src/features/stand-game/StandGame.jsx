import { Link } from "react-router-dom";
import { useGameLogic } from '../../hooks/index.js';
import { Success, Failure, StandShape } from '../../shared/components/index.js';
import StandCard from './StandCard.jsx';
import StandAutocomplete from './StandAutocomplete.jsx';
import { ASSETS_PATHS } from '../../constants/index.js';
import './StandGame.css';

/**
 * Feature StandGame
 * Jeu de devinette de Stand
 */
export default function StandGame({ stands = [] }) {
    const {
        selectedItems: selectedStands,
        availableItems: availableStands,
        randomItem: randomStand,
        attempts,
        winner,
        loser,
        handleSelect,
        handleReset,
        attemptsLeft,
    } = useGameLogic(stands);

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

                {randomStand && (
                    <StandShape imageUrl={randomStand.imageUrl} />
                )}

                <StandAutocomplete
                    stands={availableStands}
                    onSelect={handleSelect}
                />

                {selectedStands.length > 0 && (
                    <p className="attempts-left">Attempts left: {attemptsLeft}</p>
                )}

                {winner && (
                    <Success winner={winner} onReset={handleReset} />
                )}

                {loser && (
                    <Failure loser={loser} correctChar={randomStand} onReset={handleReset} />
                )}

                <div className="character-cards-container w_75 flex flex_col flex_wrap justify_center gap_2 m-4">
                    <div className="flex flex_col gap-2">
                        <div className="character-attributes-container">
                            <span className="character-attribute name">Name</span>
                            <span className="character-attribute type">Type</span>
                            <span className="character-attribute destructivePower">Power</span>
                            <span className="character-attribute speed">Speed</span>
                            <span className="character-attribute range">Range</span>
                            <span className="character-attribute persistence">Durability</span>
                            <span className="character-attribute precision">Precision</span>
                            <span className="character-attribute developmentPotential">Potential</span>
                            <span className="character-attribute user">User</span>
                            <span className="character-attribute part">Part</span>
                        </div>
                        {[...selectedStands].reverse().map((stand) => (
                            <StandCard key={stand.id} stand={stand} randomStand={randomStand} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
