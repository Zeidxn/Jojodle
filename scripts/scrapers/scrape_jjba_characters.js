import path from "path";
import fs from "fs-extra";
import Character from "../../src/models/Character.js";
import {
    buildUrl,
    fetchHtmlPage,
    fetchWikicode,
    matchFromList,
    matchStandType,
    fetchAndDownloadImage,
    cleanWikicodeValue,
    extractField
} from "./scraper-utils.js";

// ========== CONFIGURATION ==========
const INPUT_FILE = path.resolve(process.cwd(), "public/assets/jjba/jojo_characters.json");
const OUTPUT_FILE = path.resolve(process.cwd(), "public/assets/jjba/characters.json");
const IMG_DIR = path.resolve(process.cwd(), "public/assets/jjba/img");

// ========== CONSTANTS ==========
const STATUS = ["Alive", "Deceased", "Retired", "Unknown"];
const HAIR_COLOR = ["Blond", "Black", "Brown", "Red", "White", "Gray", "Blue", "Green", "Pink", "Purple", "Orange", "Yellow", "Silver", "Bald"];
const AGE_SCOPE = ["0-10", "10-20", "20-30", "30-40", "40-50", "50-60", "60-70", "70-80", "80-90", "90-100+"];

// ========== FILE I/O ==========
async function readCharactersFromJson() {
    try {
        return await fs.readJson(INPUT_FILE);
    } catch (err) {
        console.error("Erreur lecture fichier:", err);
        return [];
    }
}

async function saveCharactersToJson(characters) {
    await fs.writeJson(OUTPUT_FILE, characters, { spaces: 2 });
}

// ========== VALUE MATCHERS ==========

function matchStatus(statusStr) {
    return matchFromList(statusStr, STATUS);
}

function matchHairColor(hairStr) {
    return matchFromList(hairStr, HAIR_COLOR);
}

// ========== VALUE TRANSFORMERS ==========
function convertAgeToRange(ageStr) {
    if (!ageStr) return "";
    const ageMatch = ageStr.match(/\d+/);
    if (!ageMatch) return "";
    
    const age = parseInt(ageMatch[0]);
    const index = Math.min(Math.floor(age / 10), AGE_SCOPE.length - 1);
    return AGE_SCOPE[index];
}

function splitOccupation(occupationStr) {
    if (!occupationStr) return "";
    const words = occupationStr.split(/\s+/);
    const result = words.flatMap(word => word.split(/(?<=[a-z])(?=[A-Z])/));
    return result.join(" ");
}

// ========== STAND DATA EXTRACTORS ==========
async function fetchStandType(standName) {
    if (!standName) return "";
    
    try {
        const standUrl = buildUrl(standName);
        const $ = await fetchHtmlPage(standUrl);
        
        const infobox = $('.portable-infobox');
        if (!infobox.length) return "";
        
        let standTypeRaw = "";
        infobox.find('.pi-item').each((i, item) => {
            const label = $(item).find('.pi-data-label').text().trim().toLowerCase();
            if (label === "type" || label.includes("type")) {
                standTypeRaw = $(item).find('.pi-data-value').text()
                    .replace(/\[[^\]]*\]/g, "")
                    .replace(/\s+/g, " ")
                    .trim();
                return false;
            }
        });
        
        if (!standTypeRaw || standTypeRaw.toLowerCase() === "none" || standTypeRaw === "-") return "";
        return matchStandType(standTypeRaw);
    } catch {
        return "";
    }
}

// ========== CHARACTER DATA BUILDER ==========
async function getCharacterData(id, characterData) {
    const { name, stand, part, alignment } = characterData;
    
    const wikicode = await fetchWikicode(name);
    
    const statusRaw = extractField(wikicode, "status");
    const ageRaw = extractField(wikicode, "age");
    const hairRaw = extractField(wikicode, "hair");
    const occupationRaw = extractField(wikicode, "occupation");
    
    const status = matchStatus(statusRaw);
    const age = convertAgeToRange(ageRaw);
    const hair_color = matchHairColor(hairRaw);
    const occupation = splitOccupation(occupationRaw);
    const gender = extractField(wikicode, "gender");
    const nationality = extractField(wikicode, "nation");
    const birthday = extractField(wikicode, "birthday");
    const standType = stand ? await fetchStandType(stand) : "";
    const characterUrl = buildUrl(name);
    const imageUrl = await fetchAndDownloadImage(name, characterUrl, IMG_DIR);

    return new Character({
        id,
        name,
        imageUrl,
        status,
        stand: stand || null,
        standType,
        age,
        gender,
        nationality,
        hair_color,
        occupation,
        part: part || "",
        alignment: alignment || "",
        url: characterUrl
    });
}

// ========== MAIN SCRAPER ==========
async function scrapeCharacter(characterData, index, total) {
    try {
        const character = await getCharacterData(index + 1, characterData);
        console.log(`[${index + 1}/${total}] ${characterData.name} ✓`);
        return character.toJSON();
    } catch (err) {
        console.log(`[${index + 1}/${total}] ${characterData.name} ✗ ${err.message}`);
        return null;
    }
}

async function scrapeAll() {
    const characters = await readCharactersFromJson();
    console.log(`${characters.length} personnages trouvés`);
    console.log("----------------------------------------------------");

    const promises = characters.map((char, index) => 
        scrapeCharacter(char, index, characters.length)
    );
    const results = (await Promise.all(promises)).filter(Boolean);

    await saveCharactersToJson(results);
    console.log("----------------------------------------------------");
    console.log(`✓ ${results.length}/${characters.length} personnages sauvegardés dans ${OUTPUT_FILE}`);
}

await scrapeAll();
