export default function CharacterCard({ character, randomChar }) {
    if (!character) return null;

    const formatValue = (val) => val || "None";

    const getClass = (key) => {
        if (!randomChar) return "";
        const val1 = formatValue(character[key]);
        const val2 = formatValue(randomChar[key]);
        return val1 === val2 ? "match" : "no-match";
    };


    return (
        <div className="character_card scale_hover place_items_center justify_center">
            {character.imageUrl && (
                <img
                    src={character.imageUrl}
                    alt={character.name}
                    className="character_img"
                />
            )}

            <div className="character_info">
                <span className={`character_info_item ${getClass("name")}`}>
                    {formatValue(character.name)}
                </span>
                <span className={`character_info_item ${getClass("status")}`}>
                    {formatValue(character.status)}
                </span>
                <span className={`character_info_item ${getClass("alignment")}`}>
                    {formatValue(character.alignment)}
                </span>
                <span className={`character_info_item ${getClass("stand")}`}>
                    {formatValue(character.stand)}
                </span>
                <span className={`character_info_item ${getClass("standType")}`}>
                    {formatValue(character.standType)}
                </span>
                <span className={`character_info_item ${getClass("age")}`}>
                    {formatValue(character.age)}
                </span>
                <span className={`character_info_item ${getClass("gender")}`}>
                    {formatValue(character.gender)}
                </span>
                <span className={`character_info_item ${getClass("nationality")}`}>
                    {formatValue(character.nationality)}
                </span>
                <span className={`character_info_item ${getClass("hair_color")}`}>
                    {formatValue(character.hair_color)}
                </span>
                <span className={`character_info_item ${getClass("occupation")}`}>
                    {formatValue(character.occupation)}
                </span>
                <span className={`character_info_item ${getClass("part")}`}>
                    {formatValue(character.part)}
                </span>
            </div>

        </div>
    );
}
