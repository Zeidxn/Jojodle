import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs-extra";
import path from "path";
import pLimit from "p-limit";

const BASE_URL = "https://jjba.fandom.com/fr/wiki";
const INPUT_FILE = path.resolve("../../public/assets/jjba/characters.txt");
const OUTPUT_FILE = path.resolve("../../public/assets/jjba/characters.json");
const OUTPUT_DIR = path.resolve("../../public/assets/jjba/img");
const CONCURRENCY = 20;
const SLEEP_BETWEEN = 200;

const PARTS_MAP = {
    "Partie 1": "Phantom Blood",
    "Partie 2": "Battle Tendency",
    "Partie 3": "Stardust Crusaders",
    "Partie 4": "Diamond is Unbreakable",
    "Partie 5": "Vento Aureo",
    "Partie 6": "Stone Ocean",
    "Partie 7": "Steel Ball Run",
    "Partie 8": "Jojolion",
    "Partie 9": "The JOJOLands",
};

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

async function fetchHtml(url) {
    const res = await axios.get(url, {
        headers: { "User-Agent": "Mozilla/5.0 (JJBA-scraper)" },
        timeout: 20000,
    });
    return res.data;
}

async function downloadImage(url, filename) {
    if (!url) return null;
    try {
        const ext = path.extname(new URL(url).pathname).split("?")[0] || ".jpg";
        const safeName = filename.replace(/[^a-z0-9_-]/gi, "_").toLowerCase();
        const localPath = path.join(OUTPUT_DIR, safeName + ext);
        await fs.ensureDir(OUTPUT_DIR);
        if (await fs.pathExists(localPath)) return "../..//assets/jjba/img/" + path.basename(localPath);
        const res = await axios.get(url, { responseType: "arraybuffer" });
        await fs.writeFile(localPath, res.data);
        return "../..//assets/jjba/img/" + path.basename(localPath);
    } catch (err) {
        console.error("Erreur téléchargement image :", url, err.message);
        return null;
    }
}

function normalizeDigitSpacing(str) {
    if (!str) return str;
    // Supprime les espaces (y compris NBSP) entre chiffres : "92 000" -> "92000"
    return String(str).replace(/(\d)[ \u00A0](?=\d)/g, "$1");
}

function extractFromInfobox($) {
    const infobox = {};
    $(".portable-infobox .pi-item").each((_, el) => {
        const label = $(el).find(".pi-data-label").text().trim();
        let value = $(el).find(".pi-data-value").text().trim().replace(/\[\d+\]/g, "");
        if (label && value) infobox[label] = value;
    });
    return infobox;
}

function extractImage($) {
    return (
        $(".portable-infobox .pi-image img").attr("src") ||
        $(".portable-infobox .pi-image img").attr("data-src") ||
        $("meta[property='og:image']").attr("content") ||
        null
    );
}

function isIndexInsideParentheses(index, str) {
    if (index == null || !str) return false;
    let depth = 0;
    for (let i = 0; i < index; i++) {
        if (str[i] === "(") depth++;
        if (str[i] === ")") {
            if (depth > 0) depth--;
        }
    }
    return depth > 0;
}

function cleanAge(rawAge) {
    if (!rawAge) return null;
    let s = normalizeDigitSpacing(String(rawAge));
    const regex = /-?\d+(?:[.,]\d+)?/g;
    const matches = [];
    let m;
    while ((m = regex.exec(s)) !== null) {
        matches.push({ val: Number(m[0].replace(",", ".")), idx: m.index });
    }
    if (!matches.length) return null;
    // préférer les nombres hors parenthèses
    const outside = matches.filter((mm) => !isIndexInsideParentheses(mm.idx, s));
    const chosen = (outside.length ? outside : matches).map((mm) => mm.val);
    if (!chosen.length) return null;
    // prendre la valeur maximale (âge "le plus âgé" / actuel)
    const max = Math.max(...chosen);
    return String(Math.round(max));
}

