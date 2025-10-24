import { useEffect, useState } from "react";
import './Failure.css';

/**
 * Composant Failure
 * Affiche un message d'échec avec animation
 */
const Failure = ({ loser, correctChar, onReset }) => {
    const [particles, setParticles] = useState([]);

    useEffect(() => {
        // Créer des particules tombantes
        const newParticles = [];
        for (let i = 0; i < 30; i++) {
            newParticles.push({
                id: i,
                left: Math.random() * 100,
                delay: Math.random() * 3,
                duration: 3 + Math.random() * 2
            });
        }
        setParticles(newParticles);
    }, []);

    return (
        <div className="failure_overlay">
            <div className="failure_card flex flex_col items_center justify_center p_4">
                {particles.map(particle => (
                    <div
                        key={particle.id}
                        className="failure_particle"
                        style={{
                            left: `${particle.left}%`,
                            animationDelay: `${particle.delay}s`,
                            animationDuration: `${particle.duration}s`
                        }}
                    />
                ))}
                
                <h1 className="failure_title">Game Over!</h1>
                <p className="failure_text">
                    You selected <span className="bold">{loser.name}</span>.
                </p>
                <p className="failure_text">
                    The correct character was <span className="bold">{correctChar.name}</span>.
                </p>
                <img src={correctChar.imageUrl} alt={correctChar.name} className="correct_image" />
                <button
                    onClick={onReset}
                    className="button"
                >
                    Try Again
                </button>
            </div>
        </div>
    );
};

export default Failure;
