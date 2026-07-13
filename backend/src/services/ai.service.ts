import { GoogleGenAI } from '@google/genai';
import { AiInteraction } from '../models/AiInteraction';

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'mock-key-for-dev' });

export const getKrishiSathiResponse = async (userId: string, prompt: string, language: string = 'en') => {
  try {
    let responseText = '';
    
    // In dev without a real key, we'll return a smart mock response
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'mock-key-for-dev') {
      const isPrice = prompt.toLowerCase().includes('price');
      const isWeather = prompt.toLowerCase().includes('weather') || prompt.toLowerCase().includes('rain');
      
      if (isPrice) {
        responseText = "Based on current APMC data for your region, Tomato prices are trending upwards by 5%. Expected clearing price is ₹2,300/qtl.";
      } else if (isWeather) {
        responseText = "Meteorological data suggests heavy rainfall in your district over the next 48 hours. It is advisable to delay any open-field harvesting.";
      } else {
        responseText = "I am KrishiSathi, your AI agricultural assistant. I can help you with real-time market prices, weather advisories, and crop disease detection.";
      }
      
      // Simulate network delay
      await new Promise(r => setTimeout(r, 1200));
    } else {
      // Real Gemini API Call
      const systemInstruction = `You are KrishiSathi, an expert agricultural AI assistant for Indian farmers. Respond concisely in ${language}.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { systemInstruction }
      });
      
      responseText = response.text || "I'm sorry, I couldn't process that request.";
    }

    // Log Interaction to Database
    await AiInteraction.create({
      userId,
      prompt,
      response: responseText,
      module: 'advisory',
      language
    });

    return responseText;
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('Failed to fetch AI response');
  }
};
