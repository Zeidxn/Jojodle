/**
 * Composant StandShape
 * Affiche la silhouette d'un Stand
 */
function StandShape({ imageUrl }) {
    return (
        <img 
            src={imageUrl}
            alt="Stand Silhouette"
            className="stand_silhouette"
        />
    );
}

export default StandShape;
