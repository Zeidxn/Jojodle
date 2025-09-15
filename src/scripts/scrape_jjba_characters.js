import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs-extra";
import path from "path";
import pLimit from "p-limit";

const BASE_URL = "https://jojowiki.com";
const INPUT_FILE = path.resolve("../../public/assets/jjba/characters.txt");
const OUTPUT_FILE = path.resolve("../../public/assets/jjba/characters.json");
const OUTPUT_DIR = path.resolve("../../public/assets/jjba/img");
const CONCURRENCY = 40;
const SLEEP_BETWEEN = 200;

const PARTS_MAP = {
    "Part 1": "Phantom Blood",
    "Part 2": "Battle Tendency",
    "Part 3": "Stardust Crusaders",
    "Part 4": "Diamond is Unbreakable",
    "Part 5": "Vento Aureo",
    "Part 6": "Stone Ocean",
    "Part 7": "Steel Ball Run",
    "Part 8": "Jojolion",
    "Part 9": "The JOJOLands",
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

function extractNumber(str, unit = null, opts = { preferFirst: true }) {
    if (!str) return null;
    if (unit) {
        const re = new RegExp("(\\d+(?:\\.\\d+)?)\\s*" + unit + "\\b", "i");
        const m = String(str).match(re);
        if (m && m[1]) return `${m[1]} ${unit}`;
        const first = String(str).match(/-?\d+(?:\.\d+)?/);
        return first ? `${first[0]} ${unit}` : null;
    }
    const nums = String(str).match(/-?\d+(?:\.\d+)?/g);
    if (!nums) return null;
    return opts.preferFirst ? String(Number(nums[0])) : String(Math.max(...nums.map(Number)));
}

function extractFromInfobox($) {
    const infobox = {};
    $(".portable-infobox .pi-data").each((_, el) => {
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
    )?.replace(/&amp;/g, "&");
}

function parseCharacterPage(html, url) {
    const $ = cheerio.load(html);
    const name = $("h1").first().text().trim();
    const infobox = extractFromInfobox($);
    const imageUrl = extractImage($);

    const age = extractNumber(infobox["Age"], null, { preferFirst: true });
    const height = extractNumber(infobox["Height"], "cm");
    const weight = extractNumber(infobox["Weight"], "kg");

    let stand = infobox["Stand"] || null;
    let standType = null;

    const standHeader = $("span.mw-headline")
        .filter((_, el) => $(el).text().trim() === "Stand")
        .closest("h2, h3");

    if (standHeader.length) {
        let el = standHeader.next();
        while (el.length && !el.is("h2, h3")) {
            el.find("a").each((_, a) => {
                const href = $(a).attr("href");
                const text = $(a).text().trim();
                if (href?.includes("Stand_Types") && !standType) {
                    standType = text.split(",")[0].trim();
                } else if (!stand) {
                    stand = text;
                }
            });
            el = el.next();
        }
    }

    let gender = infobox["Gender"] || null;
    if (!gender) {
        gender =
            $(".portable-infobox .pi-data")
                .filter((_, el) => $(el).find(".pi-data-label").text().trim() === "Gender")
                .find("img")
                .first()
                .attr("alt")?.trim() || null;
    }

    let parts = [];
    $(".toctext").each((_, el) => {
        const text = $(el).text().trim();
        if (Object.values(PARTS_MAP).includes(text) && !parts.includes(text)) parts.push(text);
    });
    if (parts.length > 0) parts = [parts[0]];

    return {
        name,
        imageUrl,
        stand,
        standType,
        age,
        gender,
        height,
        weight,
        nationality: infobox["Nationality"] || null,
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
