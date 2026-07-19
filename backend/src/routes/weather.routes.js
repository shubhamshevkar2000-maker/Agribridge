"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const User_1 = require("../models/User");
const weather_service_1 = require("../services/weather.service");
const router = (0, express_1.Router)();
router.get('/farmer', auth_middleware_1.protect, async (req, res) => {
    try {
        const user = await User_1.User.findById(req.user.id);
        if (!user || !user.location || !user.location.coordinates || user.location.coordinates.length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Farm location not set in profile. Please add your location first.'
            });
        }
        const [lon, lat] = user.location.coordinates;
        const weatherRes = await (0, weather_service_1.getWeatherData)(lat, lon);
        if (weatherRes.error) {
            return res.json({
                success: false,
                message: weatherRes.message,
                code: 'API_ERROR'
            });
        }
        res.json({ success: true, data: weatherRes.data });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
exports.default = router;