function extractNumberWithUnit(raw, unit = null) {
    if (!raw) return null;
    let s = normalizeDigitSpacing(String(raw));
    if (unit) {
        const re = new RegExp("(-?\\d+(?:[.,]\\d+)?)\\s*" + unit.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"), "i");
        const m = s.match(re);
        if (m && m[1]) {
            const num = Number(m[1].replace(",", "."));
            return unit === "cm" ? `${Math.round(num)} ${unit}` : `${num} ${unit}`;
        }
        // fallback : take first numeric token and append unit
        const first = s.match(/-?\d+(?:[.,]\d+)?/);
        if (first) {
            const num = Number(first[0].replace(",", "."));
            return unit === "cm" ? `${Math.round(num)} ${unit}` : `${num} ${unit}`;
        }
        return null;
    } else {
        // no unit: return first numeric token by default
        const all = s.match(/-?\d+(?:[.,]\d+)?/g);
        if (!all) return null;
        return String(Number(all[0].replace(",", ".")));
    }
}

function getInfoboxValueCaseInsensitive(infobox, $, keys) {
    for (const k of keys) {
        // direct key match
        for (const label in infobox) {
            if (label.trim().toLowerCase() === k.trim().toLowerCase()) {
                const v = infobox[label];
                if (v && String(v).trim() !== "") return v;
            }
        }
    }
    // fallback: search DOM nodes in infobox for a matching label and try img alt or value text
    const rootItems = $(".portable-infobox .pi-item");
    for (const k of keys) {
        const found = rootItems.filter((_, el) => {
            const lab = $(el).find(".pi-data-label").text().trim();
            return lab && lab.toLowerCase() === k.toLowerCase();
        }).first();
        if (found && found.length) {
            const imgAlt = found.find(".pi-data-value img").first().attr("alt");
            if (imgAlt && String(imgAlt).trim() !== "") return String(imgAlt).trim();
            const txt = found.find(".pi-data-value").text().trim().replace(/\[\d+\]/g, "");
            if (txt) return txt;
        }
    }
    return null;
}

function parseCharacterPage(html, url) {
    const $ = cheerio.load(html);
    const name = $("h1").first().text().trim();
    const infobox = extractFromInfobox($);
    const imageUrl = extractImage($);

    const age = cleanAge(infobox["Âge"] || infobox["Age"] || null);
    const height = extractNumberWithUnit(infobox["Taille"] || infobox["Height"] || null, "cm");
    const weight = extractNumberWithUnit(infobox["Poids"] || infobox["Weight"] || null, "kg");

    const gender = getInfoboxValueCaseInsensitive(infobox, $, ["Sexe", "Genre", "Sex", "Gender"]);
    const nationality = getInfoboxValueCaseInsensitive(infobox, $, ["Nationalité", "Nationality", "Nation"]);

    let stand = infobox["Stand"] || null;
    let standType = infobox["Type de Stand"] || infobox["Stand type"] || infobox["Stand type(s)"] || null;

    const partsFound = [];
    $(".mw-headline, .toctext").each((_, el) => {
        const text = $(el).text().trim();
        const found = Object.values(PARTS_MAP).find((p) => p === text);
        if (found && !partsFound.includes(found)) partsFound.push(found);
    });
    const parts = partsFound.length ? [partsFound[0]] : [];

    return {
        name,
        imageUrl,
        stand,
        standType,
        age,
        gender,
        height,
        weight,
        nationality,
        parts,
        source: url,
    };
}

function nameToUrl(name) {
    return `${BASE_URL}/${encodeURIComponent(name.replace(/\s+/g, "_"))}`;
}

async function scrapeCharactersFromFile() {
    const allChars = [];
    const seenNames = new Set();
    const limit = pLimit(CONCURRENCY);

    const names = (await fs.readFile(INPUT_FILE, "utf-8"))
        .split("\n")
        .map((n) => n.trim())
        .filter(Boolean);

    const tasks = names.map((name) =>
        limit(async () => {
            if (seenNames.has(name)) return;
            try {
                const charUrl = nameToUrl(name);
                const charHtml = await fetchHtml(charUrl);
                const charData = parseCharacterPage(charHtml, charUrl);
                const localImage = await downloadImage(charData.imageUrl, charData.name);
                allChars.push({
                    id: charData.name.toLowerCase().replace(/[^a-z0-9]+/g, "_"),
                    ...charData,
                    image: localImage,
                });
                seenNames.add(charData.name);
                console.log("Scrapé :", charData.name);
                await sleep(SLEEP_BETWEEN);
            } catch (e) {
                console.error("Erreur personnage :", name, e.message);
            }
        })
    );

    await Promise.all(tasks);
    return allChars;
}

async function main() {
    try {
        const characters = await scrapeCharactersFromFile();
        await fs.ensureDir(path.dirname(OUTPUT_FILE));
        await fs.writeJson(OUTPUT_FILE, characters, { spaces: 2 });
        console.log(`Fichier JSON généré : ${OUTPUT_FILE} (${characters.length} persos)`);
    } catch (e) {
        console.error("Erreur fatale :", e);
    }
}

main();
