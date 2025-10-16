import { useEffect, useState } from "react";

function FloatingText({ src, left, size, duration = 10, onEnd }) {
    useEffect(() => {
        const timer = setTimeout(onEnd, duration * 1000);
        return () => clearTimeout(timer);
    }, [onEnd, duration]);

    return (
        <img
            src={src}
            alt="floating"
            className="floating-text"
            style={{
                width: size,
                height: size,
                left: `${left}px`,
                bottom: 0,
                animationDuration: `${duration}s`,
                animationFillMode: "forwards",
            }}
        />
    );
}

export default function TextCascade({
                                        src = "/assets/jjba/assets/menacing_text.png",
                                        interval = 1000,
                                        maxImages = 15,
                                    }) {
    const [images, setImages] = useState([]);
    const containerWidth = window.innerWidth * 0.25;

    useEffect(() => {
        const generator = setInterval(() => {
            const size = Math.floor(Math.random() * 60) + 40;
            const left = Math.random() * (containerWidth - size);
            setImages((prev) => [...prev, { id: Date.now(), size, left }]);
        }, interval);

        return () => clearInterval(generator);
    }, [interval, containerWidth]);

    const removeImage = (id) => {
        setImages((prev) => prev.filter((img) => img.id !== id));
    };

    return (
        <div className="cascade-container">
            {images.slice(-maxImages).map((img) => (
                <FloatingText
                    key={img.id}
                    src={src}
                    left={img.left}
                    size={img.size}
                    onEnd={() => removeImage(img.id)}
                />
            ))}
        </div>
    );
}
