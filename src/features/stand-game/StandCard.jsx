export default function StandCard({ stand, randomStand }) {
    if (!stand) return null;

    const formatValue = (val) => val || "None";

    const getClass = (key) => {
        if (!randomStand) return "";
        const val1 = formatValue(stand[key]);
        const val2 = formatValue(randomStand[key]);
        return val1 === val2 ? "match" : "no-match";
    };

    return (
        <div className="character_card scale_hover place_items_center justify_center">
            {stand.imageUrl && (
                <img
                    src={stand.imageUrl}
                    alt={stand.name}
                    className="character_img"
                />
            )}

            <div className="character_info">
                <span className={`character_info_item ${getClass("name")}`}>
                    {formatValue(stand.name)}
                </span>
                <span className={`character_info_item ${getClass("type")}`}>
                    {formatValue(stand.type)}
                </span>
                <span className={`character_info_item ${getClass("destructivePower")}`}>
                    {formatValue(stand.destructivePower)}
                </span>
                <span className={`character_info_item ${getClass("speed")}`}>
                    {formatValue(stand.speed)}
                </span>
                <span className={`character_info_item ${getClass("range")}`}>
                    {formatValue(stand.range)}
                </span>
                <span className={`character_info_item ${getClass("persistence")}`}>
                    {formatValue(stand.persistence)}
                </span>
                <span className={`character_info_item ${getClass("precision")}`}>
                    {formatValue(stand.precision)}
                </span>
                <span className={`character_info_item ${getClass("developmentPotential")}`}>
                    {formatValue(stand.developmentPotential)}
                </span>
                <span className={`character_info_item ${getClass("user")}`}>
                    {formatValue(stand.user)}
                </span>
                <span className={`character_info_item ${getClass("part")}`}>
                    {formatValue(stand.part)}
                </span>
            </div>
        </div>
    );
}
