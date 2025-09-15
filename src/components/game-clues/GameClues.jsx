

function GameClues({ randomChar , title}) {
  return (
    <div className="game_clues">
        <h2 className="game_clues_title">{title}</h2>
        <ul className="game_clues_list">
            <li className="game_clues_item"><strong>Stand type:</strong> {randomChar.standType || "Aucun"}</li>
            <li className="game_clues_item"><strong>Parts:</strong> {randomChar.parts || "Aucun"}</li>
            <li className="game_clues_item"><strong>Stand:</strong> {randomChar.stand || "Aucun"}</li>
        </ul>
    </div>
);
}
export default GameClues;