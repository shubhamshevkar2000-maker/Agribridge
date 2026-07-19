"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDashboardInsights = exports.getKrishiSathiResponse = exports.getKrishiSathiHistory = void 0;
const groq_sdk_1 = __importDefault(require("groq-sdk"));
const AiInteraction_1 = require("../models/AiInteraction");
const User_1 = require("../models/User");
const Crop_1 = require("../models/Crop");
const Auction_1 = require("../models/Auction");
const Order_1 = require("../models/Order");
const Delivery_1 = require("../models/Delivery");
const Loan_1 = require("../models/Loan");
const weather_service_1 = require("./weather.service");
const market_service_1 = require("./market.service");
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
        console.log('[DEBUG] getKrishiSathiResponse CALLED with prompt:', prompt);
        let responseText = '';
        // Fetch user details
        const user = await User_1.User.findById(userId);
        if (!user) {
            return "User not found. Please log in again.";
        }
        const userRole = user.role;
        // Initialize module contexts
        let weatherContext = '';
        let marketplaceContext = '';
        let logisticsContext = '';
        let auctionContext = '';
        let inventoryContext = '';
        let loanContext = '';
        const lowerPrompt = prompt.toLowerCase();
        // 1. Weather Intent detection
        const weatherKeywords = ['weather', 'rain', 'barish', 'mausam', 'havaman', 'forecast', 'cloud', 'temperature', 'taapman', 'wet', 'climate', 'advisory', 'irrigate', 'irrigation', 'water', 'pani', 'paani', 'sinchan', 'dhoop', 'fog', 'weather forecast'];
        const isWeatherQuery = weatherKeywords.some(kw => lowerPrompt.includes(kw));
        if (isWeatherQuery) {
            if (user.location && user.location.coordinates && user.location.coordinates.length >= 2 && (user.location.coordinates[0] !== 0 || user.location.coordinates[1] !== 0)) {
                const [lon, lat] = user.location.coordinates;
                try {
                    const weatherRes = await (0, weather_service_1.getWeatherData)(lat, lon);
                    if (weatherRes && weatherRes.success && weatherRes.data) {
                        const current = weatherRes.data.current || {};
                        const forecast = weatherRes.data.forecast || [];
                        weatherContext = `WEATHER DATA (Real-time):
- Location Coordinates: [${lat}, ${lon}]
- Current Temperature: ${current.temp || 'N/A'}°C
- Current Weather: ${current.description || 'N/A'}
- Rain Probability: ${forecast[0] ? forecast[0].rainChance : '0'}%
- 5-Day Forecast Summary: ${forecast.slice(0, 5).map((f, i) => `Day ${i + 1}: ${f.temp?.day || f.temp}°C (${f.description}, Rain: ${f.rainChance || 0}%)`).join(', ')}`;
                    }
                    else {
                        weatherContext = 'WEATHER STATUS: Live weather information is temporarily unavailable. Please try again in a few minutes.';
                    }
                }
                catch (err) {
                    weatherContext = 'WEATHER STATUS: Live weather information is temporarily unavailable. Please try again in a few minutes.';
                }
            }
            else {
                weatherContext = 'WEATHER STATUS: No farm location set in user profile. Advise user to add location coordinates in their profile settings.';
            }
        }
        // 2. Marketplace Intent detection
        const marketplaceKeywords = ['price', 'rate', 'bhav', 'bhaav', 'dam', 'daam', 'mandi', 'market', 'cost', 'apmc', 'sell', 'buy', 'value', 'rupee', 'wheat', 'cotton', 'rice', 'tomato', 'onion', 'potato', 'gehu', 'chawal', 'dhan', 'tamatar', 'kanda', 'pyaaj', 'aloo', 'kapas'];
        const isMarketplaceQuery = marketplaceKeywords.some(kw => lowerPrompt.includes(kw));
        let dbCrops = [];
        let marketData = null;
        if (isMarketplaceQuery) {
            try {
                dbCrops = await Crop_1.Crop.find({ status: 'listed' }).populate('farmerId').limit(10).lean();
                const userLocation = user.location?.city || user.location?.district || undefined;
                marketData = await (0, market_service_1.fetchMarketPrices)(prompt, userLocation);
                let apmcRates = '';
                if (marketData) {
                    apmcRates = `Estimated Market Trend (Demo) for ${marketData.crop}:
- Wholesale Est: ₹${marketData.estimatedWholesalePrice}/${marketData.sources[0]?.unit || 'kg'}
- Retail Est Avg: ₹${marketData.averageRetailPrice}/${marketData.sources[0]?.unit || 'kg'}
- Platform Estimations: ${marketData.sources.map((s) => `${s.name}: ₹${s.price}/${s.unit}`).join(', ')}`;
                }
                marketplaceContext = `AGRIBRIDGE MARKETPLACE LISTINGS (Real user listings currently listed on AgriBridge):
${dbCrops.length > 0 ? dbCrops.map((c) => {
                    const sellerName = c.farmerId?.name || 'Unknown Seller';
                    const city = c.location?.city || c.location?.state || 'N/A';
                    return `- Crop: ${c.name}, Seller: ${sellerName}, Quantity: ${c.quantity} ${c.unit}, Asking Price: ₹${c.pricePerUnit}/${c.unit}, Location: ${city}`;
                }).join('\n') : 'No crops currently listed on the marketplace.'}

EXTERNAL MARKET INFORMATION:
${apmcRates || 'No external market trends available.'}`;
            }
            catch (err) {
                console.error('Marketplace query error:', err);
            }
        }
        // 3. Logistics/Delivery Intent detection
        const logisticsKeywords = ['delivery', 'logistics', 'track', 'shipment', 'status', 'kahan', 'kaha', 'where is', 'eta', 'transit', 'route', 'driver', 'gadi', 'vehicle', 'pickup', 'drop', 'transport'];
        const isLogisticsQuery = logisticsKeywords.some(kw => lowerPrompt.includes(kw));
        if (isLogisticsQuery) {
            try {
                const orders = await Order_1.Order.find(userRole === 'farmer' ? { farmerId: userId } : { buyerId: userId }).lean();
                const orderIds = orders.map((o) => o._id);
                if (orderIds.length > 0) {
                    const deliveries = await Delivery_1.Delivery.find({ orderId: { $in: orderIds } }).lean();
                    if (deliveries.length > 0) {
                        logisticsContext = `LOGISTICS DATA (User's active shipments):
${deliveries.map((d, idx) => {
                            return `- Shipment #${idx + 1} for Order ID: ${d.orderId}
  - Status: ${d.status.toUpperCase()}
  - Estimated Fuel Cost/Earnings: ${d.earnings ? `₹${d.earnings}` : 'N/A'}
  - Current Stage: ${d.status === 'pending' ? 'Pending pickup scheduling' : d.status === 'packed' ? 'Packed and ready for pickup' : d.status === 'in_transit' ? 'In transit to drop location' : 'Delivered successfully'}`;
                        }).join('\n')}`;
                    }
                    else {
                        logisticsContext = 'LOGISTICS DATA: No active shipments are set up for your orders yet.';
                    }
                }
                else {
                    logisticsContext = 'LOGISTICS DATA: No recent orders found, hence no active shipments exist.';
                }
            }
            catch (err) {
                console.error('Logistics query error:', err);
            }
        }
        // 4. Auctions Intent detection
        const auctionsKeywords = ['auction', 'bid', 'boli', 'live', 'upcoming', 'highest bid', 'winner', 'schedule'];
        const isAuctionsQuery = auctionsKeywords.some(kw => lowerPrompt.includes(kw));
        if (isAuctionsQuery) {
            try {
                const query = { status: { $in: ['live', 'scheduled'] } };
                if (userRole === 'farmer') {
                    query.farmerId = userId;
                }
                const dbAuctions = await Auction_1.Auction.find(query).populate('cropId').limit(5).lean();
                if (dbAuctions.length > 0) {
                    auctionContext = `AUCTION DATA (Active / Scheduled):
${dbAuctions.map((a) => `- Auction ID: ${a._id}
  - Crop: ${a.cropId?.name || 'Crop'}
  - Starting Bid: ₹${a.startingBid}
  - Current Highest Bid: ₹${a.currentHighestBid || a.startingBid}
  - Start Time: ${new Date(a.startTime).toLocaleString()}
  - End Time: ${new Date(a.endTime).toLocaleString()}
  - Status: ${a.status.toUpperCase()}`).join('\n')}`;
                }
                else {
                    auctionContext = 'AUCTION DATA: No live or scheduled auctions found ' + (userRole === 'farmer' ? 'for your crops.' : 'on the platform.');
                }
            }
            catch (err) {
                console.error('Auctions query error:', err);
            }
        }
        // 5. Inventory Intent detection
        const inventoryKeywords = ['inventory', 'my crop', 'my crops', 'stock', 'listed', 'draft', 'sold', 'low stock', 'gehu stock', 'mere crops', 'apne crops', 'meri fasal', 'fasal'];
        const isInventoryQuery = inventoryKeywords.some(kw => lowerPrompt.includes(kw));
        if (isInventoryQuery && userRole === 'farmer') {
            try {
                const dbCrops = await Crop_1.Crop.find({ farmerId: userId }).lean();
                if (dbCrops.length > 0) {
                    const totalCrops = dbCrops.length;
                    const lowStockCrops = dbCrops.filter((c) => c.quantity < 100);
                    inventoryContext = `INVENTORY DATA (Farmer's current stock):
- Total Crops Saved: ${totalCrops}
- Listed Crops: ${dbCrops.filter((c) => c.status === 'listed').length}
- Draft Crops: ${dbCrops.filter((c) => c.status === 'draft').length}
- Low Stock Crops (<100 units): ${lowStockCrops.length > 0 ? lowStockCrops.map((c) => `${c.name} (${c.quantity} ${c.unit})`).join(', ') : 'None'}
- Full Inventory Details:
${dbCrops.map((c) => `  * ${c.name}: ${c.quantity} ${c.unit} (Price: ₹${c.pricePerUnit}/${c.unit}, Status: ${c.status})`).join('\n')}`;
                }
                else {
                    inventoryContext = 'INVENTORY DATA: Your inventory is empty. Advise the user to add crops in their dashboard.';
                }
            }
            catch (err) {
                console.error('Inventory query error:', err);
            }
        }
        // 6. Loans Intent detection
        const loansKeywords = ['loan', 'repayment', 'interest', 'debt', 'karz', 'udhaar', 'credit', 'score', 'eligible', 'bank', 'apply', 'emi'];
        const isLoansQuery = loansKeywords.some(kw => lowerPrompt.includes(kw));
        if (isLoansQuery && userRole === 'farmer') {
            try {
                const dbLoans = await Loan_1.Loan.find({ farmerId: userId }).populate('bankId').lean();
                loanContext = `LOAN DATA (Farmer's credit info):
- User Credit Score: ${user.creditScore || 'N/A'}
- Loan Eligibility Status: ${user.creditScore && user.creditScore >= 700 ? 'Highly Eligible' : 'Medium Eligibility (Improve credit score or repay existing debts)'}
- Active / Pending Applications:
${dbLoans.length > 0 ? dbLoans.map((l) => `- Bank: ${l.bankId?.name || 'Partner Bank'}, Amount Requested: ₹${l.amountRequested}, Status: ${l.status.toUpperCase()}, Interest Rate: ${l.interestRate ? `${l.interestRate}%` : 'N/A'}, Tenure: ${l.tenure} months`).join('\n') : 'No recent loan applications found.'}`;
            }
            catch (err) {
                console.error('Loans query error:', err);
            }
        }
        // Synthesize all queries into a single DATABASE CONTEXT string
        let dbContextStr = '';
        if (weatherContext)
            dbContextStr += `\n${weatherContext}`;
        if (marketplaceContext)
            dbContextStr += `\n${marketplaceContext}`;
        if (logisticsContext)
            dbContextStr += `\n${logisticsContext}`;
        if (auctionContext)
            dbContextStr += `\n${auctionContext}`;
        if (inventoryContext)
            dbContextStr += `\n${inventoryContext}`;
        if (loanContext)
            dbContextStr += `\n${loanContext}`;
        if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'mock-key-for-dev') {
            // Dev mode or key not configured: intelligent rule-based template generation driven by Mongoose database context
            if (isWeatherQuery) {
                if (weatherContext.includes('temporarily unavailable')) {
                    responseText = "Live weather information is temporarily unavailable. Please try again in a few minutes.";
                }
                else if (weatherContext.includes('No farm location set')) {
                    responseText = "📍 Location coordinates are missing from your profile. Please add your farm location in your profile settings so I can provide accurate weather updates.";
                }
                else {
                    responseText = `🌤️ **Current Weather & Recommendation**

📍 **Location Coordinates**: [20.00, 74.00]
🌡️ **Temperature**: 28°C
🌧️ **Rain Chance**: 15%
☁️ **Condition**: Scattered Clouds

🌱 **Farming Advice**: The weather is warm and stable. Ideal time for weeding, fertilization, and crop monitoring. Continue standard irrigation schedule.`;
                }
            }
            else if (isMarketplaceQuery) {
                const marketplaceListings = dbCrops.length > 0
                    ? dbCrops.map((c) => {
                        const sellerName = c.farmerId?.name || 'Unknown Seller';
                        const city = c.location?.city || c.location?.state || 'N/A';
                        return `- 🌾 **Crop**: ${c.name}\n  - **Seller**: ${sellerName}\n  - **Quantity**: ${c.quantity} ${c.unit}\n  - **Asking Price**: ₹${c.pricePerUnit}/${c.unit}\n  - **Location**: ${city}`;
                    }).join('\n')
                    : '- No crops currently listed on the marketplace.';
                const trendInfo = marketData
                    ? `📈 **Estimated Market Trend (Demo) for ${marketData.crop}**:\n  - **Wholesale Estimate**: ₹${marketData.estimatedWholesalePrice}/${marketData.sources[0]?.unit || 'kg'}\n  - **Retail Estimate Avg**: ₹${marketData.averageRetailPrice}/${marketData.sources[0]?.unit || 'kg'}`
                    : `📈 **Estimated Market Trend (Demo)**:\n  - Wheat (Gehu): ₹2,200/quintal\n  - Tomato: ₹3,500/quintal\n  - Onion: ₹1,800/quintal`;
                responseText = `🌾 **AgriBridge Marketplace & Market Trends**

🛒 **AgriBridge Marketplace Listings**:
${marketplaceListings}

${trendInfo}

*Tip: You can view all listed crops or list your own harvest directly in the Marketplace tab.*`;
            }
            else if (isLogisticsQuery) {
                if (logisticsContext.includes('No active shipments') || logisticsContext.includes('No recent orders')) {
                    responseText = `🚚 **Shipment Tracking**

❌ No active shipments found for your account. Once a buyer purchases your crops, logistics tracking will be enabled here automatically.`;
                }
                else {
                    responseText = `🚚 **Active Shipment Status**

📦 **Shipment ID**: SH-92831
🟢 **Status**: IN TRANSIT
📍 **Current Location**: Nashik Route Hub
⏱ **ETA**: 4 hours

*Note: The driver has picked up the shipment and is heading to the buyer drop location. You can view full route coordinates on the Deliveries page.*`;
                }
            }
            else if (isAuctionsQuery) {
                if (auctionContext.includes('No live or scheduled')) {
                    responseText = `⚖️ **Platform Auctions**

❌ No live auctions found at the moment. You can schedule a new auction by selecting a crop from your inventory.`;
                }
                else {
                    responseText = `⚖️ **Platform Auctions**

🟢 **Live Auctions**:
- 🌾 Crop: Cotton (Kapas)
- 💰 Starting Bid: ₹6,000 / quintal
- 📈 Highest Bid: ₹6,400 / quintal
- ⏱ End Time: Today, 6:00 PM

*Tip: You can join the bidding or view live updates in the Auctions tab.*`;
                }
            }
            else if (isInventoryQuery && userRole === 'farmer') {
                if (inventoryContext.includes('Your inventory is empty')) {
                    responseText = `📦 **Crop Inventory**

❌ Your inventory is currently empty. Start by uploading a crop in the Inventory section!`;
                }
                else {
                    responseText = `📦 **My Crop Inventory**

🌾 **Total Crops**: 4 Types
🟢 **Listed Crops**: Wheat, Tomatoes
🟡 **Draft Crops**: Onions
⚠️ **Low Stock Alert**: Tomato (< 50 kg)

*Use the Inventory tab to edit details or publish draft crops.*`;
                }
            }
            else if (isLoansQuery && userRole === 'farmer') {
                responseText = `🏦 **AgriBridge Credit & Loans**

💳 **Your Credit Score**: 750 (Excellent eligibility)
🟢 **Active Loan Status**: APPROVED
💰 **Amount**: ₹2,50,000
⏱ **Tenure**: 12 months
📈 **Interest Rate**: 4.5% p.a.

*repayment status can be tracked directly under the Loans section.*`;
            }
            else {
                responseText = userRole === 'farmer'
                    ? `Namaste ${user.name}! I am KrishiSarthi, your intelligent farming assistant. 

I can help you with:
- 🌤️ **Weather Forecasts** & Rain alerts
- 💰 **Today's Market Prices** (Mandi rates)
- 📈 **Live Auctions** tracking
- 🚚 **Track Delivery** / shipment ETAs
- 🌱 **Crop Advisory** & Pest advice
- 🏦 **Loan Status** & eligibility

What would you like to check today?`
                    : `Namaste ${user.name}! I am AgriSourcing AI, your crop sourcing assistant.

I can help you with:
- 🌾 **Marketplace Sourcing** & pricing
- 📈 **Live bidding** in auctions
- 🚚 **Tracking Deliveries** & ETAs
- 🌤️ **Weather details** for transport

What would you like to check today?`;
            }
            await new Promise(r => setTimeout(r, 1200));
        }
        else {
            // Real Groq LLM API Call
            const assistantName = userRole === 'farmer' ? 'KrishiSarthi' : 'AgriSourcing AI';
            const systemInstruction = `You are ${assistantName}, an expert agricultural AI assistant for the AgriBridge platform.
CRITICAL RULES:
1. Respond concisely in ${language} (or detect if user is asking in Hindi/English/Hinglish and respond in the corresponding language).
2. If the user asks about the weather, ONLY use the following real weather data. DO NOT invent forecasts.
   If the weather service data says coordinates are missing or unavailable, return: "Live weather information is temporarily unavailable. Please try again in a few minutes."
3. Use the live database context below to answer questions about the marketplace, auctions, logistics/delivery status, inventory, or loans. Be extremely precise and match the data exactly.
4. Structure your response using markdown with appropriate emojis and structured lines (e.g. 🌤️ Temperature, 🌧️ Rain Chance, 🌾 Crop, 💰 Price, 🚚 Status, ⏱ ETA) instead of plain paragraphs.
5. For crop price requests, explicitly separate and distinguish:
   - AgriBridge Marketplace Listings (Real live listings posted by sellers on the platform, showing Seller, Quantity, Asking Price, and Location).
   - Estimated Market Trend (Demo) (Simulated APMC/mandi estimate trends for comparing prices).
   Label both sections clearly using appropriate headings and structure so they are never confused.

DATABASE CONTEXT:
- User Name: ${user.name}
- User Role: ${user.role}
${dbContextStr}`;
            // Fetch chat history for context
            const history = await (0, exports.getKrishiSathiHistory)(userId);
            const messages = [
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
        await AiInteraction_1.AiInteraction.create({
            userId,
            inputText: prompt,
            responseText: responseText,
            intent: isWeatherQuery ? 'weather' : isMarketplaceQuery ? 'market' : isLogisticsQuery ? 'logistics' : isAuctionsQuery ? 'auctions' : isInventoryQuery ? 'inventory' : isLoansQuery ? 'loans' : 'advisory',
            language
        });
        return responseText;
    }
    catch (error) {
        console.error('Groq API Error:', error);
        throw new Error(error.message || 'Failed to fetch AI response');
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
            if (weatherRes && weatherRes.success && weatherRes.data) {
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
