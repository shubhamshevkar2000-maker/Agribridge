import Groq from 'groq-sdk';
import { AiInteraction } from '../models/AiInteraction';
import { User } from '../models/User';
import { getWeatherData } from './weather.service';
import { fetchMarketPrices } from './market.service';

// Initialize Groq Client
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || 'mock-key-for-dev' });

export const getKrishiSathiHistory = async (userId: string) => {
  try {
    const history = await AiInteraction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(20);
    return history.reverse(); // Chronological order
  } catch (error) {
    console.error('Failed to fetch AI history:', error);
    return [];
  }
};

export const getKrishiSathiResponse = async (userId: string, prompt: string, language: string = 'en') => {
  try {
    console.log('[DEBUG] getKrishiSathiResponse CALLED with prompt:', prompt);
    let responseText = '';
    
    // Fetch user location for weather context
    const user = await User.findById(userId);
    let weatherContext = '';
    
    if (prompt.toLowerCase().includes('weather') || prompt.toLowerCase().includes('rain') || prompt.toLowerCase().includes('mausam') || prompt.toLowerCase().includes('havaman')) {
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

    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'mock-key-for-dev') {
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
      // Fetch Market Data if requested
      let marketContextStr = '';
      const isPriceQuery = prompt.toLowerCase().includes('price') || prompt.toLowerCase().includes('rate') || prompt.toLowerCase().includes('market') || prompt.toLowerCase().includes('mandi');
      
      if (isPriceQuery) {
        console.log('[AI Service] Price query detected. Fetching market data...');
        const userLocation = user?.location?.city || user?.location?.district || undefined;
        const marketData = await fetchMarketPrices(prompt, userLocation);
        if (marketData) {
          console.log('[AI Service] Market data retrieved successfully:', JSON.stringify(marketData));
          marketContextStr = `
LIVE MARKET DATA CONTEXT:
Crop: ${marketData.crop}
Location: ${marketData.location}
Sources:
${marketData.sources.map(s => `- ${s.name} (${s.location}): ₹${s.price}/${s.unit}`).join('\n')}
Average Retail Price: ₹${marketData.averageRetailPrice}/${marketData.sources[0].unit}
Estimated Wholesale/Farmer Price: ₹${marketData.estimatedWholesalePrice}/${marketData.sources[0].unit}

INSTRUCTIONS FOR MARKET QUERY:
Do NOT simply list the raw prices. Synthesize this data into a natural response. Mention the retail sources (Blinkit, Zepto, BigBasket) and average retail price. Then mention the estimated wholesale/farmer price. Explain briefly why retail prices are higher than farmer prices (transportation, storage, commissions). Finally, advise the user to verify exact wholesale rates with their nearest APMC or Agmarknet. 
DO NOT output "Live market data is unavailable".`;
        } else {
          console.log('[AI Service] Market data fetch returned no results (unrecognized crop).');
          marketContextStr = `
LIVE MARKET DATA CONTEXT: 
Data could not be retrieved for this crop/query.

INSTRUCTIONS FOR MARKET QUERY:
Since no specific crop was recognized in the user's query, do NOT say "Live market data is unavailable". Instead, politely ask the user: "Which crop would you like to check the price for?" and also ask for their city or district if it's not in their profile. If they did specify a crop but it's not a common one, provide a helpful general estimate based on recent historical trends, and advise them to verify today's exact price with their local APMC or eNAM.`;
        }
      }

      // Real Groq API Call
      const systemInstruction = `You are KrishiSathi, an expert agricultural AI assistant for Indian farmers. 
CRITICAL RULES:
1. Respond concisely in ${language}.
2. If the user asks about the weather, ONLY use the following real weather data. DO NOT invent forecasts.
${weatherContext ? weatherContext : 'No weather data provided. If asked about weather, state that you do not have weather data.'}
${marketContextStr}`;
      
      // Fetch chat history for context
      const history = await getKrishiSathiHistory(userId);
      const messages: any[] = [
        { role: 'system', content: systemInstruction }
      ];

      // Add last 5 interactions to history to avoid token limits
      const recentHistory = history.slice(-5);
      for (const interaction of recentHistory) {
        if (interaction.inputText && interaction.inputText.trim()) {
          messages.push({ role: 'user', content: interaction.inputText.trim() });
        }
        if (interaction.responseText && interaction.responseText.trim()) {
          messages.push({ role: 'assistant', content: interaction.responseText.trim() });
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

    await AiInteraction.create({
      userId,
      inputText: prompt,
      responseText: responseText,
      intent: 'advisory',
      language
    });

    return responseText;
  } catch (error: any) {
    console.error('Groq API Error:', error);
    throw new Error(error.message || 'Failed to fetch AI response');
  }
};

export const generateDashboardInsights = async (userId: string) => {
  try {
    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'mock-key-for-dev') {
      return "Ensure your crops are watered adequately this week. Market prices for tomatoes are currently stable.";
    }
    
    const user = await User.findById(userId);
    let weatherContext = '';
    if (user && user.location && user.location.coordinates && user.location.coordinates.length >= 2) {
      const [lon, lat] = user.location.coordinates;
      const weatherRes = await getWeatherData(lat, lon);
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
  } catch (error) {
    console.error('Failed to generate insights:', error);
    return "Market conditions are favorable for selling your current harvest.";
  }
};
