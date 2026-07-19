"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const protect = (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.toLowerCase().startsWith('bearer')) {
        try {
            const parts = req.headers.authorization.split(/\s+/);
            token = parts[1];
            if (!token || token === 'null' || token === 'undefined') {
                return res.status(401).json({ success: false, message: 'Not authorized, no token' });
            }
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'fallback_secret');
            req.user = {
                id: decoded.id,
                role: decoded.role
            };
            next();
        }
        catch (error) {
            return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
        }
    }
    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }
};
exports.protect = protect;
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ success: false, message: 'Not authorized to access this route' });
        }
        next();
    };
};
exports.authorize = authorize;
