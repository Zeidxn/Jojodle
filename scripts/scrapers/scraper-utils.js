import * as cheerio from "cheerio";
import path from "path";
import fs from "fs-extra";

// ========== CONFIGURATION ==========
export const BASE_URL = "https://jojo.fandom.com/wiki";
export const JOJOWIKI_URL = "https://jojowiki.com";

export const MAP_REPLACE_CHARS = {
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

export const STAND_TYPE = [
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

// ========== URL BUILDERS ==========
export function buildUrl(name) {
    const encodedName = name.split("").map(c => MAP_REPLACE_CHARS[c] || c).join("");
    return `${BASE_URL}/${encodedName}`;
}

// ========== HTTP FETCHERS ==========
export async function fetchHtmlPage(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const html = await response.text();
    return cheerio.load(html);
}

export async function fetchWikicode(name) {
    const url = `${buildUrl(name)}?action=edit`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const html = await response.text();
    const $ = cheerio.load(html);
    return $("#wpTextbox1").text() || "";
}

// ========== VALUE MATCHERS ==========
export function matchFromList(value, list) {
    if (!value) return "";
    const lowerValue = value.toLowerCase();
    for (const item of list) {
        if (lowerValue.includes(item.toLowerCase())) {
            return item;
        }
    }
    return "";
}

export function matchStandType(standTypeStr) {
    if (!standTypeStr) return "";
    const cleaned = standTypeStr.replace(/\bstand\b/gi, "").trim();
    return matchFromList(cleaned, STAND_TYPE);
}

// ========== IMAGE HANDLERS ==========
export function sanitizeFilename(name) {
    return name
        .replace(/[^a-zA-Z0-9_\-\.]/g, "_")
        .replace(/_+/g, "_")
        .replace(/^_|_$/g, "");
}

export async function downloadImage(imageUrl, filepath) {
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

export async function fetchAndDownloadImage(entityName, entityUrl, imgDir) {
    try {
        const $ = await fetchHtmlPage(entityUrl);
        
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
        const filename = sanitizeFilename(entityName).toLowerCase() + ext;
        const filepath = path.join(imgDir, filename);
        
        const relativePath = imgDir.includes('/stands') 
            ? `/assets/jjba/img/stands/${filename}`
            : `/assets/jjba/img/${filename}`;
        
        if (await fs.pathExists(filepath)) {
            return relativePath;
        }
        
        const success = await downloadImage(imageUrl, filepath);
        
        if (success) {
            return relativePath;
        }
        
        return "";
    } catch (err) {
        console.error(`Erreur récupération image pour ${entityName}:`, err.message);
        return "";
    }
}

// ========== WIKICODE EXTRACTORS ==========
export function cleanWikicodeValue(value) {
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

export function extractField(wikicode, field) {
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

// ========== STAND MANGA IMAGE FETCHER ==========
export async function fetchStandMangaImage(standName, imgDir) {
    try {
        // Encoder le nom pour l'URL jojowiki
        const encodedName = standName.split("").map(c => MAP_REPLACE_CHARS[c] || c).join("");
        const jojowikiUrl = `${JOJOWIKI_URL}/${encodedName}/fr`;
        
        const $ = await fetchHtmlPage(jojowikiUrl);
        
        // Trouver la section Manga
        let mangaImageUrl = "";
        
        // Chercher dans les tabbers pour trouver l'onglet Manga
        $('.tabber .tabbertab').each((i, tab) => {
            const tabTitle = $(tab).attr('title') || $(tab).attr('data-title') || "";
            if (tabTitle.toLowerCase().includes('manga')) {
                // Récupérer la première image dans cet onglet
                const img = $(tab).find('img').first();
                mangaImageUrl = img.attr('src') || img.attr('data-src') || "";
                return false; // break
            }
        });
        
        // Si pas trouvé dans tabber, chercher dans la galerie
        if (!mangaImageUrl) {
            $('.pi-item').each((i, item) => {
                const label = $(item).find('.pi-data-label').text().trim().toLowerCase();
                if (label === 'manga debut' || label === 'manga') {
                    const img = $(item).find('img').first();
                    mangaImageUrl = img.attr('src') || img.attr('data-src') || "";
                    return false;
                }
            });
        }
        
        // Fallback: chercher toute image avec "manga" dans le nom
        if (!mangaImageUrl) {
            $('img').each((i, img) => {
                const src = $(img).attr('src') || $(img).attr('data-src') || "";
                const alt = $(img).attr('alt') || "";
                if (src.toLowerCase().includes('manga') || alt.toLowerCase().includes('manga')) {
                    mangaImageUrl = src;
                    return false;
                }
            });
        }
        
        if (!mangaImageUrl) {
            console.log(`  ⚠️  Image manga non trouvée pour ${standName}, utilisation de l'image par défaut`);
            return "";
        }
        
        // Nettoyer l'URL
        mangaImageUrl = mangaImageUrl.startsWith("http") ? mangaImageUrl : `https:${mangaImageUrl}`;
        mangaImageUrl = mangaImageUrl
            .replace(/\/revision\/latest\/scale-to-width-down\/\d+/g, '/revision/latest')
            .replace(/\/smart\/width\/\d+\/height\/\d+/g, '')
            .split('?')[0];
        
        const ext = path.extname(mangaImageUrl).toLowerCase() || '.png';
        const filename = sanitizeFilename(standName).toLowerCase() + ext;
        const filepath = path.join(imgDir, filename);
        
        const relativePath = `/assets/jjba/img/stands/${filename}`;
        
        if (await fs.pathExists(filepath)) {
            return relativePath;
        }
        
        const success = await downloadImage(mangaImageUrl, filepath);
        
        if (success) {
            console.log(`  ✓ Image manga téléchargée depuis jojowiki.com`);
            return relativePath;
        }
        
        return "";
    } catch (err) {
        console.error(`  ✗ Erreur récupération image manga pour ${standName}:`, err.message);
        return "";
    }
}
