/* success is a component that displays a success message when the user wins the game with confetti animation and an overlay darkening the background */
import { useEffect } from "react";
import Confetti from "react-confetti";
import './success.css';

export default function Success({ winner, onReset }) {


    return (
        <div className="success_overlay">
            <Confetti
                width={window.innerWidth}
                height={window.innerHeight}
                numberOfPieces={300}
                recycle={false}
            />
            <div className="success_card flex flex_col items_center justify_center p_4">
                <h1 className="success_title">Congratulations!</h1>
                <p className="success_text">
                    You found <span className="bold">{winner.name}</span>!
                </p>
                <img src={winner.imageUrl} alt={winner.name} className="winner_image" />
                <button
                    onClick={onReset}
                    className="button"
                >
                    Play Again
                </button>
            </div>
        </div>
    );
}


