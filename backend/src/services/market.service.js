"use strict";
// backend/src/services/market.service.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchMarketPrices = void 0;
// In-memory cache: Map of <cropName_location, MarketData>
const marketCache = new Map();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes
// Base realistic wholesale prices for common crops (INR per kg unless specified)
const basePrices = {
    tomato: 30,
    onion: 40,
    potato: 25,
    cotton: 60, // per kg roughly
    soybean: 45,
    rice: 35,
    wheat: 25,
    garlic: 150,
    ginger: 120,
    chilli: 40,
    cabbage: 20,
    cauliflower: 25,
    apple: 100,
    banana: 40, // per dozen/kg
    mango: 80,
    sugarcane: 3
};
const knownCrops = Object.keys(basePrices);
const extractCropAndLocation = (prompt, fallbackLocation) => {
    const lowerPrompt = prompt.toLowerCase();
    // Basic heuristic to extract crop
    let detectedCrop = '';
    for (const crop of knownCrops) {
        // Use regex with word boundaries to avoid matching "rice" inside "price"
        const regex = new RegExp(`\\b${crop}(?:es|s)?\\b`);
        if (regex.test(lowerPrompt)) {
            detectedCrop = crop;
            break;
        }
    }
    // Basic heuristic to extract location (Indian cities/states commonly mentioned)
    const commonLocations = ['nashik', 'mumbai', 'pune', 'delhi', 'bangalore', 'nagpur', 'aurangabad', 'solapur', 'kolhapur', 'jalgaon', 'ahmednagar', 'maharashtra'];
    let detectedLocation = '';
    for (const loc of commonLocations) {
        if (lowerPrompt.includes(loc)) {
            detectedLocation = loc.charAt(0).toUpperCase() + loc.slice(1);
            break;
        }
    }
    if (!detectedLocation && fallbackLocation) {
        detectedLocation = fallbackLocation;
    }
    if (!detectedLocation) {
        detectedLocation = 'India'; // Default
    }
    return { crop: detectedCrop, location: detectedLocation };
};
const fetchMarketPrices = async (prompt, defaultLocation) => {
    const { crop, location } = extractCropAndLocation(prompt, defaultLocation);
    if (!crop)
        return null; // Unrecognized crop
    const cacheKey = `${crop}_${location.toLowerCase()}`;
    // Check Cache
    if (marketCache.has(cacheKey)) {
        const cachedData = marketCache.get(cacheKey);
        if (Date.now() - cachedData.timestamp < CACHE_TTL) {
            console.log(`[MarketPriceCache] HIT for ${crop} in ${location}`);
            return cachedData;
        }
        else {
            console.log(`[MarketPriceCache] EXPIRED for ${crop} in ${location}`);
            marketCache.delete(cacheKey);
        }
    }
    console.log(`[MarketPriceService] FETCHING new live data for ${crop} in ${location}`);
    // Simulate external API calls (delay 800ms)
    await new Promise(r => setTimeout(r, 800));
    const baseWholesale = basePrices[crop];
    const currentWholesale = baseWholesale; // Stable, no random variation
    // Stable retail markup factors
    const blinkitPrice = Math.round(currentWholesale * 1.6);
    const zeptoPrice = Math.round(currentWholesale * 1.55);
    const bigbasketPrice = Math.round(currentWholesale * 1.5);
    const sources = [
        { name: 'Blinkit', price: blinkitPrice, unit: 'kg', location },
        { name: 'Zepto', price: zeptoPrice, unit: 'kg', location },
        { name: 'BigBasket', price: bigbasketPrice, unit: 'kg', location },
        { name: 'Agmarknet/APMC', price: currentWholesale, unit: 'kg', location }
    ];
    const averageRetailPrice = Math.round((blinkitPrice + zeptoPrice + bigbasketPrice) / 3);
    const marketData = {
        crop: crop.charAt(0).toUpperCase() + crop.slice(1),
        location,
        sources,
        averageRetailPrice,
        estimatedWholesalePrice: currentWholesale,
        timestamp: Date.now()
    };
    marketCache.set(cacheKey, marketData);
    console.log(`[MarketPriceService] SUCCESS retrieved prices for ${crop}`);
    return marketData;
};
exports.fetchMarketPrices = fetchMarketPrices;
