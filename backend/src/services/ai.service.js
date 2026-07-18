"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDashboardInsights = exports.getKrishiSathiResponse = exports.getKrishiSathiHistory = void 0;
const groq_sdk_1 = __importDefault(require("groq-sdk"));
const AiInteraction_1 = require("../models/AiInteraction");
const User_1 = require("../models/User");
const weather_service_1 = require("./weather.service");
// Initialize Groq Client
const groq = new groq_sdk_1.default({ apiKey: process.env.GROQ_API_KEY || 'mock-key-for-dev' });
const getKrishiSathiHistory = async (userId) => {
    try {
        const history = await AiInteraction_1.AiInteraction.find({ userId })
            .sort({ createdAt: -1 })
            .limit(20);
        return history.reverse(); // Chronological order
    }
    catch (error) {
        console.error('Failed to fetch AI history:', error);
        return [];
    }
};
exports.getKrishiSathiHistory = getKrishiSathiHistory;
const getKrishiSathiResponse = async (userId, prompt, language = 'en') => {
    try {
        let responseText = '';
        // Fetch user location for weather context
        const user = await User_1.User.findById(userId);
        let weatherContext = '';
        if (prompt.toLowerCase().includes('weather') || prompt.toLowerCase().includes('rain') || prompt.toLowerCase().includes('mausam') || prompt.toLowerCase().includes('havaman')) {
            if (user && user.location && user.location.coordinates && user.location.coordinates.length >= 2) {
                const [lon, lat] = user.location.coordinates;
                const weatherRes = await (0, weather_service_1.getWeatherData)(lat, lon);
                if (weatherRes.success) {
                    weatherContext = `CURRENT WEATHER CONTEXT: Temp: ${weatherRes.data.current.temp}°C, Desc: ${weatherRes.data.current.description}. 5-Day forecast shows next day rain probability at ${weatherRes.data.forecast[0].rainChance}%.`;
                }
            }
            else {
                return "I don't have your farm location yet — please add it in your profile so I can give you accurate weather updates.";
            }
        }
        if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'mock-key-for-dev') {
            // Dev mode without key
            const isPrice = prompt.toLowerCase().includes('price');
            const isWeather = prompt.toLowerCase().includes('weather') || prompt.toLowerCase().includes('rain');
            if (isPrice) {
                responseText = "I'm sorry, but live market prices and APMC data are not currently available in this phase. I cannot predict crop prices at this time.";
            }
            else if (isWeather) {
                responseText = weatherContext
                    ? `Based on real data: ${weatherContext}`
                    : "I don't have your farm location yet — please add it in your profile.";
            }
            else {
                responseText = "I am KrishiSathi, your AI agricultural assistant. I can help you with real weather advisories and platform questions.";
            }
            await new Promise(r => setTimeout(r, 1200));
        }
        else {
            // Real Groq API Call - STRICT GROUNDING
            const systemInstruction = `You are KrishiSathi, an expert agricultural AI assistant for Indian farmers. 
CRITICAL RULES:
1. Respond concisely in ${language}.
2. If the user asks about crop prices or market trends, you MUST state that live market data is currently unavailable and you CANNOT provide price estimates. DO NOT GUESS OR HALLUCINATE PRICES.
3. If the user asks about the weather, ONLY use the following real weather data. DO NOT invent forecasts.
${weatherContext ? weatherContext : 'No weather data provided. If asked about weather, state that you do not have weather data.'}`;
            // Fetch chat history for context
            const history = await (0, exports.getKrishiSathiHistory)(userId);
            const messages = [
                { role: 'system', content: systemInstruction }
            ];
            // Add last 5 interactions to history to avoid token limits
            const recentHistory = history.slice(-5);
            for (const interaction of recentHistory) {
                if (interaction.inputText) {
                    messages.push({ role: 'user', content: interaction.inputText });
                }
                if (interaction.responseText) {
                    messages.push({ role: 'assistant', content: interaction.responseText });
                }
            }
            // Add current prompt
            messages.push({ role: 'user', content: prompt });
            const chatCompletion = await groq.chat.completions.create({
                messages: messages,
                model: 'llama-3.3-70b-versatile',
            });
            responseText = chatCompletion.choices[0]?.message?.content || "I'm sorry, I couldn't process that request.";
        }
        await AiInteraction_1.AiInteraction.create({
            userId,
            inputText: prompt,
            responseText: responseText,
            intent: 'advisory',
            language
        });
        return responseText;
    }
    catch (error) {
        console.error('Groq API Error:', error);
        throw new Error('Failed to fetch AI response');
    }
};
exports.getKrishiSathiResponse = getKrishiSathiResponse;
const generateDashboardInsights = async (userId) => {
    try {
        if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'mock-key-for-dev') {
            return "Ensure your crops are watered adequately this week. Market prices for tomatoes are currently stable.";
        }
        const user = await User_1.User.findById(userId);
        let weatherContext = '';
        if (user && user.location && user.location.coordinates && user.location.coordinates.length >= 2) {
            const [lon, lat] = user.location.coordinates;
            const weatherRes = await (0, weather_service_1.getWeatherData)(lat, lon);
            if (weatherRes.success) {
                weatherContext = `Temp: ${weatherRes.data.current.temp}°C, Desc: ${weatherRes.data.current.description}.`;
            }
        }
        const prompt = `Based on the following data, generate a single short (1-2 sentences) actionable insight for an Indian farmer.\nWeather: ${weatherContext || 'Unknown'}\nRecent activity: High demand for fresh produce.`;
        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: 'system', content: 'You are an agricultural advisor.' }, { role: 'user', content: prompt }],
            model: 'llama-3.3-70b-versatile',
        });
        return chatCompletion.choices[0]?.message?.content || "Market conditions are favorable for selling your current harvest.";
    }
    catch (error) {
        console.error('Failed to generate insights:', error);
        return "Market conditions are favorable for selling your current harvest.";
    }
};
exports.generateDashboardInsights = generateDashboardInsights;
