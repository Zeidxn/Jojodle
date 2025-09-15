export default function CharacterCard({ character, randomChar }) {
    if (!character) return null;

    const toArray = (v) => {
        if (!v) return [];
        if (Array.isArray(v)) return v.map((x) => String(x).trim()).filter(Boolean);
        return String(v)
            .split(/[,\u00B7\/&]+/)
            .map((s) => s.trim())
            .filter(Boolean);
    };

    const parseNumber = (s) => {
        if (!s) return null;
        const m = String(s).match(/-?\d+\.?\d*/);
        return m ? Number(m[0]) : null;
    };

    const compareNumbers = (aStr, bStr, opts = { absTolerance: 5, relTolerance: 0.05 }) => {
        const a = parseNumber(aStr);
        const b = parseNumber(bStr);
        if (a == null && b == null) return "true";
        if (a == null || b == null) return "false";
        if (a === b) return "true";
        const absDiff = Math.abs(a - b);
        const rel = Math.max(
            Math.abs(absDiff / Math.max(1, Math.abs(b))),
            Math.abs(absDiff / Math.max(1, Math.abs(a)))
        );
        if (absDiff <= opts.absTolerance || rel <= opts.relTolerance) return "half";
        return "false";
    };

    const compareStrings = (aStr, bStr) => {
        if (!aStr && !bStr) return "true";
        if (!aStr || !bStr) return "false";
        const a = String(aStr).trim().toLowerCase();
        const b = String(bStr).trim().toLowerCase();
        if (a === b) return "true";
        if (a.includes(b) || b.includes(a)) return "half";
        return "false";
    };

    const compareArrays = (aVal, bVal) => {
        const A = toArray(aVal);
        const B = toArray(bVal);
        if (!A.length && !B.length) return "true";
        if (!A.length || !B.length) return "false";
        const inter = A.filter((x) =>
            B.map((y) => y.toLowerCase()).includes(x.toLowerCase())
        );
        if (inter.length === 0) return "false";
        if (inter.length === A.length && inter.length === B.length) return "true";
        return "half";
    };

    const getClassForAttribute = (key, val, randVal) => {
        if (key === "age") {
            const a = parseNumber(val);
            const b = parseNumber(randVal);
            if (a == null && b == null) return "character_info_true";
            if (a == null || b == null) return "character_info_false";
            if (a === b) return "character_info_true";
            if (Math.abs(a - b) <= 2) return "character_info_half";
            return "character_info_false";
        }

        if (key === "height") {
            return `character_info_${compareNumbers(val, randVal, { absTolerance: 5, relTolerance: 0.03 })}`;
        }

        if (key === "weight") {
            return `character_info_${compareNumbers(val, randVal, { absTolerance: 5, relTolerance: 0.08 })}`;
        }

        if (key === "parts" || key === "standType") {
            return `character_info_${compareArrays(val, randVal)}`;
        }

        return `character_info_${compareStrings(val, randVal)}`;
    };

    const getArrow = (key, val, randVal) => {
        const a = parseNumber(val);
        const b = parseNumber(randVal);
        if (a == null || b == null) return "";
        if (a < b) return " ↑";
        if (a > b) return " ↓";
        return "";
    };

    const cls = {
        stand: getClassForAttribute("stand", character.stand, randomChar?.stand),
        standType: getClassForAttribute("standType", character.standType, randomChar?.standType),
        age: getClassForAttribute("age", character.age, randomChar?.age),
        gender: getClassForAttribute("gender", character.gender, randomChar?.gender),
        height: getClassForAttribute("height", character.height, randomChar?.height),
        weight: getClassForAttribute("weight", character.weight, randomChar?.weight),
        nationality: getClassForAttribute("nationality", character.nationality, randomChar?.nationality),
        parts: getClassForAttribute("parts", character.parts, randomChar?.parts),
    };

    return (
        <div className="character_card scale_hover">
            <img src={character.image} alt={character.name} className="character_img" />
            <h2 className="character_name">{character.name}</h2>

            <div className="character_info">
                <span className={`character_info_item ${cls.stand}`}>
                    <strong>Stand:</strong> {character.stand || "Aucun"}
                </span>

                <span className={`character_info_item ${cls.standType}`}>
                    <strong>Stand type:</strong> {character.standType || "Aucun"}
                </span>

                <span className={`character_info_item ${cls.age}`}>
                    <strong>Age:</strong> {character.age || "Aucun"}{getArrow("age", character.age, randomChar?.age)}
                </span>

                <span className={`character_info_item ${cls.gender}`}>
                    <strong>Gender:</strong> {character.gender || "Aucun"}
                </span>

                <span className={`character_info_item ${cls.height}`}>
                    <strong>Height:</strong> {character.height || "Aucun"}{getArrow("height", character.height, randomChar?.height)}
                </span>

                <span className={`character_info_item ${cls.weight}`}>
                    <strong>Weight:</strong> {character.weight || "Aucun"}{getArrow("weight", character.weight, randomChar?.weight)}
                </span>

                <span className={`character_info_item ${cls.nationality}`}>
                    <strong>Nationality:</strong> {character.nationality || "Aucun"}
                </span>

                <span className={`character_info_item ${cls.parts}`}>
                    <strong>Parts:</strong>{" "}
                    {character.parts?.length > 0 ? character.parts.join(", ") : "Aucun"}
                </span>
            </div>
        </div>
    );
}
