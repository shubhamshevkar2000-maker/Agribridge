import { GoogleGenAI } from '@google/genai';
import { AiInteraction } from '../models/AiInteraction';
import { User } from '../models/User';
import { getWeatherData } from './weather.service';

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'mock-key-for-dev' });

export const getKrishiSathiResponse = async (userId: string, prompt: string, language: string = 'en') => {
  try {
    let responseText = '';
    
    // Fetch user location for weather context
    const user = await User.findById(userId);
    let weatherContext = '';
    
    if (prompt.toLowerCase().includes('weather') || prompt.toLowerCase().includes('rain')) {
      if (user && user.location && user.location.coordinates && user.location.coordinates.length >= 2) {
        const [lon, lat] = user.location.coordinates;
        const weatherRes = await getWeatherData(lat, lon);
        if (weatherRes.success) {
          weatherContext = `CURRENT WEATHER CONTEXT: Temp: ${weatherRes.data.current.temp}°C, Desc: ${weatherRes.data.current.description}. 5-Day forecast shows next day rain probability at ${weatherRes.data.forecast[0].rainChance}%.`;
        }
      } else {
        return "I don't have your farm location yet — please add it in your profile so I can give you accurate weather updates.";
      }
    }
    
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'mock-key-for-dev') {
      // Dev mode without key
      const isPrice = prompt.toLowerCase().includes('price');
      const isWeather = prompt.toLowerCase().includes('weather') || prompt.toLowerCase().includes('rain');
      
      if (isPrice) {
        responseText = "I'm sorry, but live market prices and APMC data are not currently available in this phase. I cannot predict crop prices at this time.";
      } else if (isWeather) {
        responseText = weatherContext 
          ? `Based on real data: ${weatherContext}`
          : "I don't have your farm location yet — please add it in your profile.";
      } else {
        responseText = "I am KrishiSathi, your AI agricultural assistant. I can help you with real weather advisories and platform questions.";
      }
      
      await new Promise(r => setTimeout(r, 1200));
    } else {
      // Real Gemini API Call - STRICT GROUNDING
      const systemInstruction = `You are KrishiSathi, an expert agricultural AI assistant for Indian farmers. 
CRITICAL RULES:
1. Respond concisely in ${language}.
2. If the user asks about crop prices or market trends, you MUST state that live market data is currently unavailable and you CANNOT provide price estimates. DO NOT GUESS OR HALLUCINATE PRICES.
3. If the user asks about the weather, ONLY use the following real weather data. DO NOT invent forecasts.
${weatherContext ? weatherContext : 'No weather data provided. If asked about weather, state that you do not have weather data.'}`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { systemInstruction }
      });
      
      responseText = response.text || "I'm sorry, I couldn't process that request.";
    }

    await AiInteraction.create({
      userId,
      inputText: prompt,
      responseText: responseText,
      intent: 'advisory',
      language
    });

    return responseText;
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('Failed to fetch AI response');
  }
};
