"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.safeUpload = void 0;
const cloudinary_1 = require("cloudinary");
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo',
    api_key: process.env.CLOUDINARY_API_KEY || 'api_key',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'api_secret'
});
// Safe upload wrapper that falls back to returning the base64 string
const safeUpload = async (image, options) => {
    if (!process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY === 'api_key') {
        return { secure_url: image };
    }
    return await cloudinary_1.v2.uploader.upload(image, options);
};
exports.safeUpload = safeUpload;
exports.default = cloudinary_1.v2;
