"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const token = jsonwebtoken_1.default.sign({ id: '6a56126a798409c2bcef3971' }, process.env.JWT_SECRET || 'super_secret_key_123', { expiresIn: '1d' });
console.log(token);
