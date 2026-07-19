"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWeatherData = void 0;
const getWeatherData = async (lat, lon) => {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey || apiKey === 'your_key_here') {
        return {
            error: true,
            message: 'OPENWEATHER_API_KEY is not configured.'
        };
    }
    try {
        const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`OpenWeather API error: ${response.statusText}`);
        }
        const data = await response.json();
        // OpenWeather API returns 3-hour interval data for 5 days.
        // Let's get the current weather from the first element.
        const current = data.list[0];
        // Group forecast by day
        const dailyForecasts = [];
        const seenDays = new Set();
        for (const item of data.list) {
            const date = new Date(item.dt * 1000);
            const day = date.toISOString().split('T')[0];
            if (!seenDays.has(day)) {
                seenDays.add(day);
                dailyForecasts.push({
                    date: day,
                    temp: item.main.temp,
                    description: item.weather[0].description,
                    rainChance: item.pop * 100 // pop is probability of precipitation 0-1
                });
            }
        }
        return {
            success: true,
            data: {
                current: {
                    temp: current.main.temp,
                    description: current.weather[0].description,
                    rainChance: current.pop * 100
                },
                forecast: dailyForecasts.slice(0, 5) // Return 5 days
            }
        };
    }
    catch (error) {
        console.error('Weather Service Error:', error);
        return {
            error: true,
            message: 'Failed to fetch weather data.'
        };
    }
};
exports.getWeatherData = getWeatherData;
