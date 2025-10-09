import path from "path";
import fs from "fs-extra";
import * as cheerio from "cheerio";
import Character from "./character.model.js";

const BASE_URL = "https://jojo.fandom.com/wiki";
const INPUT_FILE = path.resolve("../../public/assets/jjba/characters.txt");
const OUTPUT_FILE = path.resolve("../../public/assets/jjba/characters.json");

const MAP_REPLACE_CHARS = {
    " ": "_",
    "'": "%27",
    "é": "e",
    "è": "e",
    "ê": "e",
    "à": "a",
    "ù": "u",
    "ç": "c",
    "ô": "o",
};

const PARTS_MAP = {
    "PhantomBlood": "Phantom Blood",
    "BattleTendency": "Battle Tendency",
    "StardustCrusaders": "Stardust Crusaders",
    "DiamondIsUnbreakable": "Diamond is Unbreakable",
    "VentoAureo": "Vento Aureo",
    "StoneOcean": "Stone Ocean",
    "SteelBallRun": "Steel Ball Run",
    "Jojolion": "Jojolion",
    "TheJOJOLands": "The JOJOLands",
};

async function readCharacterNames() {
    try {
        const characters = await fs.readFile(INPUT_FILE, "utf-8");
        return characters.split("\n").map(name => name.trim()).filter(Boolean);
    } catch (err) {
        console.error("Erreur lecture fichier:", err);
        return [];
    }
}

function getCharacterUrl(name) {
    return (
        BASE_URL +
        "/" +
        name.split("").map(c => MAP_REPLACE_CHARS[c] || c).join("") +
        "?action=edit"
    );
}

async function fetchCharacterData(url) {
    try {
        const result = await fetch(url);
        if (!result.ok) throw new Error(`HTTP ${result.status}`);
        const html = await result.text();
        const $ = cheerio.load(html);
        return $("#wpTextbox1").text() || "";
    } catch (err) {
        throw new Error(`fetch error: ${err.message}`);
    }
}

function extractField(wikicode, field) {
    const regex = new RegExp(`\\|\\s*${field}\\s*=([^\\n]*)`, "i");
    const match = wikicode.match(regex);
    if (!match) return "";
    let value = match[1]
        .replace(/<ref[^>]*>.*?(<\/ref>|$)/gi, "")
        .replace(/<small[^>]*>.*?<\/small>/gi, "")
        .replace(/{{[^}]+}}/g, "")
        .replace(/\[\[([^|\]]*\|)?([^\]]+)\]\]/g, "$2")
        .replace(/''+/g, "")
        .replace(/\s+/g, " ")
        .trim();
    value = value.split(/,|\(|\//)[0].trim();
    if (!value || value.toLowerCase() === "none" || value === "-") return "";
    return value;
}

function extractImageFileName(wikicode) {
    const regex = /\| *image *= *\[\[File:([^|\]]+)/i;
    const match = wikicode.match(regex);
    return match ? match[1].trim() : "";
}

async function fetchImageUrlFromFandom(imageFile) {
    if (!imageFile) return "";
    const url = `https://jojo.fandom.com/wiki/File:${encodeURIComponent(imageFile.replace(/ /g, "_"))}`;
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const html = await res.text();
        const $ = cheerio.load(html);

        // Cherche une image dont le src contient static.wikia.nocookie.net
        let img = $('img').filter((i, el) => {
            const src = $(el).attr('src') || "";
            return src.includes('static.wikia.nocookie.net');
        }).first().attr('src');

        if (!img) {
            // Fallback sur d'autres sélecteurs
            img = $('.mw-file-description img').attr('src') || $('.pi-image-thumbnail').attr('src');
        }

        return img ? (img.startsWith("http") ? img : `https:${img}`) : "";
    } catch {
        return "";
    }
}



async function getCharacterData(id, name) {
    const url = getCharacterUrl(name);
    const wikicode = await fetchCharacterData(url);

    const imageFile   = extractImageFileName(wikicode);
    const imageUrl = await fetchImageUrlFromFandom(imageFile);

    const status      = extractField(wikicode, "status");
    const stand       = extractField(wikicode, "stand");
    const standType   = extractField(wikicode, "stand_type");
    const age         = extractField(wikicode, "age");
    const gender      = extractField(wikicode, "gender");
    const nationality = extractField(wikicode, "nation");
    const hair_color  = extractField(wikicode, "hair");
    const occupation  = extractField(wikicode, "occupation");
    const birthday    = extractField(wikicode, "birthday");
    const partKey     = extractField(wikicode, "colors");
    const part        = PARTS_MAP[partKey.replace(/\s/g, "")] || "";

    return new Character({
        id,
        name,
        imageUrl,
        status,
        stand,
        standType,
        age,
        gender,
        nationality,
        hair_color,
        occupation,
        part,
        birthday,
        url
    });
}

async function scrape() {
    const characters = await readCharacterNames();

    console.log(`${characters.length} personnages trouvés dans ${INPUT_FILE}`);
    console.log("----------------------------------------------------");

    const promises = characters.map((name, index) =>
        getCharacterData(index + 1, name)
            .then(c => {
                console.log(`[${index + 1}/${characters.length}] ${name} OK`);
                return c.toJSON();
            })
            .catch(err => {
                console.log(`[${index + 1}/${characters.length}] ${name} Erreur: ${err.message}`);
                return null;
            })
    );

    const results = (await Promise.all(promises)).filter(Boolean);

    await fs.writeJson(OUTPUT_FILE, results, { spaces: 2 });

    console.log("----------------------------------------------------");
    console.log(`Scraping terminé. Résultats sauvegardés dans : ${OUTPUT_FILE}`);
}

await scrape();
