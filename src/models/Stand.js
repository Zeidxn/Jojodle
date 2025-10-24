/**
 * Stand Model
 * Représente un Stand de JoJo's Bizarre Adventure
 */
export class Stand {
    constructor({
        id = 0,
        name = "",
        imageUrl = "",
        type = "",
        destructivePower = "",
        speed = "",
        range = "",
        persistence = "",
        precision = "",
        developmentPotential = "",
        user = "",
        part = "",
        url = ""
    } = {}) {
        this.id = id;
        this.name = name;
        this.imageUrl = imageUrl;
        this.type = type;
        this.destructivePower = destructivePower;
        this.speed = speed;
        this.range = range;
        this.persistence = persistence;
        this.precision = precision;
        this.developmentPotential = developmentPotential;
        this.user = user;
        this.part = part;
        this.url = url;
    }

    static fromObject(obj) {
        return new Stand(obj);
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            imageUrl: this.imageUrl,
            type: this.type,
            destructivePower: this.destructivePower,
            speed: this.speed,
            range: this.range,
            persistence: this.persistence,
            precision: this.precision,
            developmentPotential: this.developmentPotential,
            user: this.user,
            part: this.part,
            url: this.url
        };
    }
}

export default Stand;
