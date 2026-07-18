"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cloudinary_1 = require("cloudinary");
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo',
    api_key: process.env.CLOUDINARY_API_KEY || 'api_key',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'api_secret'
});
exports.default = cloudinary_1.v2;
