"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cloudinary_1 = require("./src/config/cloudinary");
async function run() {
    try {
        const res = await (0, cloudinary_1.safeUpload)('data:image/png;base64,iVBORw...', { folder: 'test' });
        console.log('Result:', res);
    }
    catch (err) {
        console.error('Error:', err.message);
    }
}
run();
