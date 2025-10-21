import path from "path";
import fs from "fs-extra";
import * as cheerio from "cheerio";
import Character from "./character.model.js";

// ========== CONFIGURATION ==========
const BASE_URL = "https://jojo.fandom.com/wiki";
const INPUT_FILE = path.resolve(process.cwd(), "public/assets/jjba/jojo_characters.json");
const OUTPUT_FILE = path.resolve(process.cwd(), "public/assets/jjba/characters.json");
const IMG_DIR = path.resolve(process.cwd(), "public/assets/jjba/img");

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

const STATUS = ["Alive", "Deceased", "Retired", "Unknown"];
const HAIR_COLOR = ["Blond", "Black", "Brown", "Red", "White", "Gray", "Blue", "Green", "Pink", "Purple", "Orange", "Yellow", "Silver", "Bald"];
const AGE_SCOPE = ["0-10", "10-20", "20-30", "30-40", "40-50", "50-60", "60-70", "70-80", "80-90", "90-100+"];
const STAND_TYPE = [
    "Close-Range",
    "Long-Distance",
    "Automatic",
    "Range Irrelevant",
    "Natural Humanoid",
    "Artificial Humanoid",
    "Natural Non-Humanoid",
    "Artificial Non-Humanoid",
    "Phenomenon",
    "Bound",
    "Colony",
    "Evolved",
    "Sentient",
    "Shared",
    "Ultimate"
];

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

// ========== URL BUILDERS ==========
function buildCharacterUrl(name) {
    const encodedName = name.split("").map(c => MAP_REPLACE_CHARS[c] || c).join("");
    return `${BASE_URL}/${encodedName}`;
}

function buildStandUrl(standName) {
    return buildCharacterUrl(standName);
}

// ========== HTTP FETCHERS ==========
async function fetchWikicode(name) {
    const url = `${buildCharacterUrl(name)}?action=edit`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const html = await response.text();
    const $ = cheerio.load(html);
    return $("#wpTextbox1").text() || "";
}

async function fetchHtmlPage(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const html = await response.text();
    return cheerio.load(html);
}

// ========== WIKICODE EXTRACTORS ==========
function cleanWikicodeValue(value) {
    return value
        .replace(/<ref[^>]*>.*?(<\/ref>|$)/gi, "")
        .replace(/<ref[^>]*$/gi, "")
        .replace(/<small[^>]*>.*?<\/small>/gi, "")
        .replace(/<[^>]*$/g, "")
        .replace(/<[^>]+>/g, "")
        .replace(/{{[^}]*$/g, "")
        .replace(/{{[^}]+}}/g, "")
        .replace(/{[^}]*$/g, "")
        .replace(/{[^}]+}/g, "")
        .replace(/\[\[([^|\]]*\|)?([^\]]+)\]\]/g, "$2")
        .replace(/\[[^\]]*$/g, "")
        .replace(/\[[^\]]+\]/g, "")
        .replace(/''+/g, "")
        .replace(/<br\s*\/?>/gi, "")
        .replace(/\s+/g, " ")
        .trim();
}

function extractField(wikicode, field) {
    const regex = new RegExp(`\\|\\s*${field}\\s*=([^\\n|]*)`, "i");
    const match = wikicode.match(regex);

    if (!match) return "";
    
    let value = match[1].trim();
    if (!value || value.startsWith("|")) return "";
    
    value = cleanWikicodeValue(value);
    value = value.split(/,|\(|\//)[0].trim();
    
    if (!value || value.toLowerCase() === "none" || value === "-") return "";
    return value;
}

// ========== VALUE MATCHERS ==========
function matchFromList(value, list) {
    if (!value) return "";
    const lowerValue = value.toLowerCase();
    for (const item of list) {
        if (lowerValue.includes(item.toLowerCase())) {
            return item;
        }
    }
    return "";
}

function matchStatus(statusStr) {
    return matchFromList(statusStr, STATUS);
}

function matchHairColor(hairStr) {
    return matchFromList(hairStr, HAIR_COLOR);
}

function matchStandType(standTypeStr) {
    if (!standTypeStr) return "";
    const cleaned = standTypeStr.replace(/\bstand\b/gi, "").trim();
    return matchFromList(cleaned, STAND_TYPE);
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
        const standUrl = buildStandUrl(standName);
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

// ========== IMAGE EXTRACTORS ==========
function sanitizeFilename(name) {
    return name
        .replace(/[^a-zA-Z0-9_\-\.]/g, "_")
        .replace(/_+/g, "_")
        .replace(/^_|_$/g, "");
}

async function downloadImage(imageUrl, filepath) {
    try {
        const response = await fetch(imageUrl);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        await fs.ensureDir(path.dirname(filepath));
        await fs.writeFile(filepath, buffer);
        
        return true;
    } catch (err) {
        console.error(`Erreur téléchargement image:`, err.message);
        return false;
    }
}

async function fetchAndDownloadCharacterImage(characterName) {
    try {
        const characterUrl = buildCharacterUrl(characterName);
        const $ = await fetchHtmlPage(characterUrl);
        
        const infobox = $('.portable-infobox');
        if (!infobox.length) return "";
        
        let imageUrl = infobox.find('.pi-image-thumbnail').first().attr('src');
        
        if (!imageUrl) {
            imageUrl = infobox.find('img').first().attr('src');
        }
        
        if (!imageUrl) return "";
        
        imageUrl = imageUrl.startsWith("http") ? imageUrl : `https:${imageUrl}`;
        imageUrl = imageUrl
            .replace(/\/revision\/latest\/scale-to-width-down\/\d+/g, '/revision/latest')
            .replace(/\/smart\/width\/\d+\/height\/\d+/g, '')
            .split('?')[0];
        
        const ext = path.extname(imageUrl).toLowerCase() || '.png';
        const filename = sanitizeFilename(characterName).toLowerCase() + ext;
        const filepath = path.join(IMG_DIR, filename);
        
        if (await fs.pathExists(filepath)) {
            return `/assets/jjba/img/${filename}`;
        }
        
        const success = await downloadImage(imageUrl, filepath);
        
        if (success) {
            return `/assets/jjba/img/${filename}`;
        }
        
        return "";
    } catch (err) {
        console.error(`Erreur récupération image pour ${characterName}:`, err.message);
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
    const imageUrl = await fetchAndDownloadCharacterImage(name);

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
        url: buildCharacterUrl(name)
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
