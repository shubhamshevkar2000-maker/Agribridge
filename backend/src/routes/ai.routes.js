"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const ai_service_1 = require("../services/ai.service");
const router = (0, express_1.Router)();
router.post('/chat', auth_middleware_1.protect, async (req, res) => {
    try {
        const { prompt, language } = req.body;
        const response = await (0, ai_service_1.getKrishiSathiResponse)(req.user.id, prompt, language);
        res.json({ success: true, data: { response } });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
router.get('/history', auth_middleware_1.protect, async (req, res) => {
    try {
        const history = await (0, ai_service_1.getKrishiSathiHistory)(req.user.id);
        res.json({ success: true, data: history });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
router.get('/insights', auth_middleware_1.protect, async (req, res) => {
    try {
        const insight = await (0, ai_service_1.generateDashboardInsights)(req.user.id);
        res.json({ success: true, data: { insight } });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
exports.default = router;
