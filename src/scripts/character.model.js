class Character {
    constructor({
                    id,
                    name,
                    imageUrl = "",
                    status="",
                    stand = null,
                    standType = null,
                    age = null,
                    gender = "",
                    nationality = "",
                    hair_color = "",
                    occupation = "",
                    part = "",
                    alignment = "",
                    url = ""
                }) {
        this.id = id;
        this.name = name;
        this.imageUrl = imageUrl;
        this.status=status;
        this.stand = stand;
        this.standType = standType;
        this.age = age;
        this.gender = gender;
        this.nationality = nationality;
        this.hair_color = hair_color;
        this.occupation = occupation;
        this.part = part;
        this.alignment = alignment;
        this.url = url;
    }

    static fromObject(obj) {
        return new Character(obj);
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            imageUrl: this.imageUrl,
            status: this.status,
            stand: this.stand,
            standType: this.standType,
            age: this.age,
            gender: this.gender,
            nationality: this.nationality,
            hair_color: this.hair_color,
            occupation: this.occupation,
            part: this.part,
            alignment: this.alignment,
            url: this.url
        };
    }
}

export default Character;
