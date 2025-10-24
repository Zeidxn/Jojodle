import path from "path";
import fs from "fs-extra";
import Stand from "../../src/models/Stand.js";
import {
    buildUrl,
    fetchHtmlPage,
    matchStandType,
    fetchAndDownloadImage
} from "./scraper-utils.js";

// ========== CONFIGURATION ==========
const INPUT_FILE = path.resolve(process.cwd(), "public/assets/jjba/characters.json");
const OUTPUT_FILE = path.resolve(process.cwd(), "public/assets/jjba/stands.json");
const IMG_DIR = path.resolve(process.cwd(), "public/assets/jjba/img/stands");

// ========== FILE I/O ==========
async function readCharactersFromJson() {
    try {
        return await fs.readJson(INPUT_FILE);
    } catch (err) {
        console.error("Erreur lecture fichier:", err);
        return [];
    }
}

async function saveStandsToJson(stands) {
    await fs.writeJson(OUTPUT_FILE, stands, { spaces: 2 });
}

// ========== STAND DATA EXTRACTORS ==========
function cleanStatValue(value) {
    return value
        .replace(/<[^>]+>/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .toUpperCase();
}

async function fetchStandData(standName, userName, part) {
    if (!standName) return null;
    
    try {
        const standUrl = buildUrl(standName);
        const $ = await fetchHtmlPage(standUrl);
        
        const infobox = $('.portable-infobox');
        if (!infobox.length) return null;
        
        // Extraire le type de Stand
        let standType = "";
        infobox.find('.pi-item').each((i, item) => {
            const label = $(item).find('.pi-data-label').text().trim().toLowerCase();
            if (label === "type" || label.includes("type")) {
                standType = $(item).find('.pi-data-value').text()
                    .replace(/\[[^\]]*\]/g, "")
                    .replace(/\s+/g, " ")
                    .trim();
                return false;
            }
        });
        
        standType = matchStandType(standType);
        
        // Extraire les statistiques du Stand
        const stats = {
            destructivePower: "",
            speed: "",
            range: "",
            persistence: "",
            precision: "",
            developmentPotential: ""
        };
        
        const statsSection = infobox.find('.pi-horizontal-group');
        if (statsSection.length) {
            const headers = [];
            statsSection.find('thead th').each((i, th) => {
                const dataSource = $(th).attr('data-source');
                headers.push(dataSource);
            });
            
            statsSection.find('tbody td').each((i, td) => {
                const dataSource = $(td).attr('data-source');
                const value = cleanStatValue($(td).text());
                
                if (dataSource === 'destpower') stats.destructivePower = value;
                else if (dataSource === 'speed') stats.speed = value;
                else if (dataSource === 'range') stats.range = value;
                else if (dataSource === 'stamina' || dataSource === 'persistence') stats.persistence = value;
                else if (dataSource === 'precision') stats.precision = value;
                else if (dataSource === 'learning' || dataSource === 'devpotential') stats.developmentPotential = value;
            });
        }
        
        // Extraire l'image du Stand
        const localImagePath = await fetchAndDownloadImage(standName, standUrl, IMG_DIR);
        
        return {
            type: standType,
            imageUrl: localImagePath,
            ...stats,
            user: userName,
            part: part,
            url: standUrl
        };
        
    } catch (err) {
        console.error(`Erreur récupération Stand ${standName}:`, err.message);
        return null;
    }
}

// ========== MAIN SCRAPER ==========
async function scrapeStand(character, index, total) {
    try {
        if (!character.stand) {
            return null;
        }
        
        const standData = await fetchStandData(character.stand, character.name, character.part);
        
        if (!standData) {
            console.log(`[${index + 1}/${total}] ${character.stand} (${character.name}) ✗ Pas de données`);
            return null;
        }
        
        const stand = new Stand({
            id: index + 1,
            name: character.stand,
            imageUrl: standData.imageUrl,
            type: standData.type,
            destructivePower: standData.destructivePower,
            speed: standData.speed,
            range: standData.range,
            persistence: standData.persistence,
            precision: standData.precision,
            developmentPotential: standData.developmentPotential,
            user: standData.user,
            part: standData.part,
            url: standData.url
        });
        
        console.log(`[${index + 1}/${total}] ${character.stand} (${character.name}) ✓`);
        return stand.toJSON();
    } catch (err) {
        console.log(`[${index + 1}/${total}] ${character.stand} (${character.name}) ✗ ${err.message}`);
        return null;
    }
}

async function scrapeAll() {
    const characters = await readCharactersFromJson();
    const charactersWithStands = characters.filter(char => char.stand);
    
    console.log(`${charactersWithStands.length} personnages avec Stand trouvés`);
    console.log("----------------------------------------------------");

    const promises = charactersWithStands.map((char, index) => 
        scrapeStand(char, index, charactersWithStands.length)
    );
    const results = (await Promise.all(promises)).filter(Boolean);

    // Dédupliquer les Stands (certains sont partagés)
    const uniqueStands = [];
    const standNames = new Set();
    
    for (const stand of results) {
        if (!standNames.has(stand.name)) {
            standNames.add(stand.name);
            uniqueStands.push(stand);
        }
    }

    await saveStandsToJson(uniqueStands);
    console.log("----------------------------------------------------");
    console.log(`✓ ${uniqueStands.length} Stands uniques sauvegardés dans ${OUTPUT_FILE}`);
}

await scrapeAll();
